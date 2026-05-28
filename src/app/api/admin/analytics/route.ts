import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Analytics } from '@/models/Analytics';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const stats = await Analytics.findOne({}).lean();

    return NextResponse.json({
      views: stats?.views ?? 0,
      uniqueVisitors: stats?.uniqueIpHashes?.length ?? 0,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
