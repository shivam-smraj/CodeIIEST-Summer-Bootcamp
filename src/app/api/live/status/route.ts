import { NextRequest, NextResponse } from 'next/server';
import { getCFStatus } from '@/lib/cf-api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const groupId = searchParams.get('groupId') || undefined;

    if (!contestId) {
      return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    // Fetch chronological submissions (oldest first)
    const allSubmissions = await getCFStatus(contestId, groupId);
    
    // DELTA POLLING: Only return submissions starting from this index
    const fromIndex = parseInt(searchParams.get('fromIndex') || '0', 10);
    const submissions = fromIndex > 0 ? allSubmissions.slice(fromIndex) : allSubmissions;

    return NextResponse.json({ submissions, total: allSubmissions.length });
  } catch (error) {
    console.error('[LIVE API STATUS ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
