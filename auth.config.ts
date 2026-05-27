/**
 * auth.config.ts — Edge-safe Auth.js configuration.
 *
 * This file MUST NOT import Mongoose, MongoDB, or any Node.js-only module.
 * It is used by middleware.ts which runs on the Vercel Edge Runtime.
 *
 * It only defines:
 *  - providers (minimal — just clientId/secret, no DB callbacks)
 *  - session strategy
 *  - pages
 *  - jwt + session callbacks that only read from the token (no DB)
 *
 * The full auth.ts keeps all DB logic (signIn callback with User.create etc.)
 * and is used only by API route handlers and server components.
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  pages: {
    signIn: '/',
    error: '/auth-error',
  },

  callbacks: {
    /**
     * jwt — Edge-safe: only reads/writes token fields, no DB access.
     * The full DB-writing signIn callback lives in auth.ts.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as Record<string, unknown>;
        token.uid  = (u._id as string) ?? (user.id as string);
        token.role = (u.role as 'user' | 'admin' | 'superadmin') ?? 'user';
        token.isOnboardingComplete = (u.isOnboardingComplete as boolean) ?? false;
      }

      if (trigger === 'update' && session) {
        const s = session as Record<string, unknown>;
        if (s.isOnboardingComplete !== undefined) {
          token.isOnboardingComplete = s.isOnboardingComplete as boolean;
        }
        if (s.role) {
          token.role = s.role as 'user' | 'admin' | 'superadmin';
        }
      }

      return token;
    },

    /**
     * session — Edge-safe: maps token → session.user, no DB access.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.uid as string;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).isOnboardingComplete =
          token.isOnboardingComplete;
      }
      return session;
    },
  },
};
