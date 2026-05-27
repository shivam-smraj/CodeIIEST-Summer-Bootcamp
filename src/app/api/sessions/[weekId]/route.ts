/**
 * /api/sessions/[weekId]
 *
 * GET  — Public: returns a single session by weekNumber or _id
 * PATCH — Admin only: update session fields (CMS operations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Session } from '@/models/Session';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';
import mongoose from 'mongoose';

// ── Admin update schema ───────────────────────────────────────────────────────
const sessionUpdateSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  subTopics: z.array(z.string()).optional(),
  targetRating: z.string().optional(),
  sessionDate: z.string().datetime().optional(),
  durationMinutes: z.number().min(30).max(480).optional(),
  mentorName: z.string().max(100).optional(),
  meetLink: z.string().url().optional(),
  recordingLink: z.string().url().optional().nullable(),
  prerequisites: z
    .array(
      z.object({
        title: z.string(),
        link: z.string().url(),
        type: z.enum(['pdf', 'video', 'article', 'problem-set']),
        isRequired: z.boolean(),
      })
    )
    .optional(),
  additionalResources: z
    .array(
      z.object({
        title: z.string(),
        link: z.string().url(),
        type: z.enum(['pdf', 'video', 'article', 'problem-set']),
        isRequired: z.boolean(),
      })
    )
    .optional(),
  sessionNotes: z.string().optional(),
  postContestData: z
    .object({
      cfContestLink: z.string(),
      editorialLink: z.string(),
      solutionsRepoLink: z.string(),
      videoEditorialLink: z.string().optional(),
      additionalNotes: z.string().optional(),
    })
    .optional(),
  isUnlocked: z.boolean().optional(),
  isContestPosted: z.boolean().optional(),
  isRecordingAvailable: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ weekId: string }> };

// ─── GET /api/sessions/[weekId] ───────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { weekId } = await params;
    await connectToDatabase();

    // Support lookup by weekNumber (e.g. "1") or MongoDB _id
    const query = mongoose.isValidObjectId(weekId)
      ? { _id: weekId }
      : { weekNumber: parseInt(weekId, 10) };

    const session = await Session.findOne(query).lean();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.isUnlocked) {
      return NextResponse.json({
        _id: session._id.toString(),
        weekNumber: session.weekNumber,
        topic: session.topic,
        subTopics: session.subTopics,
        targetRating: session.targetRating,
        durationMinutes: session.durationMinutes,
        isUnlocked: false,
        isContestPosted: false,
        isRecordingAvailable: false,
      });
    }

    return NextResponse.json({
      ...session,
      _id: session._id.toString(),
      sessionDate: session.sessionDate?.toISOString(),
    });
  } catch (error) {
    console.error('[GET /api/sessions/[weekId]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

// ─── PATCH /api/sessions/[weekId] ────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { weekId } = await params;

    const body = await req.json();
    const parsed = sessionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query = mongoose.isValidObjectId(weekId)
      ? { _id: weekId }
      : { weekNumber: parseInt(weekId, 10) };

    const updated = await Session.findOneAndUpdate(
      query,
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
