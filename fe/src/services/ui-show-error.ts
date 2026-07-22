import type { ErrorProcessorPipeline, CreateHandlerParams, ErrorHandler } from './error-mapper';

export function registerUiShowErrors(
  pipeline: ErrorProcessorPipeline,
  createHandler: (params: CreateHandlerParams) => ErrorHandler,
) {
  for (const [messageIncludes, errorCode] of [
    ['TRACK_INACTIVE', 'TRACK_INACTIVE'],
    ['EXERCISE_LOCKED', 'EXERCISE_LOCKED'],
    ['EXERCISE_NOT_FOUND', 'EXERCISE_NOT_FOUND'],
  ] as const) {
    pipeline.injectHandler(
      createHandler({
        name: `exercise-${errorCode.toLowerCase()}`,
        stage: 'BACKEND_UI',
        requestPath: '/exercises',
        statusCode: errorCode === 'EXERCISE_NOT_FOUND' ? '404' : '403',
        messageIncludes: [messageIncludes],
        errorCode,
        action: 'FINAL_THROW',
      }),
    );
  }

  // Register: email already exists or invalid data -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'register-email-exists',
      stage: 'BACKEND_UI',
      requestPath: '/auth/register',
      statusCode: '400',
      messageIncludes: ['email', 'tồn tại'],
      errorCode: 'REGISTER_EMAIL_EXISTS',
      action: 'FINAL_THROW',
    }),
  );

  // Login: invalid credentials -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'login-invalid-credentials',
      stage: 'BACKEND_UI',
      statusCode: '401',
      requestPath: '/auth/login',
      errorCode: 'LOGIN_INVALID_CREDENTIALS',
      action: 'FINAL_THROW',
    }),
  );

  // Create exercise: title already exists -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'create-exercise-title-exists',
      stage: 'BACKEND_UI',
      statusCode: '400',
      requestPath: '/exercises',
      messageIncludes: ['title', 'tồn tại'],
      errorCode: 'EXERCISE_TITLE_EXISTS',
      action: 'FINAL_THROW',
    }),
  );

  // Delete exercise: not found -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'delete-exercise-not-found',
      stage: 'BACKEND_UI',
      statusCode: '404',
      requestPath: '/exercises',
      errorCode: 'NOT_FOUND',
      action: 'FINAL_THROW',
    }),
  );

  // Delete exercise: forbidden -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'delete-exercise-forbidden',
      stage: 'BACKEND_UI',
      statusCode: '403',
      requestPath: '/exercises',
      errorCode: 'FORBIDDEN',
      action: 'FINAL_THROW',
    }),
  );

  // Exercise submission errors -> inline
  pipeline.injectHandler(
    createHandler({
      name: 'submit-exercise-error',
      stage: 'BACKEND_UI',
      requestPath: '/submissions',
      statusCode: '4XX,5XX',
      errorCode: 'SUBMIT_EXERCISE_FAILED',
      action: 'FINAL_THROW',
    }),
  );
}
