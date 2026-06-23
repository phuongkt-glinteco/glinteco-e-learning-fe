'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import {
  postAuthLogin,
  postAuthLogout,
  getAuthMe,
  getAccessToken,
  setClientToken,
  saveTokens,
  clearTokens,
  attemptTokenRefresh,
  type UserDetail,
} from '@/services/api-client';

interface AuthContextValue {
  user: UserDetail | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_COOKIE = 'auth_verified';

function setAuthCookie(role: string) {
  document.cookie = `${AUTH_COOKIE}=${role};path=/;max-age=86400;samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=;path=/;max-age=0`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync next-auth session (Google login) into our auth state
  useEffect(() => {
    if (nextAuthStatus === 'loading') return;

    if (nextAuthStatus === 'authenticated' && nextAuthSession?.accessToken) {
      const sessionToken = nextAuthSession.accessToken;
      const sessionRefreshToken = nextAuthSession.refreshToken;
      const sessionUser = nextAuthSession.user as UserDetail | undefined;
      if (sessionRefreshToken) {
        saveTokens(sessionToken, sessionRefreshToken);
      } else {
        setClientToken(sessionToken);
        localStorage.setItem('accessToken', sessionToken);
      }
      setAuthCookie(sessionUser?.role ?? 'learner');
      setToken(sessionToken);
      if (sessionUser) {
        setUser(sessionUser);
      }
      setLoading(false);
    } else {
      // Fallback to localStorage token (email/password login)
      const savedToken = getAccessToken();
      if (savedToken) {
        setClientToken(savedToken);
        getAuthMe({ throwOnError: true })
          .then((res) => {
            setUser(res.data as UserDetail);
            setToken(savedToken);
          })
          .catch(async () => {
            // Token might be expired — try refreshing
            const refreshed = await attemptTokenRefresh();
            if (refreshed) {
              const newToken = getAccessToken();
              if (newToken) {
                setClientToken(newToken);
                try {
                  const res = await getAuthMe({ throwOnError: true });
                  setUser(res.data as UserDetail);
                  setToken(newToken);
                  return;
                } catch {
                  // profile fetch failed even after refresh
                }
              }
            }
            clearTokens();
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [nextAuthStatus, nextAuthSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await postAuthLogin({
        body: { email, password },
        throwOnError: true,
      });
      const { accessToken, refreshToken } = res.data ?? {};
      if (!accessToken) throw new Error('No access token returned');
      if (refreshToken) {
        saveTokens(accessToken, refreshToken);
      } else {
        setClientToken(accessToken);
        localStorage.setItem('accessToken', accessToken);
      }
      setToken(accessToken);
      const profileRes = await getAuthMe({ throwOnError: true });
      const profile = profileRes.data as UserDetail | undefined;
      setAuthCookie(profile?.role ?? 'learner');
      setUser(profile ?? null);
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    nextAuthSignIn('google', { callbackUrl: '/login' });
  }, []);

  const logout = useCallback(async () => {
    // Revoke the refresh token on the server (best-effort, needs auth header)
    try {
      await postAuthLogout();
    } catch {
      // server revocation is best-effort during logout
    }
    clearTokens();
    clearAuthCookie();
    setToken(null);
    setUser(null);
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
