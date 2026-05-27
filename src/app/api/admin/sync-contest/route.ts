/**
 * POST /api/admin/sync-contest
 *
 * The CORE contest sync engine — admin pastes a CF contest ID,
 * this route does everything automatically:
 *
 *   1. Validate inputs (contestId, weekNumber)
 *   2. Check contest not already synced (duplicate prevention)
 *   3. Fetch standings from CF API
 *   4. Load all registered + verified users from DB
 *   5. Match CF standings rows to registered users by cfHandle
 *   6. Calculate scores (CF-rules or ICPC-rules)
 *   7. Update each matched user's scores[weekIndex] + weeklyRanks[weekIndex]
 *   8. Recalculate totalPoints for each user (Best 6 of 8)
 *   9. Mark non-participants (add weekIndex to missedContests)
 *  10. Create Contest document for audit trail
 *  11. Return detailed sync log
 *
 * Admin-only endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { Contest } from '@/models/Contest';
import { getCFStandings } from '@/lib/cf-api';
import { calcRowScore, calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

const syncSchema = z.object({
  contestId:  z.string().min(1).max(20).regex(/^\d+$/, 'Contest ID must be numeric'),
  weekNumber: z.number().int().min(1).max(8),
  groupId:    z.string().max(20).optional(), // For private CF group contests
});

export async function POST(req: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(msg);
    console.log(`[Sync] ${msg}`);
  };

  try {
    const session = await requireAdmin();

    const body = await req.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { contestId, weekNumber, groupId } = parsed.data;
    const weekIndex = weekNumber - 1; // 0-based array index

    await connectToDatabase();

    // ── 1. Duplicate check ────────────────────────────────────────────────
    const existingContest = await Contest.findOne({ cfContestId: contestId }).lean();
    if (existingContest) {
      return NextResponse.json(
        {
          error: `Contest ${contestId} was already synced for Week ${existingContest.weekNumber} on ${new Date(existingContest.syncedAt).toLocaleDateString()}`,
        },
        { status: 409 }
      );
    }

    // ── 2. Fetch CF standings ─────────────────────────────────────────────
    log(`📡 Fetching standings for Contest ID: ${contestId}${groupId ? ` (group: ${groupId})` : ''}...`);
    const standings = await getCFStandings(contestId, groupId);
    const { contest, problems, rows } = standings;

    if (contest.phase !== 'FINISHED') {
      return NextResponse.json(
        { error: `Contest "${contest.name}" is not finished yet (phase: ${contest.phase})` },
        { status: 400 }
      );
    }

    log(`✅ Contest: "${contest.name}" | Type: ${contest.type} | ${rows.length} participants`);

    const isICPC = contest.type === 'ICPC';
    const scoreType = isICPC ? 'icpc-rules' : 'cf-rules';

    // ── 3. Load all registered + verified users ───────────────────────────
    log(`📦 Loading registered users from DB...`);
    const registeredUsers = await User.find({
      isCfVerified: true,
      isOnboardingComplete: true,
    })
      .select('_id cfHandle scores weeklyRanks missedContests totalPoints')
      .lean();

    log(`👥 Found ${registeredUsers.length} registered verified users`);

    // Build a handle → user map (lowercase for case-insensitive matching)
    const handleToUser = new Map(
      registeredUsers.map((u) => [u.cfHandle!.toLowerCase(), u])
    );

    // ── 4. Process standings and match to registered users ────────────────
    log(`⚙️  Processing standings...`);

    const userUpdates: Array<{
      userId: string;
      score: number;
      rank: number;
    }> = [];

    const processedHandles = new Set<string>();
    const contestStandings: Array<{ cfHandle: string; rank: number; points: number; penalty: number }> = [];

    for (const row of rows) {
      // Skip non-contestants (practice, virtual, out-of-competition)
      if (row.party.participantType !== 'CONTESTANT') continue;

      const handle = row.party.members[0]?.handle;
      if (!handle) continue;

      const handleLower = handle.toLowerCase();
      const registeredUser = handleToUser.get(handleLower);

      if (!registeredUser) continue; // Not a bootcamp participant

      const { score, participated } = calcRowScore(row, problems, isICPC);
      if (!participated) continue;

      userUpdates.push({
        userId: registeredUser._id.toString(),
        score,
        rank: row.rank,
      });

      processedHandles.add(handleLower);

      contestStandings.push({
        cfHandle: handle,
        rank: row.rank,
        points: score,
        penalty: row.penalty,
      });
    }

    log(`🏆 ${userUpdates.length} bootcamp participants found in this contest`);

    // ── 5. Update user scores in DB (bulk writes) ─────────────────────────
    log(`💾 Updating user scores...`);

    const bulkOps = userUpdates.map(({ userId, score, rank }) => {
      // Get current user's scores to recalculate totalPoints
      const user = registeredUsers.find((u) => u._id.toString() === userId)!;
      const newScores = [...(user.scores ?? [])];

      // Pad with zeros if needed
      while (newScores.length <= weekIndex) newScores.push(0);
      newScores[weekIndex] = score;

      const newWeeklyRanks = [...(user.weeklyRanks ?? [])];
      while (newWeeklyRanks.length <= weekIndex) newWeeklyRanks.push(0);
      newWeeklyRanks[weekIndex] = rank;

      const newTotal = calcTotalPoints(newScores);

      return {
        updateOne: {
          filter: { _id: userId },
          update: {
            $set: {
              [`scores.${weekIndex}`]: score,
              [`weeklyRanks.${weekIndex}`]: rank,
              totalPoints: newTotal,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    log(`✅ Updated scores for ${bulkOps.length} users`);

    // ── 6. Mark non-participants ──────────────────────────────────────────
    log(`⚠️  Marking non-participants...`);

    const nonParticipantIds = registeredUsers
      .filter((u) => u.cfHandle && !processedHandles.has(u.cfHandle.toLowerCase()))
      .map((u) => u._id);

    if (nonParticipantIds.length > 0) {
      await User.updateMany(
        { _id: { $in: nonParticipantIds } },
        {
          $addToSet: { missedContests: weekIndex },
          // Ensure scores[weekIndex] = 0 for missed weeks
          $set: { [`scores.${weekIndex}`]: 0 },
        }
      );
    }

    log(`📉 ${nonParticipantIds.length} users marked as non-participants`);

    // ── 7. Create Contest audit document ──────────────────────────────────
    await Contest.create({
      cfContestId: contestId,
      contestName: contest.name,
      weekNumber,
      syncedAt: new Date(),
      syncedBy: session.user.email ?? 'unknown',
      participantCount: processedHandles.size,
      updatedUserCount: userUpdates.length,
      scoreType,
      standings: contestStandings.slice(0, 500), // Cap at 500 to avoid doc size limit
    });

    log(`📝 Contest audit record created`);
    log(`🎉 Sync complete! ${userUpdates.length} users updated, ${nonParticipantIds.length} non-participants marked`);

    return NextResponse.json({
      success: true,
      contestId,
      contestName: contest.name,
      weekNumber,
      participantCount: processedHandles.size,
      updatedUserCount: userUpdates.length,
      logs,
      // Detailed standings for the admin UI table
      standings: userUpdates
        .sort((a, b) => a.rank - b.rank)
        .map(({ userId, score, rank }) => {
          const user = registeredUsers.find(u => u._id.toString() === userId)!;
          const newScores = [...(user.scores ?? [])];
          while (newScores.length <= weekIndex) newScores.push(0);
          newScores[weekIndex] = score;
          const newTotal = calcTotalPoints(newScores);
          const standing = contestStandings.find(s => s.rank === rank);
          return {
            rank,
            cfHandle: standing?.cfHandle ?? '',
            score,
            prevTotalPoints: user.totalPoints ?? 0,
            newTotalPoints: newTotal,
          };
        }),
    });
  } catch (error) {
    if (error instanceof Error) {
      logs.push(`❌ Error: ${error.message}`);
      return NextResponse.json(
        { success: false, error: error.message, logs },
        { status: 500 }
      );
    }
    return handleAuthError(error);
  }
}
