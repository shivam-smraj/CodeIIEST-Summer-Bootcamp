/**
 * RBAC (Role-Based Access Control) helpers.
 *
 * Use these in API routes and server components to check permissions.
 * They call `auth()` from Auth.js v5 to get the current session.
 *
 * @example
 * // In an API route:
 * const session = await requireAuth();  // throws 401 if not logged in
 * const session = await requireAdmin(); // throws 403 if not admin
 */

import { auth } from '@root/auth';
import type { Session } from 'next-auth';

export type UserRole = 'user' | 'admin' | 'superadmin';

// ─── SESSION HELPERS ─────────────────────────────────────────────────────────

/**
 * Get the current session, or null if not logged in.
 */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Get the current session. Returns 401 response if not logged in.
 * Use in API routes: `const session = await requireAuth();`
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError('Unauthorized', 401);
  }
  return session;
}

/**
 * Require admin or superadmin role.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  const role = session.user.role;
  if (role !== 'admin' && role !== 'superadmin') {
    throw new AuthError('Forbidden — admin access required', 403);
  }
  return session;
}

/**
 * Require superadmin role specifically.
 */
export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== 'superadmin') {
    throw new AuthError('Forbidden — superadmin access required', 403);
  }
  return session;
}

// ─── BOOLEAN CHECKS ──────────────────────────────────────────────────────────

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'superadmin';
}

// ─── AUTH ERROR ───────────────────────────────────────────────────────────────

/**
 * Custom error class for auth failures.
 * Use with try/catch in API routes to return proper HTTP responses.
 *
 * @example
 * try {
 *   await requireAdmin();
 * } catch (e) {
 *   if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
 * }
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Helper to convert AuthError to a NextResponse JSON error.
 * Import in API routes to handle auth errors cleanly.
 */
export function handleAuthError(error: unknown): Response {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error('[Auth helper] Unexpected error:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
