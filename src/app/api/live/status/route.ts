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
    const submissions = await getCFStatus(contestId, groupId);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('[LIVE API STATUS ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
