import { client } from './client/client.gen';
import { mapBackendError } from './error-mapper';

// Configure the correct dynamic base URL from environment variables
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || client.getConfig().baseUrl,
});

/**
 * Programmatically triggers a global API error popup.
 * Useful for manual error handling or testing.
 */
export function triggerApiError(code: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { code } }));
  }
}

// Register the response error interceptor globally
client.interceptors.error.use((error, response, request) => {
  // Map the raw error payload/HTTP status to our custom AppError
  const mappedError = mapBackendError(error, response, request);
  
  // Dispatch custom event for global error UI component
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: mappedError }));
  }

  // Returning the mapped error here will cause the hey-api client to throw it as the final error
  return mappedError;
});

// Re-export the global client and all auto-generated SDK endpoints/types
export { client };
export * from './client';
