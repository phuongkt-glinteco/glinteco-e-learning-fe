import { HttpError, BlockedError, ApiError, UiShowError } from './errors';
import { registerBlockedErrors } from './blocked-error';
import { registerAddItemErrors } from './add-item-error';
import { registerUiShowErrors } from './ui-show-error';

// ───  F i l t e r   S t a g e   &   H a n d l e r  ─────────────────────────────

export type FilterStage =
  | 'BLOCKED_KNOWN'
  | 'BLOCKED_UNKNOWN'
  | 'BACKEND_UI'
  | 'BACKEND_ITEM'
  | 'BACKEND_UNKNOWN';

export type HandlerAction =
  | { type: 'CONTINUE'; error: Error }
  | { type: 'ADD_TO_ITEMS'; errorItem: UiShowError }
  | { type: 'FINAL_THROW'; error: UiShowError };

export interface ErrorHandler {
  name: string;
  stage: FilterStage;
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

    const stageGroups: Record<FilterStage, ErrorHandler[]> = {
      BLOCKED_KNOWN: [],
      BLOCKED_UNKNOWN: [],
      BACKEND_UI: [],
      BACKEND_ITEM: [],
      BACKEND_UNKNOWN: [],
    };

    for (const h of this.handlers) {
      if (stageGroups[h.stage]) {
        stageGroups[h.stage].push(h);
      }
    }

    const isBlocked = current instanceof BlockedError || current instanceof HttpError;
    const sequence: FilterStage[] = isBlocked
      ? ['BLOCKED_KNOWN', 'BLOCKED_UNKNOWN']
      : ['BACKEND_UI', 'BACKEND_ITEM', 'BACKEND_UNKNOWN'];

    for (const stage of sequence) {
      if ((stage === 'BLOCKED_UNKNOWN' || stage === 'BACKEND_UNKNOWN') && handled) {
        break;
      }

      const handlers = stageGroups[stage] || [];
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
  stage: FilterStage;
  statusCode?: string;
  messageIncludes?: string[];
  requestPath?: string;
  errorCode: string;
  action?: 'CONTINUE' | 'ADD_TO_ITEMS' | 'FINAL_THROW';
}

function buildStatusMatcher(pattern: string): (status: number) => boolean {
  if (pattern.includes(',')) {
    const parts = pattern.split(',').map((p) => p.trim());
    return (s) => parts.some((p) => buildStatusMatcher(p)(s));
  }
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
    if (!(error instanceof ApiError) && !(error instanceof BlockedError) && !(error instanceof HttpError)) return false;
    const status = 'status' in error ? (error as { status?: number }).status : undefined;
    if (status === undefined || !buildStatusMatcher(params.statusCode)(status)) return false;
  }

  if (params.messageIncludes) {
    const msg = (error.message || '').toLowerCase();
    const has = params.messageIncludes.some((incl) =>
      msg.includes(incl.toLowerCase()),
    );
    if (!has) return false;
  }

  if (params.requestPath) {
    const reqPath = 'requestPath' in error ? (error as { requestPath?: unknown }).requestPath : undefined;
    if (!reqPath || typeof reqPath !== 'string') return false;
    if (
      !reqPath
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
    stage: params.stage,
    canHandle: (error) => matchHandlerError(error, params),
    handle: (error) => {
      const action = params.action ?? 'FINAL_THROW';
      if (action === 'ADD_TO_ITEMS') {
        return { type: 'ADD_TO_ITEMS', errorItem: new UiShowError(params.errorCode, params.name) };
      }
      if (action === 'CONTINUE') {
        return { type: 'CONTINUE', error };
      }
      window?.console?.error(`Unhandled error: ${error.message}`, error.stack, error.name, error.cause?.toString());
      if (!window) {
        return { type: 'FINAL_THROW', error: new UiShowError(params.errorCode, 'UwU') };
      }
      return { type: 'FINAL_THROW', error: new UiShowError(params.errorCode, params.name) };
    },
  };
}

// ───  B u i l t - i n   H a n d l e r s  ────────────────────────────

registerBlockedErrors(pipeline, createHandler);
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
  502: 'SERVER_UNAVAILABLE',
  503: 'SERVER_UNAVAILABLE',
  504: 'SERVER_UNAVAILABLE',
};

export function classify(
  error: unknown,
  response?: Response,
  request?: Request,
): Error {
  if (error instanceof BlockedError || error instanceof HttpError || error instanceof ApiError || error instanceof UiShowError) return error;

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
    return new BlockedError('NETWORK_ERROR', 'Cannot connect to the server.', 0, requestPath);
  }

  const statusCode = getErrorField(error, 'statusCode');
  const status = getErrorField(error, 'status');
  const sc = (response && !response.ok ? response.status : undefined)
    || (typeof statusCode === 'number' ? statusCode : undefined)
    || (typeof status === 'number' ? status : undefined);

  if (sc === 429 || sc === 502 || sc === 503 || sc === 504) {
    const msg = extractMessage(error);
    const code = STATUS_MAP[sc] || 'SERVER_UNAVAILABLE';
    return new BlockedError(code, msg, sc, requestPath);
  }

  if (sc && sc >= 400) {
    const msg = extractMessage(error);
    const code = STATUS_MAP[sc] || 'UNKNOWN_ERROR';
    return new ApiError(code, msg, sc, requestPath);
  }

  return new ApiError('UNKNOWN_ERROR', extractMessage(error));
}
