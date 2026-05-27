/**
 * DELETE /api/admin/contests/[contestId]
 *
 * Reverts a synced contest:
 *   1. For each participant in the contest's standings, zero out their score for that week
 *      and recalculate totalPoints.
 *   2. Deletes the Contest audit document.
 *
 * This is a destructive operation — requires admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Contest } from '@/models/Contest';
import { User } from '@/models/User';
import { calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    await requireAdmin();
    const { contestId } = await params;

    if (!contestId || !/^\d+$/.test(contestId)) {
      return NextResponse.json({ error: 'Invalid contest ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the contest
    const contest = await Contest.findOne({ cfContestId: contestId }).lean();
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const weekIndex = contest.weekNumber - 1;
    const logs: string[] = [];

    // Load affected users
    const handles = contest.standings.map(s => s.cfHandle.toLowerCase());
    const affectedUsers = await User.find({
      cfHandle: { $regex: handles.map(h => `^${h}$`).join('|'), $options: 'i' },
    })
      .select('_id cfHandle scores weeklyRanks totalPoints')
      .lean();

    logs.push(`Found ${affectedUsers.length} users to revert`);

    // Build bulk ops to zero out this week's score
    const bulkOps: Parameters<typeof User.bulkWrite>[0] = affectedUsers.map(user => {
      const scores = [...(user.scores ?? [])];
      while (scores.length <= weekIndex) scores.push(0);
      scores[weekIndex] = 0;

      const ranks = [...(user.weeklyRanks ?? [])];
      while (ranks.length <= weekIndex) ranks.push(0);
      ranks[weekIndex] = 0;

      const newTotal = calcTotalPoints(scores);

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              [`scores.${weekIndex}`]: 0,
              [`weeklyRanks.${weekIndex}`]: 0,
              totalPoints: newTotal,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
      logs.push(`Zeroed W${contest.weekNumber} scores for ${bulkOps.length} users`);
    }

    // Delete the contest document
    await Contest.deleteOne({ cfContestId: contestId });
    logs.push(`Deleted contest audit record for CF contest ${contestId}`);

    return NextResponse.json({
      success: true,
      contestId,
      contestName: contest.contestName,
      weekNumber: contest.weekNumber,
      revertedCount: bulkOps.length,
      logs,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
