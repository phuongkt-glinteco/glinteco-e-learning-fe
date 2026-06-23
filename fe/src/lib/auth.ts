import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { API_BASE_URL } from '@/services/api-config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: account.id_token }),
          });
          if (!res.ok) throw new Error('Backend auth failed');
          const data = await res.json();
          token.accessToken = data.accessToken;
          token.refreshToken = data.refreshToken;
          token.user = data.user;
        } catch (error) {
          console.error('Failed to exchange Google idToken with backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.user = token.user as typeof session.user;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
