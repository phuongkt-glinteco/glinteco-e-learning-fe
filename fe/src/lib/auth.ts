import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.glinteco-elearning.dev/api/v1';
const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account.id_token }),
        });
        if (!res.ok) {
          const message = await res.text();
          throw new Error(`Backend auth failed: ${res.status} ${message}`);
        }
        const data = await res.json();
        token.accessToken = data.accessToken;
        token.refreshToken = data.refreshToken;
        token.user = data.user;
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
