import type { UserDetail } from '@/services/api-client';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user?: UserDetail;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: UserDetail;
  }
}
