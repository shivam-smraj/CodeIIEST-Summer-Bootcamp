/**
 * Auth.js v5 Configuration (next-auth@beta)
 *
 * This is the ROOT auth config — referenced by:
 *   - src/app/api/auth/[...nextauth]/route.ts (HTTP handlers)
 *   - middleware.ts (route protection)
 *   - Any server component calling `await auth()`
 *
 * Key behaviors:
 *   1. Only @students.iiests.ac.in emails are allowed
 *   2. On first login, user doc is created with data parsed from email
 *   3. Superadmin email gets role: 'superadmin' automatically
 *   4. JWT carries: uid, role, isOnboardingComplete (to drive middleware)
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/mongoose';
import { User, type IUser } from '@/models/User';
import { parseIIESTEmail, isValidInstituteEmail } from '@/lib/email-parser';
import type { NextAuthConfig } from 'next-auth';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? '';

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
    signIn: '/',           // redirect to home (sign-in modal lives there)
    error: '/auth-error',  // custom error page
  },

  callbacks: {
    /**
     * signIn — runs on every login attempt.
     * Gate: reject non-institute emails BEFORE touching the DB.
     * Then upsert the User document in MongoDB.
     */
    async signIn({ user, account }) {
      // Only allow Google provider
      if (account?.provider !== 'google') return false;

      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      // ── Domain restriction ───────────────────────────────────────────────
      if (!isValidInstituteEmail(email)) {
        return '/auth-error?error=DomainRestricted';
      }

      // ── Parse IIEST email to extract institutional data ──────────────────
      const parsed = parseIIESTEmail(email);

      try {
        await connectToDatabase();

        // Use IUser type explicitly to avoid 'never' inference issues
        const existingUser: (IUser & { _id: unknown }) | null =
          await User.findOne({ email });

        if (existingUser) {
          // ── Returning user: sync any updated Google data ─────────────────
          const updates: Record<string, unknown> = {};

          if (!existingUser.googleId && user.id) {
            updates.googleId = user.id;
          }
          if (!existingUser.image && user.image) {
            updates.image = user.image;
          }
          // Backfill institutional data if somehow missing
          if (!existingUser.rollId && parsed) {
            updates.rollId = parsed.rollId;
            updates.entryYear = parsed.entryYear;
            updates.batch = parsed.batch;
            updates.department = parsed.department;
            updates.deptCode = parsed.deptCode;
          }

          if (Object.keys(updates).length > 0) {
            await User.updateOne({ email }, { $set: updates });
          }

          // Pass DB data to jwt callback via user object mutation
          (user as Record<string, unknown>)._id =
            (existingUser._id as { toString(): string }).toString();
          (user as Record<string, unknown>).role = existingUser.role;
          (user as Record<string, unknown>).isOnboardingComplete =
            existingUser.isOnboardingComplete;
          user.name = existingUser.displayName;
        } else {
          // ── New user: create document ────────────────────────────────────
          const isSuperAdmin =
            SUPERADMIN_EMAIL && email === SUPERADMIN_EMAIL.toLowerCase();

          const displayName =
            parsed?.displayName ?? (user.name || email.split('@')[0]);

          const newUserDoc = await User.create({
            googleId: user.id,
            email,
            name: displayName,
            displayName,
            image: user.image ?? undefined,
            rollId: parsed?.rollId ?? '',
            entryYear: parsed?.entryYear,
            batch: parsed?.batch,
            department: parsed?.department ?? '',
            deptCode: parsed?.deptCode ?? '',
            role: isSuperAdmin ? 'superadmin' : 'user',
            isOnboardingComplete: false,
            scores: [],
            weeklyRanks: [],
            totalPoints: 0,
            missedContests: [],
          });

          (user as Record<string, unknown>)._id = newUserDoc._id.toString();
          (user as Record<string, unknown>).role = newUserDoc.role;
          (user as Record<string, unknown>).isOnboardingComplete =
            newUserDoc.isOnboardingComplete;
          user.name = newUserDoc.displayName;
        }

        return true;
      } catch (error) {
        console.error('[Auth.js] signIn error:', error);
        return '/auth-error?error=DatabaseError';
      }
    },

    /**
     * jwt — runs whenever a JWT is created or updated.
     * Copies custom fields from the user object into the token.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as Record<string, unknown>;
        token.uid = (u._id as string) ?? (user.id as string);
        token.role = (u.role as 'user' | 'admin' | 'superadmin') ?? 'user';
        token.isOnboardingComplete = (u.isOnboardingComplete as boolean) ?? false;
      }

      // Handle session.update() calls (e.g., after onboarding completes)
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
     * session — runs when session is accessed via `useSession()` or `auth()`.
     * Attaches token fields to the session.user object.
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

// Export handlers + helpers used throughout the app
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
