/**
 * User Model — Core data structure for the CodeIIEST Bootcamp platform.
 *
 * The `scores` array is the most critical field:
 *   scores[0] = Week 1 score
 *   scores[1] = Week 2 score
 *   ...
 *   scores[7] = Week 8 score
 *
 * totalPoints is always computed as: sum of top BEST_N_WEEKS (6) scores from scores[].
 * weeklyRanks[i] stores the user's rank within Week i's contest.
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

export type UserRole = 'user' | 'admin' | 'superadmin';
export type Gender = 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
export type House = 'Turing' | 'Dijkstra' | 'Lovelace' | 'VonNeumann';

export interface IUser extends Document {
  // Identity
  googleId?: string;
  email: string;
  name: string;                // Raw Google name (from OAuth)
  displayName: string;         // User-chosen name (shown on leaderboard)
  image?: string;              // Google profile picture URL

  // Institutional data (auto-parsed from email, locked after onboarding)
  rollId: string;              // e.g. "2024EEB109"
  entryYear: number;           // e.g. 2024
  batch: number;               // graduation year, e.g. 2028
  department: string;          // e.g. "Electrical Engineering"
  deptCode: string;            // e.g. "EEB"

  // Profile
  gender?: Gender;

  // Role-based access control
  role: UserRole;

  // Onboarding state
  isOnboardingComplete: boolean;

  // Codeforces — set via CF OAuth (one-click, <3 sec)
  cfHandle?: string;
  cfRating?: number;
  cfRank?: string;
  cfAvatar?: string;
  isCfVerified: boolean;       // Permanently true after OAuth verification
  cfVerifiedAt?: Date;

  // Bootcamp scoring
  scores: number[];            // scores[0..7] for weeks 1..8 (max 8 elements)
  weeklyRanks: number[];       // rank in each week's contest (0 = didn't participate)
  totalPoints: number;         // sum of top BEST_N_WEEKS (6) scores — pre-computed
  missedContests: number[];    // week indices where user didn't participate

  // Gamification (Phase 14)
  house?: House;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    // Identity
    googleId:    { type: String, sparse: true, unique: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:        { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    image:       { type: String },

    // Institutional data
    rollId:      { type: String, trim: true, uppercase: true },
    entryYear:   { type: Number },
    batch:       { type: Number },             // graduation year
    department:  { type: String, trim: true },
    deptCode:    { type: String, trim: true, uppercase: true },

    // Profile
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'PreferNotToSay'],
    },

    // RBAC
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },

    // Onboarding
    isOnboardingComplete: { type: Boolean, default: false },

    // Codeforces
    cfHandle:     { type: String, trim: true },
    cfRating:     { type: Number },
    cfRank:       { type: String },
    cfAvatar:     { type: String },
    isCfVerified: { type: Boolean, default: false },
    cfVerifiedAt: { type: Date },

    // Scoring — CRITICAL: max 8 elements, index = weekNumber - 1
    scores:        { type: [Number], default: [] },
    weeklyRanks:   { type: [Number], default: [] },
    totalPoints:   { type: Number, default: 0 },
    missedContests:{ type: [Number], default: [] },

    // Gamification
    house: {
      type: String,
      enum: ['Turing', 'Dijkstra', 'Lovelace', 'VonNeumann'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── INDEXES ────────────────────────────────────────────────────────────────
// Leaderboard query: sort by totalPoints DESC, filter by isCfVerified + isOnboardingComplete
UserSchema.index({ totalPoints: -1 });
UserSchema.index({ isCfVerified: 1, isOnboardingComplete: 1 });
UserSchema.index({ batch: 1 });
UserSchema.index({ gender: 1 });
UserSchema.index({ cfHandle: 1 }, { sparse: true, unique: true });
UserSchema.index({ rollId: 1 }, { sparse: true });

// ─── EXPORT ──────────────────────────────────────────────────────────────────
// Use mongoose.models cache to prevent "Cannot overwrite model once compiled" error
// in Next.js hot-reload / serverless environment
export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>('User', UserSchema);
