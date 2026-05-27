/**
 * POST /api/admin/override-score
 *
 * Allows an admin to manually override a participant's score for a specific week.
 * Used after a sync to normalize scores for cheating, power cuts, etc.
 *
 * Body: { cfHandle: string, weekNumber: number (1-8), newScore: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

const overrideSchema = z.object({
  cfHandle:   z.string().min(1).max(50),
  weekNumber: z.number().int().min(1).max(8),
  newScore:   z.number().int().min(0).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = overrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cfHandle, weekNumber, newScore } = parsed.data;
    const weekIndex = weekNumber - 1;

    await connectToDatabase();

    const user = await User.findOne({
      cfHandle: { $regex: new RegExp(`^${cfHandle}$`, 'i') },
      isCfVerified: true,
      isOnboardingComplete: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: `No verified bootcamp participant found with CF handle: @${cfHandle}` },
        { status: 404 }
      );
    }

    // Update scores array
    const scores = [...(user.scores ?? [])];
    while (scores.length <= weekIndex) scores.push(0);
    scores[weekIndex] = newScore;

    // Recalculate total (Best 6 of 8)
    const newTotal = calcTotalPoints(scores);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          [`scores.${weekIndex}`]: newScore,
          totalPoints: newTotal,
        },
      }
    );

    return NextResponse.json({
      success: true,
      cfHandle,
      weekNumber,
      newScore,
      newTotalPoints: newTotal,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
