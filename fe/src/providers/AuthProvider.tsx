'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { client, postAuthLogin, getAuthMe } from '@/services/api-client';
import type { UserDetail } from '@/services/api-client';

interface AuthContextValue {
  user: UserDetail | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'accessToken';

function setClientToken(token: string | null) {
  client.setConfig({ auth: token ?? undefined });
}

function loadToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

const AUTH_COOKIE = 'auth_verified';

function setAuthCookie(role: string) {
  document.cookie = `${AUTH_COOKIE}=${role};path=/;max-age=86400;samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=;path=/;max-age=0`;
}

function saveToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
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
      const sessionUser = nextAuthSession.user as UserDetail | undefined;
      setClientToken(sessionToken);
      saveToken(sessionToken);
      setAuthCookie(sessionUser?.role ?? 'learner');
      setToken(sessionToken);
      if (sessionUser) {
        setUser(sessionUser);
      }
      setLoading(false);
    } else {
      // Fallback to localStorage token (email/password login)
      const savedToken = loadToken();
      if (savedToken) {
        setClientToken(savedToken);
        getAuthMe({ throwOnError: true })
          .then((res) => {
            setUser(res.data);
            setToken(savedToken);
          })
          .catch(() => {
            saveToken(null);
            setClientToken(null);
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
      const { accessToken } = res.data;
      if (!accessToken) throw new Error('No access token returned');
      setClientToken(accessToken);
      saveToken(accessToken);
      setToken(accessToken);
      const profileRes = await getAuthMe({ throwOnError: true });
      setAuthCookie(profileRes.data?.role ?? 'learner');
      setUser(profileRes.data);
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    nextAuthSignIn('google', { callbackUrl: '/' });
  }, []);

  const logout = useCallback(async () => {
    setClientToken(null);
    saveToken(null);
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
