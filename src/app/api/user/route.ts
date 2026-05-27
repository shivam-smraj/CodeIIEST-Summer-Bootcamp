/**
 * /api/user
 *
 * GET  — Returns the current user's profile (requires auth)
 * PATCH — Update editable fields: displayName, gender (requires auth)
 *
 * Non-editable fields (locked after onboarding):
 *   rollId, batch, entryYear, department, deptCode, cfHandle (when isCfVerified)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { requireAuth, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

// ── Schema for PATCH updates ──────────────────────────────────────────────────
const updateSchema = z.object({
  displayName: z.string().min(2).max(50).trim().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']).optional(),
  // Allow setting onboarding complete (called after wizard finishes)
  isOnboardingComplete: z.boolean().optional(),
});

const profileProjection = {
  name: 1,
  displayName: 1,
  email: 1,
  image: 1,
  rollId: 1,
  batch: 1,
  entryYear: 1,
  department: 1,
  deptCode: 1,
  gender: 1,
  role: 1,
  cfHandle: 1,
  cfRating: 1,
  cfRank: 1,
  cfAvatar: 1,
  isCfVerified: 1,
  cfVerifiedAt: 1,
  totalPoints: 1,
  scores: 1,
  weeklyRanks: 1,
  missedContests: 1,
  isOnboardingComplete: 1,
  house: 1,
  createdAt: 1,
};

// ─── GET /api/user ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const user = await User.findById(session.user.id, profileProjection).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      _id: user._id.toString(),
      cfVerifiedAt: user.cfVerifiedAt?.toISOString(),
      createdAt: (user as any).createdAt?.toISOString(),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

// ─── PATCH /api/user ──────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updates: Record<string, unknown> = {};
    const { displayName, gender, isOnboardingComplete } = parsed.data;

    if (displayName !== undefined) updates.displayName = displayName;
    if (gender !== undefined) updates.gender = gender;
    if (isOnboardingComplete !== undefined) {
      updates.isOnboardingComplete = isOnboardingComplete;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, select: profileProjection }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        _id: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
