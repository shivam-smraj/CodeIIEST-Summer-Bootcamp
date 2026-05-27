/**
 * auth.ts — Full Auth.js v5 Configuration (Node.js runtime only).
 *
 * This file CAN use Mongoose, MongoDB, and all Node.js APIs.
 * It is used by:
 *   - src/app/api/auth/[...nextauth]/route.ts  (HTTP handlers)
 *   - Any server component calling `await auth()`
 *
 * IMPORTANT: middleware.ts uses auth.config.ts (Edge-safe) instead of this
 * file to avoid Mongoose crashing on the Vercel Edge Runtime.
 *
 * Key behaviors:
 *   1. Only @students.iiests.ac.in emails are allowed
 *   2. On first login, user doc is created with data parsed from email
 *   3. Superadmin email gets role: 'superadmin' automatically
 *   4. JWT carries: uid, role, isOnboardingComplete (to drive middleware)
 */

import NextAuth from 'next-auth';
import { connectToDatabase } from '@/lib/mongoose';
import { User, type IUser } from '@/models/User';
import { parseIIESTEmail, isValidInstituteEmail } from '@/lib/email-parser';
import { authConfig } from './auth.config';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? '';

// Export handlers + helpers used throughout the app
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  callbacks: {
    ...authConfig.callbacks,

    /**
     * signIn — runs on every login attempt (Node.js runtime only — uses Mongoose).
     * Gate: reject non-institute emails BEFORE touching the DB.
     * Then upsert the User document in MongoDB.
     */
    async signIn({ user, account }) {
      // Only allow Google provider
      if (account?.provider !== 'google') return false;

      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      // ── Domain restriction ─────────────────────────────────────────────────
      if (!isValidInstituteEmail(email)) {
        return '/auth-error?error=DomainRestricted';
      }

      // ── Parse IIEST email to extract institutional data ────────────────────
      const parsed = parseIIESTEmail(email);

      try {
        await connectToDatabase();

        const existingUser: (IUser & { _id: unknown }) | null =
          await User.findOne({ email });

        if (existingUser) {
          // ── Returning user: sync any updated Google data ───────────────────
          const updates: Record<string, unknown> = {};

          if (!existingUser.googleId && user.id)  updates.googleId = user.id;
          if (!existingUser.image   && user.image) updates.image   = user.image;

          // Backfill institutional data if somehow missing
          if (!existingUser.rollId && parsed) {
            updates.rollId     = parsed.rollId;
            updates.entryYear  = parsed.entryYear;
            updates.batch      = parsed.batch;
            updates.department = parsed.department;
            updates.deptCode   = parsed.deptCode;
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
          // ── New user: create document ──────────────────────────────────────
          const isSuperAdmin =
            SUPERADMIN_EMAIL && email === SUPERADMIN_EMAIL.toLowerCase();

          const displayName =
            parsed?.displayName ?? (user.name || email.split('@')[0]);

          const newUserDoc = await User.create({
            googleId:              user.id,
            email,
            name:                  displayName,
            displayName,
            image:                 user.image ?? undefined,
            rollId:                parsed?.rollId   ?? '',
            entryYear:             parsed?.entryYear,
            batch:                 parsed?.batch,
            department:            parsed?.department ?? '',
            deptCode:              parsed?.deptCode   ?? '',
            role:                  isSuperAdmin ? 'superadmin' : 'user',
            isOnboardingComplete:  false,
            scores:                [],
            weeklyRanks:           [],
            totalPoints:           0,
            missedContests:        [],
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
  },
});
