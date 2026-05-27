/**
 * Database Seed Script
 *
 * Creates the 8 Session documents for the bootcamp.
 * Run ONCE when setting up the project:
 *
 *   npx tsx scripts/seed-db.ts
 *
 * Prerequisites:
 *   1. MONGODB_URI must be set in .env.local
 *   2. Run: npm install -g tsx  (or: npx tsx scripts/seed-db.ts)
 *
 * Safe to run multiple times — uses upsert on weekNumber.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

// ── Load env (dotenv won't pick up .env.local by default) ──────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment');
  process.exit(1);
}

// ── Inline schemas for seed script ────────────────────────────────────────
const ResourceSchema = new mongoose.Schema({
  title: String, link: String, type: String, isRequired: Boolean,
}, { _id: false });

const PostContestSchema = new mongoose.Schema({
  cfContestLink: String, editorialLink: String, solutionsRepoLink: String,
  videoEditorialLink: String, additionalNotes: String,
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true, unique: true, min: 1, max: 8 },
  topic: { type: String, required: true },
  subTopics: [String],
  targetRating: String,
  sessionDate: Date,
  durationMinutes: { type: Number, default: 90 },
  mentorName: String,
  meetLink: String,
  recordingLink: String,
  prerequisites: [ResourceSchema],
  additionalResources: [ResourceSchema],
  sessionNotes: String,
  postContestData: PostContestSchema,
  isUnlocked: { type: Boolean, default: false },
  isContestPosted: { type: Boolean, default: false },
  isRecordingAvailable: { type: Boolean, default: false },
}, { timestamps: true });

const SessionModel = mongoose.models.Session ?? mongoose.model('Session', SessionSchema);

// ── Seed data ──────────────────────────────────────────────────────────────
const SESSIONS = [
  {
    weekNumber: 1,
    topic: 'STL, Custom Sorting & Syntax',
    subTopics: ['STL containers (vector, set, map, multiset)', 'Custom comparators & sort()', 'Fast I/O (ios_base::sync_with_stdio)', 'Competitive C++ template'],
    targetRating: '800–1200',
    sessionDate: new Date('2026-06-02'),
    durationMinutes: 90,
    prerequisites: [
      { title: 'CP Setup Guide', link: 'https://codeforces.com/blog/entry/47094', type: 'article', isRequired: true },
    ],
  },
  {
    weekNumber: 2,
    topic: 'Two Pointers, Sliding Window & Prefix Sums',
    subTopics: ['Two pointer technique', 'Sliding window (fixed & variable)', 'Prefix sum arrays', 'Difference arrays'],
    targetRating: '1000–1400',
    sessionDate: new Date('2026-06-09'),
    durationMinutes: 90,
  },
  {
    weekNumber: 3,
    topic: 'Binary Search (incl. BS on Answer)',
    subTopics: ['Binary search on sorted array', 'Binary search on answer', 'lower_bound / upper_bound in STL', 'Ternary search intro'],
    targetRating: '1200–1500',
    sessionDate: new Date('2026-06-16'),
    durationMinutes: 90,
  },
  {
    weekNumber: 4,
    topic: 'Stack, Queue & Priority Queue',
    subTopics: ['Stack applications (monotonic stack)', 'Queue & deque', 'Priority queue (min/max heap)', 'Problems: Next Greater Element, Sliding Window Max'],
    targetRating: '1300–1600',
    sessionDate: new Date('2026-06-23'),
    durationMinutes: 90,
  },
  {
    weekNumber: 5,
    topic: 'Bit Manipulation',
    subTopics: ['Bitwise operators (AND, OR, XOR, shifts)', 'Bitmask enumeration', 'Common tricks (lowbit, popcount)', 'Subset enumeration with bits'],
    targetRating: '1400–1700',
    sessionDate: new Date('2026-06-30'),
    durationMinutes: 90,
  },
  {
    weekNumber: 6,
    topic: 'Number Theory: Sieve, GCD & Fermat',
    subTopics: ['Sieve of Eratosthenes', 'GCD & LCM (Euclidean algorithm)', 'Binary exponentiation', 'Fermat\'s little theorem & modular inverse'],
    targetRating: '1500–1800',
    sessionDate: new Date('2026-07-07'),
    durationMinutes: 90,
  },
  {
    weekNumber: 7,
    topic: 'Recursion & Backtracking',
    subTopics: ['Recursive thinking & base cases', 'Backtracking with pruning', 'Permutations & subsets', 'N-Queens, Sudoku Solver pattern'],
    targetRating: '1600–1900',
    sessionDate: new Date('2026-07-14'),
    durationMinutes: 120,
  },
  {
    weekNumber: 8,
    topic: 'DFS & BFS — Graph Foundations',
    subTopics: ['Graph representation (adj list)', 'DFS — connected components, cycle detection', 'BFS — shortest path in unweighted graph', 'Bipartite check'],
    targetRating: '1700–2100',
    sessionDate: new Date('2026-07-21'),
    durationMinutes: 120,
  },
];

// ── Main ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected!\n');

  let created = 0;
  let updated = 0;

  for (const sessionData of SESSIONS) {
    const result = await SessionModel.findOneAndUpdate(
      { weekNumber: sessionData.weekNumber },
      { $set: sessionData },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const isNew = result.createdAt?.getTime() === result.updatedAt?.getTime();
    if (isNew) {
      created++;
      console.log(`  ✨ Created: Week ${sessionData.weekNumber} — ${sessionData.topic}`);
    } else {
      updated++;
      console.log(`  🔄 Updated: Week ${sessionData.weekNumber} — ${sessionData.topic}`);
    }
  }

  console.log(`\n🎉 Done! ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
