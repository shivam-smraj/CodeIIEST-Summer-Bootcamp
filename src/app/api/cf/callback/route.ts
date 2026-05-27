/**
 * CF OAuth2 — Callback Handler
 * GET /api/cf/callback
 *
 * Handles the redirect from Codeforces after user authorizes.
 * Adapted from codeiiest-admin project (proven working implementation).
 *
 * Flow:
 *   1. Verify user is logged in
 *   2. Get `code` from query params (or `error` if user denied)
 *   3. Retrieve stored nonce from cookie, delete it immediately
 *   4. Exchange `code` for tokens via POST to CF token endpoint
 *   5. Decode `id_token` JWT to get handle + verify nonce (CSRF check)
 *   6. Fetch CF user info (rating, rank, avatar)
 *   7. Check if handle is already taken by another user
 *   8. Save cfHandle, cfRating, cfRank, cfAvatar, isCfVerified: true
 *   9. Redirect to /onboarding?cfverified=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@root/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { CFUserInfoResponse, CFOAuthTokenPayload } from '@/types/codeforces';

const REDIRECT_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${REDIRECT_BASE}/?auth=required`);
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const cfError = searchParams.get('error');

  // User denied the CF authorization
  if (cfError || !code) {
    return NextResponse.redirect(
      `${REDIRECT_BASE}/onboarding?cf_error=denied`
    );
  }

  try {
    // ── Retrieve and clear nonce ──────────────────────────────────────────
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get('cf_oauth_nonce')?.value;

    if (!storedNonce) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=nonce_missing`
      );
    }
    cookieStore.delete('cf_oauth_nonce');

    // ── Exchange code for tokens ──────────────────────────────────────────
    const tokenRes = await fetch('https://codeforces.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.CF_CLIENT_ID!,
        client_secret: process.env.CF_CLIENT_SECRET!,
        redirect_uri: process.env.CF_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[CF callback] Token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=token_exchange`
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      id_token?: string;
    };

    // ── Decode id_token and verify nonce ─────────────────────────────────
    const idToken = tokenData.id_token;
    if (!idToken) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=no_id_token`
      );
    }

    // CF uses symmetric key for id_token — decode without verification,
    // then manually verify the nonce to prevent CSRF/replay attacks
    const decoded = jwt.decode(idToken) as CFOAuthTokenPayload | null;
    if (!decoded) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=invalid_token`
      );
    }

    if (decoded.nonce !== storedNonce) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=nonce_mismatch`
      );
    }

    const cfHandle = decoded.handle;
    if (!cfHandle) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=no_handle`
      );
    }

    // ── Fetch CF user info (rating, rank, avatar) ─────────────────────────
    let cfRating = 0;
    let cfRank = 'newbie';
    let cfAvatar = '';

    try {
      const cfInfoRes = await fetch(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cfHandle)}`
      );
      const cfInfo = (await cfInfoRes.json()) as CFUserInfoResponse;
      if (cfInfo.status === 'OK' && cfInfo.result?.[0]) {
        const cfUser = cfInfo.result[0];
        cfRating = cfUser.rating ?? 0;
        cfRank = cfUser.rank ?? 'newbie';
        cfAvatar = cfUser.titlePhoto ?? '';
      }
    } catch (err) {
      // Non-fatal — proceed without rating (will be refreshed by cron later)
      console.warn('[CF callback] Could not fetch CF user info:', err);
    }

    // ── Save to MongoDB ───────────────────────────────────────────────────
    await connectToDatabase();

    // Check if this CF handle is already taken by another user
    const existingWithHandle = await User.findOne({
      cfHandle,
      _id: { $ne: session.user.id },
    }).lean();

    if (existingWithHandle) {
      return NextResponse.redirect(
        `${REDIRECT_BASE}/onboarding?cf_error=handle_taken&handle=${encodeURIComponent(cfHandle)}`
      );
    }

    // Update the current user
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        cfHandle,
        cfRating,
        cfRank,
        cfAvatar,
        isCfVerified: true,
        cfVerifiedAt: new Date(),
      },
    });

    // ── Success redirect ──────────────────────────────────────────────────
    return NextResponse.redirect(
      `${REDIRECT_BASE}/onboarding?cf_success=true&handle=${encodeURIComponent(cfHandle)}&rating=${cfRating}`
    );
  } catch (err) {
    console.error('[CF callback] Unexpected error:', err);
    return NextResponse.redirect(
      `${REDIRECT_BASE}/onboarding?cf_error=server_error`
    );
  }
}
