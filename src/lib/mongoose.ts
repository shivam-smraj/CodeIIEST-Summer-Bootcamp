/**
 * MongoDB connection with global caching for Next.js serverless/Vercel.
 *
 * CRITICAL: This pattern prevents connection exhaustion on Vercel.
 * On Vercel, each serverless function invocation may spin up a new Node.js
 * process. Without caching, every API request would open a new connection,
 * quickly exhausting the MongoDB Atlas M0 free tier limit (~500 connections).
 *
 * This module caches both the connection and the pending promise in the
 * Node.js global object, which persists across hot-reloads in development
 * and across multiple invocations within the same Vercel function container
 * in production.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global type to include our cache
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

// Initialize cache from global (survives hot-reload in dev)
const cached: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};
global.__mongooseCache = cached;

/**
 * Connect to MongoDB with connection caching.
 * Call this at the top of every API route handler and server action.
 *
 * @example
 * await connectToDatabase();
 * const users = await User.find({}).lean();
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Start a new connection if no pending promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,  // Don't buffer operations when disconnected
      dbName: process.env.MONGODB_DB_NAME ?? 'codeiiest_bootcamp',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  // Await the pending connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on failure so next call retries
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
