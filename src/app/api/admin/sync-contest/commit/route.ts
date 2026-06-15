/**
 * POST /api/admin/sync-contest/commit
 *
 * Phase 2 of the 2-phase sync:
 *   Receives the admin-reviewed (and possibly edited) participant list
 *   and WRITES to the database.
 *
 * Body:
 *   - contestId, weekNumber, groupId? — contest identity
 *   - contestName, contestType, scoreType — from preview
 *   - participants: Array of { userId, cfHandle, score, rank, isIncluded }
 *   - markNonParticipants: boolean — whether to add weekIndex to missedContests
 *     for users not in the participants list
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { Contest } from '@/models/Contest';
import { calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

const participantSchema = z.object({
  userId:     z.string().min(1),
  cfHandle:   z.string().min(1),
  score:      z.number().int().min(0),
  rank:       z.number().int().min(1),
  isIncluded: z.boolean(),
});

const commitSchema = z.object({
  contestId:           z.string().min(1).max(20).regex(/^\d+$/),
  weekNumber:          z.number().int().min(1).max(8),
  groupId:             z.string().max(30).optional(),
  contestName:         z.string().min(1).max(200),
  contestType:         z.string().min(1),
  scoreType:           z.enum(['cf-rules', 'icpc-rules']),
  participants:        z.array(participantSchema),
  markNonParticipants: z.boolean().default(true),
  nonParticipantIds:   z.array(z.string()).default([]),
  // Problems list for audit trail
  problems: z.array(z.object({
    index: z.string(),
    name:  z.string(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log(`[Commit] ${msg}`); };

  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parsed = commitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const {
      contestId, weekNumber, groupId, contestName, contestType,
      scoreType, participants, markNonParticipants, nonParticipantIds,
    } = parsed.data;
    const weekIndex = weekNumber - 1;

    await connectToDatabase();

    // ── Duplicate guard (can be overridden by admin in UI) ────────────────────
    const existing = await Contest.findOne({ cfContestId: contestId }).lean();
    if (existing) {
      log(`⚠️  Contest ${contestId} already synced — overwriting...`);
      await Contest.deleteOne({ cfContestId: contestId });
    }

    // ── Build DB ops for included participants ────────────────────────────────
    const includedParticipants = participants.filter(p => p.isIncluded);
    log(`💾 Updating ${includedParticipants.length} included participants...`);

    // Load current scores for all affected users (need to recalculate totals)
    const userIds = includedParticipants.map(p => p.userId);
    const currentUsers = await User.find({ _id: { $in: userIds } })
      .select('_id scores weeklyRanks totalPoints')
      .lean();

    const userMap = new Map(currentUsers.map(u => [u._id.toString(), u]));

    const bulkOps = includedParticipants.map(({ userId, score, rank }) => {
      const user = userMap.get(userId);
      const currentScores = [...(user?.scores ?? [])];
      while (currentScores.length <= weekIndex) currentScores.push(0);
      currentScores[weekIndex] = score;

      const currentRanks = [...(user?.weeklyRanks ?? [])];
      while (currentRanks.length <= weekIndex) currentRanks.push(0);
      currentRanks[weekIndex] = rank;

      const newTotal = calcTotalPoints(currentScores);

      return {
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              [`scores.${weekIndex}`]: score,
              [`weeklyRanks.${weekIndex}`]: rank,
              totalPoints: newTotal,
            },
            // Remove from missedContests if they participated
            $pull: { missedContests: weekIndex },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      // Use unknown cast to bypass Mongoose's strict $pull typing
      await User.bulkWrite(bulkOps as unknown as Parameters<typeof User.bulkWrite>[0]);
    }
    log(`✅ ${bulkOps.length} user scores updated`);

    // ── Mark non-participants ─────────────────────────────────────────────────
    if (markNonParticipants && nonParticipantIds.length > 0) {
      log(`⚠️  Marking ${nonParticipantIds.length} non-participants...`);
      await User.updateMany(
        { _id: { $in: nonParticipantIds } },
        {
          $addToSet: { missedContests: weekIndex },
          $set: { [`scores.${weekIndex}`]: 0 },
        }
      );
      log(`📉 ${nonParticipantIds.length} users marked as non-participants`);
    }

    // ── Create Contest audit document ─────────────────────────────────────────
    const contestStandings = includedParticipants.map(p => ({
      cfHandle: p.cfHandle,
      rank:     p.rank,
      points:   p.score,
      penalty:  0,
    }));

    await Contest.create({
      cfContestId:      contestId,
      contestName,
      weekNumber,
      groupId:          groupId || undefined,
      syncedAt:         new Date(),
      syncedBy:         session.user.email ?? 'unknown',
      participantCount: includedParticipants.length,
      updatedUserCount: bulkOps.length,
      scoreType,
      standings:        contestStandings.slice(0, 500),
    });

    log(`📝 Contest audit record created`);
    log(`🎉 Commit complete! ${bulkOps.length} users updated`);

    return NextResponse.json({
      success: true,
      contestId,
      contestName,
      weekNumber,
      updatedCount: bulkOps.length,
      nonParticipantCount: nonParticipantIds.length,
      logs,
    });
  } catch (error) {
    if (error instanceof Error) {
      logs.push(`❌ Error: ${error.message}`);
      return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
    }
    return handleAuthError(error);
  }
}
