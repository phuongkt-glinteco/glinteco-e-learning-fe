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
}
