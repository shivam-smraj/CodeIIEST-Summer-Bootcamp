/**
 * Promote Superadmin Script
 *
 * Sets the SUPERADMIN_EMAIL user's role to 'superadmin' in the DB.
 * Run after the superadmin has signed in at least once.
 *
 * Usage:
 *   npm run promote:superadmin
 *   -- or --
 *   dotenv -e .env.local -- npx tsx scripts/promote-superadmin.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;

if (!MONGODB_URI) { console.error('❌ MONGODB_URI missing'); process.exit(1); }
if (!SUPERADMIN_EMAIL) { console.error('❌ SUPERADMIN_EMAIL missing'); process.exit(1); }

const UserSchema = new mongoose.Schema({ email: String, role: String });
const UserModel = mongoose.models.User ?? mongoose.model('User', UserSchema);

async function promote() {
  console.log(`🔑 Promoting ${SUPERADMIN_EMAIL} to superadmin...`);
  await mongoose.connect(MONGODB_URI!);

  const result = await UserModel.updateOne(
    { email: SUPERADMIN_EMAIL },
    { $set: { role: 'superadmin' } }
  );

  if (result.matchedCount === 0) {
    console.error(`❌ User ${SUPERADMIN_EMAIL} not found. Have they signed in yet?`);
  } else {
    console.log(`✅ ${SUPERADMIN_EMAIL} is now superadmin!`);
  }

  await mongoose.disconnect();
}

promote().catch(console.error);
