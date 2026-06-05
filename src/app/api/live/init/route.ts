import { NextRequest, NextResponse } from 'next/server';
import { getCFStandings } from '@/lib/cf-api';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const groupId = searchParams.get('groupId') || undefined;

    if (!contestId) {
      return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    // 1. Fetch CF Standings just to get Contest metadata and Problems
    // We don't care about the rows here.
    const standings = await getCFStandings(contestId, groupId);

    // 2. Fetch User map from DB
    await connectToDatabase();
    const users = await User.find({ cfHandle: { $exists: true, $ne: '' } }).lean();
    
    const userMap: Record<string, { firstName: string; fullName: string; rollId: string; rating?: number; rank?: string }> = {};
    users.forEach((u: any) => {
      if (u.cfHandle) {
        // Extract first name
        const nameParts = (u.displayName || u.name || '').split(' ');
        const firstName = nameParts[0] || u.cfHandle;
        
        userMap[u.cfHandle.toLowerCase()] = {
          firstName,
          fullName: u.displayName || u.name || u.cfHandle,
          rollId: u.rollId || 'UNKNOWN',
          rating: u.cfRating,
          rank: u.cfRank,
        };
      }
    });

    // 3. Map participant handles to official Codeforces ranks
    const officialRanks: Record<string, number> = {};
    if (standings.rows && Array.isArray(standings.rows)) {
      for (const row of standings.rows) {
        if (row.party?.members?.[0]) {
          const handle = row.party.members[0].handle.toLowerCase();
          officialRanks[handle] = row.rank;
        }
      }
    }

    return NextResponse.json({
      contest: standings.contest,
      problems: standings.problems,
      userMap,
      officialRanks,
    });
  } catch (error) {
    console.error('[LIVE API INIT ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
