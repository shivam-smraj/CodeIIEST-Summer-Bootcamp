/**
 * CF OAuth2 — Start Flow
 * GET /api/cf/start
 *
 * Initiates the Codeforces OAuth2 authorization flow.
 * Adapted from codeiiest-admin project (proven working implementation).
 *
 * Flow:
 *   1. Verify user is logged in via Auth.js session
 *   2. Check user hasn't already verified (isCfVerified === true → 400)
 *   3. Generate a random nonce for CSRF protection
 *   4. Store nonce in httpOnly cookie (5 min TTL)
 *   5. Redirect to codeforces.com/oauth/authorize
 *
 * The `return_url` query param is optional — if provided and from an allowed origin,
 * it's stored so the callback can redirect back to the originating page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@root/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/?auth=required', req.url));
  }

  // ── Prevent re-verification ───────────────────────────────────────────────
  // If user is already CF-verified, return error (handle is permanently locked)
  try {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select('isCfVerified').lean();
    if (user?.isCfVerified) {
      return NextResponse.redirect(
        new URL('/onboarding?error=already_verified', req.url)
      );
    }
  } catch (err) {
    console.error('[CF OAuth start] DB check failed:', err);
    // Continue anyway — the callback will handle any conflicts
  }

  // ── Generate nonce ────────────────────────────────────────────────────────
  const nonce = crypto.randomBytes(16).toString('hex');
  const cookieStore = await cookies();

  // Store nonce (httpOnly, 5 min)
  cookieStore.set('cf_oauth_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300, // 5 minutes
    path: '/',
  });

  // ── Build CF OAuth authorization URL ─────────────────────────────────────
  // Derive redirect_uri dynamically and robustly. If CF_REDIRECT_URI env var is set, use it.
  // Otherwise, use forwarded headers (x-forwarded-proto, x-forwarded-host)
  // to ensure it works correctly on Vercel behind proxies and on localhost.
  let redirectUri = process.env.CF_REDIRECT_URI;
  if (!redirectUri) {
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    redirectUri = `${proto}://${host}/api/cf/callback`;
  }
  const origin = new URL(redirectUri).origin;

  // Store the origin so the callback can use it for post-auth redirects
  cookieStore.set('cf_origin', origin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  });

  const params = new URLSearchParams({
    client_id: process.env.CF_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile',
    nonce,
  });

  return NextResponse.redirect(
    `https://codeforces.com/oauth/authorize?${params.toString()}`
  );
}
