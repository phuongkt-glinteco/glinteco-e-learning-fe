import type { ErrorProcessorPipeline, CreateHandlerParams, ErrorHandler } from './error-mapper';

export function registerUiShowErrors(
  pipeline: ErrorProcessorPipeline,
  createHandler: (params: CreateHandlerParams) => ErrorHandler,
) {
  // Register: email already exists → inline
  pipeline.injectHandler(
    createHandler({
      name: 'register-email-exists',
      priority: 1,
      statusCode: '409',
      messageIncludes: ['email'],
      errorCode: 'REGISTER_EMAIL_EXISTS',
      action: 'FINAL_THROW',
    }),
  );

  // Login: invalid credentials → inline
  pipeline.injectHandler(
    createHandler({
      name: 'login-invalid-credentials',
      priority: 1,
      statusCode: '401',
      requestPath: '/auth/login',
      errorCode: 'LOGIN_INVALID_CREDENTIALS',
      action: 'FINAL_THROW',
    }),
  );

  // Create exercise: title already exists → inline
  pipeline.injectHandler(
    createHandler({
      name: 'create-exercise-title-exists',
      priority: 1,
      statusCode: '409',
      requestPath: '/exercises',
      messageIncludes: ['title'],
      errorCode: 'EXERCISE_TITLE_EXISTS',
      action: 'FINAL_THROW',
    }),
  );

  // Delete exercise: not found → inline
  pipeline.injectHandler(
    createHandler({
      name: 'delete-exercise-not-found',
      priority: 1,
      statusCode: '404',
      requestPath: '/exercises',
      errorCode: 'NOT_FOUND',
      action: 'FINAL_THROW',
    }),
  );

  // Delete exercise: forbidden → inline
  pipeline.injectHandler(
    createHandler({
      name: 'delete-exercise-forbidden',
      priority: 1,
      statusCode: '403',
      requestPath: '/exercises',
      errorCode: 'FORBIDDEN',
      action: 'FINAL_THROW',
    }),
  );
}
