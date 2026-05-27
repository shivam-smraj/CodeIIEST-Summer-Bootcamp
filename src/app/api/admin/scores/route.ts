/**
 * GET /api/admin/scores
 * Returns ALL bootcamp users with their full scores array for the score management panel.
 *
 * PATCH /api/admin/scores
 * Bulk-update scores for one or more users/weeks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

// ── GET — fetch all users + their scores ─────────────────────────────────────
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const users = await User.find({
      isCfVerified: true,
      isOnboardingComplete: true,
    })
      .select('_id cfHandle cfRating cfRank displayName rollId department deptCode batch email gender scores weeklyRanks missedContests totalPoints')
      .sort({ totalPoints: -1 })
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return handleAuthError(error);
  }
}

// ── PATCH — update one or more scores ────────────────────────────────────────
const patchSchema = z.object({
  updates: z.array(z.object({
    userId:     z.string().min(1),
    weekIndex:  z.number().int().min(0).max(7),   // 0-based
    newScore:   z.number().int().min(0),
    newRank:    z.number().int().min(0).optional(), // 0 = not applicable
  })),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();

    // Group updates by userId for efficiency
    const byUser = new Map<string, typeof parsed.data.updates>();
    for (const upd of parsed.data.updates) {
      if (!byUser.has(upd.userId)) byUser.set(upd.userId, []);
      byUser.get(upd.userId)!.push(upd);
    }

    // Load current scores for all affected users
    const userIds = [...byUser.keys()];
    const currentUsers = await User.find({ _id: { $in: userIds } })
      .select('_id scores weeklyRanks')
      .lean();

    const userMap = new Map(currentUsers.map(u => [u._id.toString(), u]));

    const bulkOps: Parameters<typeof User.bulkWrite>[0] = [];
    const results: Array<{ userId: string; weekIndex: number; newScore: number; newTotalPoints: number }> = [];

    for (const [userId, updates] of byUser) {
      const user = userMap.get(userId);
      if (!user) continue;

      const scores = [...(user.scores ?? [])];
      const ranks  = [...(user.weeklyRanks ?? [])];

      // Apply all updates for this user
      for (const upd of updates) {
        while (scores.length <= upd.weekIndex) scores.push(0);
        while (ranks.length  <= upd.weekIndex) ranks.push(0);
        scores[upd.weekIndex] = upd.newScore;
        if (upd.newRank !== undefined) ranks[upd.weekIndex] = upd.newRank;
      }

      const newTotalPoints = calcTotalPoints(scores);

      // Build $set object
      const setObj: Record<string, number> = { totalPoints: newTotalPoints };
      for (const upd of updates) {
        setObj[`scores.${upd.weekIndex}`]     = upd.newScore;
        if (upd.newRank !== undefined) {
          setObj[`weeklyRanks.${upd.weekIndex}`] = upd.newRank;
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: userId },
          update: { $set: setObj },
        },
      });

      results.push(...updates.map(upd => ({ userId, weekIndex: upd.weekIndex, newScore: upd.newScore, newTotalPoints })));
    }

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, updatedCount: bulkOps.length, results });
  } catch (error) {
    return handleAuthError(error);
  }
}
