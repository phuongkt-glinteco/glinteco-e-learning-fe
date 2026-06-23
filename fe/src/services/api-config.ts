const API_PREFIX = '/api/v1';
const LOCAL_API_BASE_URL = `http://localhost:5000${API_PREFIX}`;
const PRODUCTION_API_BASE_URL = `https://be-teal-tau.vercel.app${API_PREFIX}`;

function withApiPrefix(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

export const API_BASE_URL = withApiPrefix(
  process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production' ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL),
);
