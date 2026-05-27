/**
 * TypeScript type augmentation for Auth.js v5 (next-auth@beta).
 *
 * Extends the built-in Session and JWT types to include our custom fields:
 *   - id (MongoDB _id)
 *   - role ('user' | 'admin' | 'superadmin')
 *   - isOnboardingComplete (drives redirect in middleware)
 *
 * Without this file, TypeScript would complain when accessing session.user.role etc.
 */

import type { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'admin' | 'superadmin';
      isOnboardingComplete: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    role?: 'user' | 'admin' | 'superadmin';
    isOnboardingComplete?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    uid: string;
    role: 'user' | 'admin' | 'superadmin';
    isOnboardingComplete: boolean;
  }
}
