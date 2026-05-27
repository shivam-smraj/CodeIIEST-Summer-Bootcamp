/**
 * Reset Contest Script
 *
 * Removes a Contest document and zeroes out users' scores for that week.
 * USE ONLY if you need to re-sync a contest (e.g., data was wrong).
 *
 * Usage:
 *   CONTEST_ID=1923 WEEK_NUMBER=1 npm run reset:contest
 *   -- or --
 *   CONTEST_ID=1923 WEEK_NUMBER=1 dotenv -e .env.local -- npx tsx scripts/reset-contest.ts
 *
 * ⚠️  This is DESTRUCTIVE — it will reset scores for all users for that week.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const CONTEST_ID = process.env.CONTEST_ID;
const WEEK_NUMBER = Number(process.env.WEEK_NUMBER);

if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }
if (!CONTEST_ID) { console.error('❌ CONTEST_ID env var missing'); process.exit(1); }
if (!WEEK_NUMBER || WEEK_NUMBER < 1 || WEEK_NUMBER > 8) {
  console.error('❌ WEEK_NUMBER env var must be 1–8');
  process.exit(1);
}

const weekIndex = WEEK_NUMBER - 1;

const ContestSchema = new mongoose.Schema({ cfContestId: String });
const UserSchema = new mongoose.Schema({ scores: [Number], weeklyRanks: [Number], missedContests: [Number], totalPoints: Number });

const ContestModel = mongoose.models.Contest ?? mongoose.model('Contest', ContestSchema);
const UserModel = mongoose.models.User ?? mongoose.model('User', UserSchema);

async function reset() {
  console.log(`⚠️  Resetting contest ${CONTEST_ID} (Week ${WEEK_NUMBER})...`);
  await mongoose.connect(MONGODB_URI!);

  // 1. Delete contest audit record
  const deleted = await ContestModel.deleteOne({ cfContestId: CONTEST_ID });
  console.log(`  🗑️  Contest doc deleted: ${deleted.deletedCount}`);

  // 2. Zero out scores[weekIndex] for all users
  const usersResult = await UserModel.updateMany(
    {},
    {
      $set: { [`scores.${weekIndex}`]: 0, [`weeklyRanks.${weekIndex}`]: 0 },
      $pull: { missedContests: weekIndex },
    }
  );
  console.log(`  ♻️  Users reset: ${usersResult.modifiedCount}`);

  // 3. Recalculate totalPoints would require loading all users — skip for now
  // (scores are zeroed; totalPoints will be updated on next sync)
  console.log('\n✅ Reset complete. You can now re-sync this contest.');
  console.log('⚠️  NOTE: totalPoints will be recalculated on the next sync.');

  await mongoose.disconnect();
}

reset().catch(console.error);
