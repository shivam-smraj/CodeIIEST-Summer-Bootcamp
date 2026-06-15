/**
 * Contest Model — Records each synced Codeforces contest.
 *
 * Created once per contest sync. Prevents re-syncing the same contest.
 * Stores processed standings for audit/history purposes.
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

interface ContestStanding {
  cfHandle: string;
  rank: number;
  points: number;
  penalty: number;        // total time penalty in minutes
}

export interface IContest extends Document {
  // Contest identity
  cfContestId: string;    // Codeforces contest ID (numeric string, e.g. "1923")
  contestName: string;    // From CF API: contest.name
  weekNumber: number;     // 1-8, which bootcamp week this corresponds to
  groupId?: string;       // Optional CF group code if it's a private group contest
  
  // State
  status: 'SCHEDULED' | 'SYNCED'; // SCHEDULED = upcoming/live, SYNCED = finished & scores processed
  startTimeSeconds?: number;      // When the contest starts (used for upcoming sorting)

  // Sync metadata
  syncedAt: Date;
  syncedBy: string;       // email of admin who triggered the sync
  participantCount: number;
  updatedUserCount: number;

  // Scoring
  scoreType: 'cf-rules' | 'icpc-rules'; // how scores were calculated
  standings: ContestStanding[];          // processed standings (CF handles + scores)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ContestStandingSchema = new Schema<ContestStanding>(
  {
    cfHandle: { type: String, required: true },
    rank:     { type: Number, required: true },
    points:   { type: Number, required: true },
    penalty:  { type: Number, default: 0 },
  },
  { _id: false }
);

const ContestSchema = new Schema<IContest>(
  {
    cfContestId:      { type: String, required: true, unique: true },
    contestName:      { type: String, required: true },
    weekNumber:       { type: Number, required: true, min: 1, max: 8 },
    groupId:          { type: String, required: false },
    status:           { type: String, enum: ['SCHEDULED', 'SYNCED'], default: 'SYNCED' },
    startTimeSeconds: { type: Number, required: false },
    syncedAt:         { type: Date, default: Date.now },
    syncedBy:         { type: String, required: true },
    participantCount: { type: Number, default: 0 },
    updatedUserCount: { type: Number, default: 0 },
    scoreType:        { type: String, enum: ['cf-rules', 'icpc-rules'], default: 'cf-rules' },
    standings:        { type: [ContestStandingSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

ContestSchema.index({ weekNumber: 1 });
ContestSchema.index({ syncedAt: -1 });
ContestSchema.index({ status: 1 });

export const Contest: Model<IContest> =
  (mongoose.models.Contest as Model<IContest>) ??
  mongoose.model<IContest>('Contest', ContestSchema);
