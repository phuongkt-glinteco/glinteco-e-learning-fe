export const API_PREFIX = '/api/v1';
export const DEFAULT_API_BASE_URL = 'https://be-teal-tau.vercel.app/api/v1';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getConfiguredApiBaseUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL);
}

export function getApiOrigin(baseUrl = getConfiguredApiBaseUrl()) {
  const normalized = trimTrailingSlash(baseUrl);
  return normalized.endsWith(API_PREFIX)
    ? normalized.slice(0, -API_PREFIX.length)
    : normalized;
}

export function getApiClientBaseUrl() {
  return getApiOrigin();
}

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const prefixedPath = normalizedPath.startsWith(API_PREFIX)
    ? normalizedPath
    : `${API_PREFIX}${normalizedPath}`;

  return `${getApiOrigin()}${prefixedPath}`;
}
