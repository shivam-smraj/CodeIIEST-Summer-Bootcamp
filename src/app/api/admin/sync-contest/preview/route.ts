/**
 * POST /api/admin/sync-contest/preview
 *
 * Phase 1 of the 2-phase sync:
 *   Fetches CF standings + loads registered users — NO DB WRITES.
 *   Returns full preview data so admin can review & edit before committing.
 *
 * Returns:
 *   - contest: CF contest metadata
 *   - problems: problem list
 *   - cfRows: ALL rows from CF (rank, handle, solved, per-problem, penalty)
 *   - bootcampParticipants: matched bootcamp users with calculated scores
 *   - unmatchedCFHandles: in CF but not in bootcamp DB
 *   - notParticipated: registered users who didn't show up
 *   - alreadySynced: whether this contest was already committed
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { Contest } from '@/models/Contest';
import { getCFStandings } from '@/lib/cf-api';
import { calcRowScore, calcTotalPoints } from '@/lib/score-calculator';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';
import type { CFProblem, CFRanklistRow } from '@/types/codeforces';

const previewSchema = z.object({
  contestId:  z.string().min(1).max(20).regex(/^\d+$/, 'Contest ID must be numeric'),
  weekNumber: z.number().int().min(1).max(8),
  groupId:    z.string().max(30).optional(),
});

export interface CFRowPreview {
  rank: number;
  cfHandle: string;
  participantType: string;
  solved: number;
  points: number;   // raw CF points
  penalty: number;  // time penalty (seconds for ICPC, 0 for CF-rules)
  problemResults: Array<{
    index: string;
    points: number;
    wrongAttempts: number;
    solveTimeSeconds: number | null;
  }>;
  isBootcampUser: boolean;
}

export interface BootcampParticipantPreview {
  // From CF
  rank: number;
  cfHandle: string;
  cfSolved: number;
  cfPoints: number;
  cfPenalty: number;
  problemResults: CFRowPreview['problemResults'];

  // From DB
  userId: string;
  displayName: string;
  rollId: string;
  department: string;
  deptCode: string;
  batch: number;
  email: string;
  cfRating: number;
  cfRank: string;
  cfAvatar?: string;
  gender?: string;

  // Calculated
  calculatedScore: number;    // score this run will give
  prevWeekScore: number;      // what was stored for this week before
  prevTotalPoints: number;    // user's current totalPoints
  newTotalPoints: number;     // projected totalPoints after this sync
  isIncluded: boolean;        // admin can uncheck to skip this user
}

export interface PreviewResponse {
  contest: {
    id: string;
    name: string;
    type: string;
    phase: string;
    durationSeconds: number;
  };
  problems: Array<{ index: string; name: string; maxPoints: number | null }>;
  scoreType: 'icpc-rules' | 'cf-rules';
  weekNumber: number;
  cfRows: CFRowPreview[];
  bootcampParticipants: BootcampParticipantPreview[];
  unmatchedCFHandles: string[];
  notParticipated: Array<{
    userId: string;
    cfHandle: string;
    displayName: string;
    rollId: string;
    department: string;
    prevWeekScore: number;
    prevTotalPoints: number;
  }>;
  alreadySynced: boolean;
  existingSyncId?: string;
  totalCFRows: number;
  contestantCount: number;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = previewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { contestId, weekNumber, groupId } = parsed.data;
    const weekIndex = weekNumber - 1;

    await connectToDatabase();

    // ── Check if already synced ───────────────────────────────────────────────
    const existingContest = await Contest.findOne({ cfContestId: contestId }).lean();
    const alreadySynced = !!existingContest;

    // ── Fetch CF standings ────────────────────────────────────────────────────
    const standings = await getCFStandings(contestId, groupId);
    const { contest, problems, rows } = standings;

    const isICPC = contest.type === 'ICPC';
    const scoreType: 'icpc-rules' | 'cf-rules' = isICPC ? 'icpc-rules' : 'cf-rules';

    // ── Load all registered users ────────────────────────────────────────────
    const registeredUsers = await User.find({
      isCfVerified: true,
      isOnboardingComplete: true,
    })
      .select('_id cfHandle cfRating cfRank cfAvatar displayName rollId department deptCode batch email gender scores weeklyRanks missedContests totalPoints')
      .lean();

    // Build handle → user map
    const handleToUser = new Map(
      registeredUsers.map(u => [u.cfHandle!.toLowerCase(), u])
    );

    // ── Build cfRows (ALL rows, any participant type) ─────────────────────────
    const cfRows: CFRowPreview[] = rows.map(row => {
      const handle = row.party.members[0]?.handle ?? '';
      const solved = row.problemResults.filter(pr => pr.points > 0).length;

      const problemResults = row.problemResults.map((pr, i) => ({
        index: (problems[i] as CFProblem)?.index ?? String(i),
        points: pr.points,
        wrongAttempts: pr.rejectedAttemptCount,
        solveTimeSeconds: pr.bestSubmissionTimeSeconds ?? null,
      }));

      return {
        rank: row.rank,
        cfHandle: handle,
        participantType: row.party.participantType,
        solved,
        points: row.points,
        penalty: row.penalty,
        problemResults,
        isBootcampUser: handleToUser.has(handle.toLowerCase()),
      };
    });

    // ── Build bootcamp participants (CONTESTANT rows only, matched to DB) ─────
    const bootcampParticipants: BootcampParticipantPreview[] = [];
    const processedHandles = new Set<string>();

    for (const row of rows) {
      if (row.party.participantType !== 'CONTESTANT') continue;

      const handle = row.party.members[0]?.handle ?? '';
      if (!handle) continue;
      const handleLower = handle.toLowerCase();

      const user = handleToUser.get(handleLower);
      if (!user) continue; // Not a bootcamp user

      const { score: calculatedScore } = calcRowScore(row, problems as CFProblem[], isICPC);

      const prevScores = [...(user.scores ?? [])];
      while (prevScores.length <= weekIndex) prevScores.push(0);
      const prevWeekScore = prevScores[weekIndex] ?? 0;

      // Project new total: replace this week's score with calculated
      const projectedScores = [...prevScores];
      projectedScores[weekIndex] = calculatedScore;
      const newTotalPoints = calcTotalPoints(projectedScores);

      const problemResults = row.problemResults.map((pr, i) => ({
        index: (problems[i] as CFProblem)?.index ?? String(i),
        points: pr.points,
        wrongAttempts: pr.rejectedAttemptCount,
        solveTimeSeconds: pr.bestSubmissionTimeSeconds ?? null,
      }));

      bootcampParticipants.push({
        rank: row.rank,
        cfHandle: handle,
        cfSolved: row.problemResults.filter(pr => pr.points > 0).length,
        cfPoints: row.points,
        cfPenalty: row.penalty,
        problemResults,
        userId: user._id.toString(),
        displayName: user.displayName,
        rollId: user.rollId,
        department: user.department,
        deptCode: user.deptCode,
        batch: user.batch,
        email: user.email,
        cfRating: user.cfRating ?? 0,
        cfRank: user.cfRank ?? 'newbie',
        cfAvatar: user.cfAvatar,
        gender: user.gender,
        calculatedScore,
        prevWeekScore,
        prevTotalPoints: user.totalPoints ?? 0,
        newTotalPoints,
        isIncluded: true,
      });

      processedHandles.add(handleLower);
    }

    // ── Unmatched CF handles (in CF but not in bootcamp DB) ──────────────────
    const unmatchedCFHandles = rows
      .filter(row =>
        row.party.participantType === 'CONTESTANT' &&
        row.party.members[0]?.handle &&
        !handleToUser.has(row.party.members[0].handle.toLowerCase())
      )
      .map(row => row.party.members[0]!.handle);

    // ── Not participated (registered but not in contest) ──────────────────────
    const notParticipated = registeredUsers
      .filter(u => u.cfHandle && !processedHandles.has(u.cfHandle.toLowerCase()))
      .map(u => {
        const prevScores = [...(u.scores ?? [])];
        while (prevScores.length <= weekIndex) prevScores.push(0);
        return {
          userId: u._id.toString(),
          cfHandle: u.cfHandle!,
          displayName: u.displayName,
          rollId: u.rollId,
          department: u.department,
          prevWeekScore: prevScores[weekIndex] ?? 0,
          prevTotalPoints: u.totalPoints ?? 0,
        };
      });

    const response: PreviewResponse = {
      contest: {
        id: contestId,
        name: contest.name,
        type: contest.type,
        phase: contest.phase,
        durationSeconds: contest.durationSeconds,
      },
      problems: problems.map((p: CFProblem) => ({
        index: p.index,
        name: p.name,
        maxPoints: p.points ?? null,
      })),
      scoreType,
      weekNumber,
      cfRows,
      bootcampParticipants,
      unmatchedCFHandles,
      notParticipated,
      alreadySynced,
      existingSyncId: existingContest?._id?.toString(),
      totalCFRows: rows.length,
      contestantCount: rows.filter(r => r.party.participantType === 'CONTESTANT').length,
    };

    return NextResponse.json({ success: true, ...response });
  } catch (error) {
    return handleAuthError(error);
  }
}
