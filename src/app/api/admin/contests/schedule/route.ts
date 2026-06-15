import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Contest } from '@/models/Contest';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { cfContestId, contestName, weekNumber, groupId } = body;

    if (!cfContestId || !contestName || !weekNumber) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if it already exists
    const existing = await Contest.findOne({ cfContestId });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Contest with this ID already exists in the database' }, { status: 400 });
    }

    // Create scheduled contest
    const newContest = await Contest.create({
      cfContestId,
      contestName,
      weekNumber: parseInt(weekNumber, 10),
      groupId: groupId || undefined,
      status: 'SCHEDULED',
      syncedBy: session.user?.email || 'admin',
      participantCount: 0,
      updatedUserCount: 0,
    });

    return NextResponse.json({ success: true, contest: newContest });
  } catch (error) {
    return handleAuthError(error);
  }
}
