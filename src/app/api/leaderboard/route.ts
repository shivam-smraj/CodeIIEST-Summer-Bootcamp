/**
 * GET /api/leaderboard
 *
 * Returns paginated, filtered leaderboard data.
 *
 * Query params:
 *   filter: 'combined-all' | 'combined-juniors' | 'combined-peers' | 'women-all' | 'women-juniors'
 *   page: number (default 1)
 *   limit: number (default 50, max 100)
 *
 * Only users where isCfVerified AND isOnboardingComplete are shown.
 * Sorted by totalPoints DESC.
 *
 * Response includes top3 (podium data) + paginated users list.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { JUNIOR_BATCH, PEER_BATCH } from '@/lib/constants';
import type { LeaderboardUser, LeaderboardFilter } from '@/types';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const filter = (searchParams.get('filter') ?? 'combined-all') as LeaderboardFilter;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const skip = (page - 1) * limit;

    // ── Build MongoDB filter ──────────────────────────────────────────────
    const baseFilter: Record<string, unknown> = {
      isCfVerified: true,
      isOnboardingComplete: true,
    };

    switch (filter) {
      case 'combined-juniors':
        baseFilter.batch = JUNIOR_BATCH;
        break;
      case 'combined-peers':
        baseFilter.batch = PEER_BATCH;
        break;
      case 'women-all':
        baseFilter.gender = 'Female';
        break;
      case 'women-juniors':
        baseFilter.gender = 'Female';
        baseFilter.batch = JUNIOR_BATCH;
        break;
      // 'combined-all': no additional filter
    }

    // ── Select fields (never expose email/googleId to client) ─────────────
    const projection = {
      displayName: 1,
      name: 1,
      cfHandle: 1,
      cfRating: 1,
      cfRank: 1,
      cfAvatar: 1,
      totalPoints: 1,
      scores: 1,
      weeklyRanks: 1,
      batch: 1,
      gender: 1,
      department: 1,
      rollId: 1,
      house: 1,
    };

    // ── Run queries in parallel ───────────────────────────────────────────
    const [total, users, top3raw] = await Promise.all([
      User.countDocuments(baseFilter),
      User.find(baseFilter, projection)
        .sort({ totalPoints: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.find(baseFilter, projection)
        .sort({ totalPoints: -1 })
        .limit(3)
        .lean(),
    ]);

    // ── Add rank numbers ──────────────────────────────────────────────────
    const addRanks = (docs: typeof users, offset = 0): LeaderboardUser[] =>
      docs.map((doc, i) => ({
        _id: doc._id.toString(),
        rank: offset + i + 1,
        displayName: doc.displayName ?? '',
        name: doc.name ?? '',
        cfHandle: doc.cfHandle ?? '',
        cfRating: doc.cfRating,
        cfRank: doc.cfRank,
        cfAvatar: doc.cfAvatar,
        totalPoints: doc.totalPoints ?? 0,
        scores: doc.scores ?? [],
        weeklyRanks: doc.weeklyRanks ?? [],
        batch: doc.batch ?? 0,
        gender: doc.gender ?? '',
        department: doc.department ?? '',
        rollId: doc.rollId ?? '',
        house: doc.house,
      }));

    return NextResponse.json({
      users: addRanks(users, skip),
      top3: addRanks(top3raw),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filter,
    });
  } catch (error) {
    console.error('[GET /api/leaderboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
