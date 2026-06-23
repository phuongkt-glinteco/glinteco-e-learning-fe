import { AppError, HttpError, ValidationError } from './errors';

interface BackendErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

function getStringProperty(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object' || !(key in value)) return undefined;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === 'string' ? property : undefined;
}

function getNumberProperty(value: unknown, key: string): number | undefined {
  if (!value || typeof value !== 'object' || !(key in value)) return undefined;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === 'number' ? property : undefined;
}

/**
 * Maps raw client/network errors and HTTP responses to standardized AppError instances.
 * 
 * @param error The raw error object thrown by the HTTP client (usually parsed JSON error or string).
 * @param response The HTTP Response object (provided by hey-api interceptor).
 * @param request The HTTP Request object (provided by hey-api interceptor).
 */
export function mapBackendError(
  error: unknown,
  response?: Response,
  request?: Request
): AppError {
  // If it's already an AppError, return it directly
  if (error instanceof AppError) {
    return error;
  }

  // Handle browser offline or network request failure (no response returned)
  
  const errorName = getStringProperty(error, 'name');
  const errorMessage = getStringProperty(error, 'message');
  const isNetworkError = 
    (typeof window !== 'undefined' && !window.navigator.onLine) ||
    error instanceof TypeError ||
    errorName === 'TypeError' ||
    errorMessage?.toLowerCase().includes('fetch') ||
    errorMessage?.toLowerCase().includes('network') ||
    !response;

  if (isNetworkError && !response) {
    return new AppError(
      'Cannot connect to the server. Please check your internet connection.',
      'NETWORK_ERROR'
    );
  }

  // Extract HTTP status code from Response object or error payload
  const statusCode =
    response?.status ||
    getNumberProperty(error, 'statusCode') ||
    getNumberProperty(error, 'status');

  if (statusCode) {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred.';

    // Extract message from standard backend envelope (statusCode, message, error)
    if (error && typeof error === 'object') {
      const backendError = error as BackendErrorResponse;
      if (backendError.message) {
        message = Array.isArray(backendError.message)
          ? backendError.message.join(', ')
          : backendError.message;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Determine url context
    const url = request?.url || '';

    // Map HTTP Status and Request URL Context to Frontend Error Codes
    switch (statusCode) {
      case 400:
        return new ValidationError(message, error);
        break;
      case 401:
        if (url.includes('/auth/login')) {
          code = 'LOGIN_INVALID_CREDENTIALS';
        } else {
          code = 'UNAUTHORIZED';
        }
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 500:
        code = 'INTERNAL_SERVER_ERROR';
        break;
      default:
        code = 'UNKNOWN_ERROR';
    }

    return new HttpError(message, code, statusCode, error);
  }

  // Fallback for general JavaScript runtime errors
  return new AppError(
    errorMessage || 'An unexpected error occurred.',
    'UNKNOWN_ERROR'
  );
}
