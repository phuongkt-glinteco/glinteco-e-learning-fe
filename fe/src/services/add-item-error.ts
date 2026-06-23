import type { ErrorProcessorPipeline, CreateHandlerParams, ErrorHandler } from './error-mapper';

export function registerAddItemErrors(
  pipeline: ErrorProcessorPipeline,
  createHandler: (params: CreateHandlerParams) => ErrorHandler,
) {
  // Generic network/HTTP errors → toast
  pipeline.injectHandler(
    createHandler({
      name: 'network-error',
      priority: 0,
      statusCode: '0',
      errorCode: 'NETWORK_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Session expired → toast
  pipeline.injectHandler(
    createHandler({
      name: 'session-expired',
      priority: 0,
      statusCode: '401',
      errorCode: 'SESSION_EXPIRED',
      requestPath: '/auth/refresh',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Forbidden → toast
  pipeline.injectHandler(
    createHandler({
      name: 'forbidden',
      priority: 0,
      statusCode: '403',
      errorCode: 'FORBIDDEN',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Catch-all → toast
  pipeline.injectHandler(
    createHandler({
      name: 'system-error',
      priority: 2,
      errorCode: 'SYSTEM_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );
}
