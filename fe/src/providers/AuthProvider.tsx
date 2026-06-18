'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { client, postAuthLogin, postAuthGoogle, getAuthMe } from '@/services/api-client';
import type { UserDetail } from '@/services/api-client';

interface AuthContextValue {
  user: UserDetail | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
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

function saveToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore token and fetch user
  useEffect(() => {
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
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await postAuthLogin({
        body: { email, password },
        throwOnError: true,
      });
      const { accessToken, user: loginUser } = res.data;
      if (!accessToken) throw new Error('No access token returned');
      setClientToken(accessToken);
      saveToken(accessToken);
      setToken(accessToken);
      // Fetch full profile
      const profileRes = await getAuthMe({ throwOnError: true });
      setUser(profileRes.data);
      router.push('/dashboard/learner');
    },
    [router],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await postAuthGoogle({
        body: { idToken },
        throwOnError: true,
      });
      const { accessToken, user: loginUser } = res.data;
      if (!accessToken) throw new Error('No access token returned');
      setClientToken(accessToken);
      saveToken(accessToken);
      setToken(accessToken);
      const profileRes = await getAuthMe({ throwOnError: true });
      setUser(profileRes.data);
      router.push('/dashboard/learner');
    },
    [router],
  );

  const logout = useCallback(() => {
    setClientToken(null);
    saveToken(null);
    setToken(null);
    setUser(null);
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
