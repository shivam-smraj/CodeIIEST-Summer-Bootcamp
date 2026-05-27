/**
 * Next.js Middleware — Route protection and onboarding redirect.
 *
 * Runs on the Edge runtime BEFORE any page renders.
 *
 * Rules:
 *   1. /admin, /admin/* → requires role: 'admin' or 'superadmin'. Redirect to / if not.
 *   2. /profile → requires login. Redirect to / if not.
 *   3. /onboarding → requires login but NOT necessarily onboarding complete.
 *   4. Any logged-in user without onboarding complete → redirect to /onboarding
 *      (except when already on /onboarding or /api/* or /auth-error)
 *
 * Auth.js v5 middleware pattern: import `auth` from './auth' and use as middleware.
 */

import { auth } from '@root/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const PROTECTED_ROUTES = ['/profile', '/onboarding'];

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: typeof req.auth };
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role ?? 'user';
  const isOnboardingComplete = session?.user?.isOnboardingComplete ?? false;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // ── Protected routes (login required) ────────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // ── Onboarding redirect ───────────────────────────────────────────────────
  // If logged in but hasn't completed onboarding, redirect to /onboarding
  // Skip this for: /onboarding itself, /api routes, /auth-error
  if (
    isLoggedIn &&
    !isOnboardingComplete &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth-error') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/favicon')
  ) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl));
  }

  return NextResponse.next();
});

// Only run middleware on these paths (skip static files, _next)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
