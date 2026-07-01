import { HttpError, ApiError, UiShowError } from './errors';
import { registerAddItemErrors } from './add-item-error';
import { registerUiShowErrors } from './ui-show-error';

// ───  A c t i o n   &   H a n d l e r  ─────────────────────────────

export type HandlerAction =
  | { type: 'CONTINUE'; error: Error }
  | { type: 'ADD_TO_ITEMS'; errorItem: UiShowError }
  | { type: 'FINAL_THROW'; error: UiShowError };

export interface ErrorHandler {
  name: string;
  priority: number;
  canHandle: (error: Error) => boolean;
  handle: (error: Error) => HandlerAction;
}

// ───  P i p e l i n e  ──────────────────────────────────────────────

export class ErrorProcessorPipeline {
  private handlers: ErrorHandler[] = [];

  injectHandler(handler: ErrorHandler): this {
    this.handlers.push(handler);
    return this;
  }

  process(initialError: Error): { errorItems: UiShowError[] } {
    let current = initialError;
    const errorItems: UiShowError[] = [];
    let finalThrow: UiShowError | null = null;
    let handled = false;

    const priorityGroups: Record<number, ErrorHandler[]> = {
      0: [],
      1: [],
      2: [],
    };

    for (const h of this.handlers) {
      const p = h.priority ?? 0;
      if (priorityGroups[p]) {
        priorityGroups[p].push(h);
      } else {
        priorityGroups[p] = [h];
      }
    }

    for (let p = 0; p <= 2; p++) {
      if (p === 2 && handled) {
        break;
      }

      const handlers = priorityGroups[p] || [];
      for (const h of handlers) {
        if (!h.canHandle(current)) continue;

        handled = true;
        const action = h.handle(current);

        if (action.type === 'CONTINUE') {
          current = action.error;
        } else if (action.type === 'ADD_TO_ITEMS') {
          errorItems.push(action.errorItem);
        } else if (action.type === 'FINAL_THROW') {
          finalThrow = action.error;
        }
      }

      if (finalThrow) {
        throw finalThrow;
      }
    }

    return { errorItems };
  }
}

export const pipeline = new ErrorProcessorPipeline();

// ───  H a n d l e r   C r e a t o r  ────────────────────────────────

export interface CreateHandlerParams {
  name: string;
  priority: number;
  statusCode?: string;
  messageIncludes?: string[];
  requestPath?: string;
  errorCode: string;
  action?: 'CONTINUE' | 'ADD_TO_ITEMS' | 'FINAL_THROW';
}

function buildStatusMatcher(pattern: string): (status: number) => boolean {
  if (pattern === 'ERROR' || pattern === '4XX,5XX') {
    return (s) => Number(s) >= 400;
  }
  if (pattern.endsWith('XX')) {
    const prefix = pattern[0];
    return (s) => String(s).startsWith(prefix);
  }
  return (s) => String(s) === pattern;
}

function matchHandlerError(
  error: Error,
  params: CreateHandlerParams,
): boolean {
  if (params.statusCode) {
    if (!(error instanceof ApiError) || error.status === undefined) return false;
    if (!buildStatusMatcher(params.statusCode)(error.status)) return false;
  }

  if (params.messageIncludes) {
    const msg = (error.message || '').toLowerCase();
    const has = params.messageIncludes.some((incl) =>
      msg.includes(incl.toLowerCase()),
    );
    if (!has) return false;
  }

  if (params.requestPath) {
    if (!(error instanceof ApiError) || !error.requestPath) return false;
    if (
      !error.requestPath
        .toLowerCase()
        .includes(params.requestPath.toLowerCase())
    )
      return false;
  }

  return true;
}

export function createHandler(
  params: CreateHandlerParams,
): ErrorHandler {
  return {
    name: params.name,
    priority: params.priority,
    canHandle: (error) => matchHandlerError(error, params),
    handle: (error) => {
      const action = params.action ?? 'FINAL_THROW';
      if (action === 'ADD_TO_ITEMS') {
        return { type: 'ADD_TO_ITEMS', errorItem: new UiShowError(params.errorCode, params.name) };
      }
      if (action === 'CONTINUE') {
        return { type: 'CONTINUE', error };
      }
      return { type: 'FINAL_THROW', error: new UiShowError(params.errorCode, params.name) };
    },
  };
}

// ───  B u i l t - i n   H a n d l e r s  ────────────────────────────

registerAddItemErrors(pipeline, createHandler);
registerUiShowErrors(pipeline, createHandler);

// ───  C l a s s i f i c a t i o n  ─────────────────────────────────

interface BE {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function getErrorField(error: unknown, field: 'name' | 'message' | 'statusCode' | 'status') {
  if (typeof error !== 'object' || error === null || !(field in error)) return undefined;
  return (error as Record<typeof field, unknown>)[field];
}

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const be = err as BE;
    if (be.message) return Array.isArray(be.message) ? be.message.join(', ') : be.message;
    if (be.error) return be.error;
  }
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred.';
}

const STATUS_MAP: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_SERVER_ERROR',
};

export function classify(
  error: unknown,
  response?: Response,
  request?: Request,
): Error {
  if (error instanceof HttpError || error instanceof ApiError || error instanceof UiShowError) return error;

  const requestPath = request?.url || undefined;
  const errorName = getErrorField(error, 'name');
  const errorMessage = getErrorField(error, 'message');

  const isNetwork =
    (typeof window !== 'undefined' && !window.navigator.onLine) ||
    error instanceof TypeError ||
    errorName === 'TypeError' ||
    (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('fetch')) ||
    (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('network')) ||
    !response;

  if (isNetwork && !response) {
    return new HttpError(0, 'Cannot connect to the server.');
  }

  const statusCode = getErrorField(error, 'statusCode');
  const status = getErrorField(error, 'status');
  const sc = (response && !response.ok ? response.status : undefined)
    || (typeof statusCode === 'number' ? statusCode : undefined)
    || (typeof status === 'number' ? status : undefined);
  if (sc && sc >= 400) {
    const msg = extractMessage(error);
    const code = STATUS_MAP[sc] || 'UNKNOWN_ERROR';
    return new ApiError(code, msg, sc, requestPath);
  }

  return new ApiError('UNKNOWN_ERROR', extractMessage(error));
}
