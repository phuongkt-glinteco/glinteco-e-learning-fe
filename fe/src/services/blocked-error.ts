import type { ErrorProcessorPipeline, CreateHandlerParams, ErrorHandler } from './error-mapper';

export function registerBlockedErrors(
  pipeline: ErrorProcessorPipeline,
  createHandler: (params: CreateHandlerParams) => ErrorHandler,
) {
  // Offline / Network connection error -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'network-error',
      stage: 'BLOCKED_KNOWN',
      statusCode: '0',
      errorCode: 'NETWORK_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // CORS or browser blocked request -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'cors-error',
      stage: 'BLOCKED_KNOWN',
      messageIncludes: ['cors', 'access-control', 'blocked by client'],
      errorCode: 'NETWORK_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Rate limit exceeded (HTTP 429) -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'rate-limited',
      stage: 'BLOCKED_KNOWN',
      statusCode: '429',
      errorCode: 'RATE_LIMITED',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Server down / Gateway timeout (502, 503, 504) -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'server-unavailable',
      stage: 'BLOCKED_KNOWN',
      statusCode: '502,503,504',
      errorCode: 'SYSTEM_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Catch-all for unknown blocked requests -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'unknown-blocked',
      stage: 'BLOCKED_UNKNOWN',
      errorCode: 'NETWORK_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );
}
