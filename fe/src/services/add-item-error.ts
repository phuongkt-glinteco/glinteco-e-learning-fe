import type { ErrorProcessorPipeline, CreateHandlerParams, ErrorHandler } from './error-mapper';

export function registerAddItemErrors(
  pipeline: ErrorProcessorPipeline,
  createHandler: (params: CreateHandlerParams) => ErrorHandler,
) {
  // Session expired -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'session-expired',
      stage: 'BACKEND_ITEM',
      statusCode: '401',
      errorCode: 'SESSION_EXPIRED',
      requestPath: '/auth/refresh',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Forbidden -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'forbidden',
      stage: 'BACKEND_ITEM',
      statusCode: '403',
      errorCode: 'FORBIDDEN',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Bookmark/Unbookmark error -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'bookmark-error',
      stage: 'BACKEND_ITEM',
      requestPath: '/bookmark',
      errorCode: 'BOOKMARK_FAILED',
      action: 'ADD_TO_ITEMS',
    }),
  );

  // Catch-all -> toast
  pipeline.injectHandler(
    createHandler({
      name: 'system-error',
      stage: 'BACKEND_UNKNOWN',
      errorCode: 'SYSTEM_ERROR',
      action: 'ADD_TO_ITEMS',
    }),
  );
}
