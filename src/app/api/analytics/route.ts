import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongoose';
import { Analytics } from '@/models/Analytics';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract client IP address safely from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = (forwardedFor ? forwardedFor.split(',')[0] : realIp) || '127.0.0.1';

    // Hash the IP to protect user privacy (GDPR / PII compliance)
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Atomic update to increment views and add unique IP hash
    await Analytics.findOneAndUpdate(
      {},
      {
        $inc: { views: 1 },
        $addToSet: { uniqueIpHashes: ipHash },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics hit error:', error);
    // Silent fail to client to avoid disrupting user experience
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
