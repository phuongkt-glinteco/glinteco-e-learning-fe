'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import {
    authControllerLogin,
  authControllerLogout,
  authControllerMe,
  getAccessToken,
  getRefreshToken,
  setClientToken,
  saveTokens,
  clearTokens,
  attemptTokenRefresh,
  setTokenCookie,
  type UserProfileDto,
} from '@/services/api-client';

interface AuthContextValue {
  user: UserProfileDto | null;
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
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync next-auth session (Google login) into our auth state
  useEffect(() => {
    if (nextAuthStatus === 'loading') return;

    if (nextAuthStatus === 'authenticated' && nextAuthSession?.accessToken) {
      const sessionToken = nextAuthSession.accessToken;
      const sessionRefreshToken = nextAuthSession.refreshToken;

      if (token === sessionToken) {
        setLoading(false);
        return;
      }

      setClientToken(sessionToken);
      setLoading(true);

      authControllerMe({ throwOnError: true })
        .then((res) => {
          const profile = res.data as UserProfileDto;
          if (sessionRefreshToken) {
            saveTokens(sessionToken, sessionRefreshToken);
          } else {
            localStorage.setItem('accessToken', sessionToken);
            setTokenCookie(sessionToken);
          }
          setAuthCookie(profile.role ?? 'learner');
          setToken(sessionToken);
          setUser(profile);
        })
        .catch(async (err) => {
          console.error('Failed to fetch user profile after Google login:', err);
          clearTokens();
          clearAuthCookie();
          setToken(null);
          setUser(null);
          await nextAuthSignOut({ redirect: false });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Fallback to localStorage token (email/password login)
      const savedToken = getAccessToken();
      if (savedToken) {
        if (token === savedToken) {
          setLoading(false);
          return;
        }
        setClientToken(savedToken);
        authControllerMe({ throwOnError: true })
          .then((res) => {
            setUser(res.data as UserProfileDto);
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
                  const res = await authControllerMe({ throwOnError: true });
                  setUser(res.data as UserProfileDto);
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
  }, [nextAuthStatus, nextAuthSession, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authControllerLogin({
        body: { email, password },
        throwOnError: true,
      });
      const { accessToken, refreshToken } = res.data ?? {};
      if (!accessToken) throw new Error('No access token returned');

      setClientToken(accessToken);

      try {
        const profileRes = await authControllerMe({ throwOnError: true });
        const profile = profileRes.data as UserProfileDto | undefined;

        if (refreshToken) {
          saveTokens(accessToken, refreshToken);
        } else {
          localStorage.setItem('accessToken', accessToken);
          setTokenCookie(accessToken);
        }
        setAuthCookie(profile?.role ?? 'learner');
        setToken(accessToken);
        setUser(profile ?? null);
      } catch (err) {
        setClientToken('');
        throw err;
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    nextAuthSignIn('google', { callbackUrl: '/login' });
  }, []);

  const logout = useCallback(async () => {
    // Revoke the refresh token on the server (best-effort, needs auth header)
    try {
      await authControllerLogout({ body: { refreshToken: getRefreshToken() ?? '' } });
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
