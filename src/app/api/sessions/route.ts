/**
 * GET /api/sessions
 *
 * Returns all 8 session documents.
 * Public endpoint — no auth required.
 * Locked sessions only expose weekNumber, topic, subTopics, targetRating.
 * Unlocked sessions expose all fields.
 *
 * Uses ISR with 5-minute revalidation.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Session } from '@/models/Session';

export const revalidate = 300; // ISR: 5 minutes

export async function GET() {
  try {
    await connectToDatabase();

    const sessions = await Session.find({})
      .sort({ weekNumber: 1 })
      .lean();

    // For locked sessions, only return safe public fields
    const sanitized = sessions.map((s) => {
      if (!s.isUnlocked) {
        return {
          _id: s._id.toString(),
          weekNumber: s.weekNumber,
          topic: s.topic,
          subTopics: s.subTopics,
          targetRating: s.targetRating,
          durationMinutes: s.durationMinutes,
          isUnlocked: false,
          isContestPosted: false,
          isRecordingAvailable: false,
        };
      }

      return {
        ...s,
        _id: s._id.toString(),
        sessionDate: s.sessionDate?.toISOString(),
        createdAt: (s as any).createdAt?.toISOString(),
        updatedAt: (s as any).updatedAt?.toISOString(),
      };
    });

    return NextResponse.json({ sessions: sanitized });
  } catch (error) {
    console.error('[GET /api/sessions] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
