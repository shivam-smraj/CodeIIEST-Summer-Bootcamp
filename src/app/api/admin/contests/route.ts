/**
 * GET /api/admin/contests
 *
 * Returns all synced contests. Use ?full=true to include standings.
 * Also cross-references with User DB to enrich standings with user details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Contest } from '@/models/Contest';
import { User } from '@/models/User';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const full = searchParams.get('full') === 'true';
    const contestId = searchParams.get('contestId');

    // If fetching a specific contest with full details
    if (contestId) {
      const contest = await Contest.findOne({ cfContestId: contestId }).lean();
      if (!contest) {
        return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
      }

      // Enrich standings with user details
      const handles = contest.standings.map(s => s.cfHandle.toLowerCase());
      const users = await User.find({
        cfHandle: { $in: handles.map(h => new RegExp(`^${h}$`, 'i')) },
      })
        .select('cfHandle displayName rollId department deptCode batch email cfRating cfRank gender scores weeklyRanks totalPoints')
        .lean();

      const userByHandle = new Map(users.map(u => [u.cfHandle!.toLowerCase(), u]));

      const enrichedStandings = contest.standings.map(s => {
        const user = userByHandle.get(s.cfHandle.toLowerCase());
        return {
          ...s,
          displayName:  user?.displayName ?? null,
          rollId:       user?.rollId ?? null,
          department:   user?.department ?? null,
          batch:        user?.batch ?? null,
          email:        user?.email ?? null,
          cfRating:     user?.cfRating ?? null,
          cfRank:       user?.cfRank ?? null,
          allScores:    user?.scores ?? [],
          totalPoints:  user?.totalPoints ?? 0,
          weekScore:    user?.scores?.[(contest.weekNumber - 1)] ?? s.points,
        };
      });

      return NextResponse.json({
        success: true,
        contest: {
          ...contest,
          _id: contest._id.toString(),
          syncedAt: contest.syncedAt?.toISOString(),
          standings: enrichedStandings,
        },
      });
    }

    // List all contests
    const projection = full
      ? {} // include everything
      : {
          cfContestId: 1, contestName: 1, weekNumber: 1,
          syncedAt: 1, syncedBy: 1, participantCount: 1,
          updatedUserCount: 1, scoreType: 1,
          'standings.cfHandle': 1, 'standings.rank': 1, 'standings.points': 1,
        };

    const contests = await Contest.find({}, projection)
      .sort({ weekNumber: 1 })
      .lean();

    // If full, enrich each contest's standings with user info
    let enriched;
    if (full) {
      // Get all CF handles across all contests
      const allHandles = [...new Set(
        contests.flatMap(c => c.standings.map(s => s.cfHandle.toLowerCase()))
      )];
      const allUsers = await User.find({
        cfHandle: { $regex: allHandles.map(h => `^${h}$`).join('|'), $options: 'i' },
      })
        .select('cfHandle displayName rollId department batch cfRating cfRank scores totalPoints')
        .lean();

      const userByHandle = new Map(allUsers.map(u => [u.cfHandle!.toLowerCase(), u]));

      enriched = contests.map(c => ({
        ...c,
        _id: c._id.toString(),
        syncedAt: c.syncedAt?.toISOString(),
        standings: c.standings.map(s => {
          const u = userByHandle.get(s.cfHandle.toLowerCase());
          return {
            ...s,
            displayName: u?.displayName ?? null,
            rollId:      u?.rollId ?? null,
            department:  u?.department ?? null,
            batch:       u?.batch ?? null,
            cfRating:    u?.cfRating ?? null,
            cfRank:      u?.cfRank ?? null,
            totalPoints: u?.totalPoints ?? 0,
            weekScore:   u?.scores?.[(c.weekNumber - 1)] ?? s.points,
          };
        }),
      }));
    } else {
      enriched = contests.map(c => ({
        ...c,
        _id: c._id.toString(),
        syncedAt: c.syncedAt?.toISOString(),
      }));
    }

    return NextResponse.json({ success: true, contests: enriched });
  } catch (error) {
    return handleAuthError(error);
  }
}
