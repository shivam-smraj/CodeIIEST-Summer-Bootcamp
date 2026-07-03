import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { getCFStatus } from '@/lib/cf-api';
import { connectToDatabase } from '@/lib/mongoose';
import { Contest } from '@/models/Contest';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promisify } from 'util';
import zlib from 'zlib';

const gzip = promisify(zlib.gzip);

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { contestId, groupId } = await req.json();
    if (!contestId) {
      return NextResponse.json({ error: 'contestId is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Validate contest exists in DB
    const dbContest = await Contest.findOne({ cfContestId: contestId.toString() });
    if (!dbContest) {
      return NextResponse.json({ error: 'Contest not found in database. Sync it first.' }, { status: 404 });
    }

    // 1. Fetch massive payload from CF
    const submissions = await getCFStatus(contestId.toString(), groupId);
    
    // 2. Compress payload to save R2 storage & bandwidth
    const jsonString = JSON.stringify(submissions);
    const compressedBuffer = await gzip(jsonString);

    // 3. Upload to R2
    const bucketName = process.env.R2_BUCKET_NAME || 'codeiiest-replays';
    const fileName = `contests/${contestId}_status.json.gz`;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: compressedBuffer,
      ContentType: 'application/json',
      ContentEncoding: 'gzip', // Tells browser to automatically unzip
    }));

    // 4. Save public URL to DB
    // Note: User must set R2_PUBLIC_DOMAIN in .env (e.g. https://pub-xxxxxxxx.r2.dev)
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || `https://pub-YOUR_R2_DEV_URL.r2.dev`;
    const replayUrl = `${publicDomain}/${fileName}`;

    dbContest.replayUrl = replayUrl;
    await dbContest.save();

    return NextResponse.json({ 
      success: true, 
      message: `Contest ${contestId} archived successfully!`,
      replayUrl,
      sizeBefore: `${Math.round(jsonString.length / 1024)} KB`,
      sizeAfter: `${Math.round(compressedBuffer.length / 1024)} KB`
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return handleAuthError(error);
    }
    console.error('[ARCHIVE CONTEST ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
