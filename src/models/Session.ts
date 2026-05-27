/**
 * Session (Week) Model — Each document represents one week of the bootcamp.
 *
 * There are exactly 8 Session documents (seeded via scripts/seed-sessions.ts).
 * Admins update these documents via the Session CMS in the admin panel.
 *
 * Key flags:
 *   isUnlocked        — admin unlocks when the week begins (shows content to students)
 *   isContestPosted   — admin flips after contest ends (reveals editorial/solutions)
 *   isRecordingAvailable — admin flips when recording is uploaded
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

interface Prerequisite {
  title: string;
  link: string;
  type: 'pdf' | 'video' | 'article' | 'problem-set';
  isRequired: boolean;
}

interface PostContestData {
  cfContestLink: string;
  editorialLink: string;
  solutionsRepoLink: string;
  videoEditorialLink?: string;
  additionalNotes?: string;
}

export interface ISession extends Document {
  weekNumber: number;        // 1-8
  topic: string;             // e.g. "The Toolkit & Optimization"
  subTopics: string[];       // e.g. ["C++ STL", "Time Complexity", ...]
  targetRating: string;      // e.g. "800-1000"

  // Live session details (set by admin before each session)
  sessionDate?: Date;
  durationMinutes: number;   // default 120
  mentorName: string;
  meetLink: string;          // Google Meet URL
  recordingLink?: string;    // YouTube/Drive link after session ends

  // Learning resources
  prerequisites: Prerequisite[];
  additionalResources: Prerequisite[];
  sessionNotes?: string;     // Admin markdown notes shown to students

  // Post-contest resources (revealed after isContestPosted = true)
  postContestData?: PostContestData;

  // Control flags
  isUnlocked: boolean;
  isContestPosted: boolean;
  isRecordingAvailable: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const PrerequisiteSchema = new Schema<Prerequisite>(
  {
    title:      { type: String, required: true },
    link:       { type: String, required: true },
    type:       { type: String, enum: ['pdf', 'video', 'article', 'problem-set'], default: 'article' },
    isRequired: { type: Boolean, default: false },
  },
  { _id: false }
);

const PostContestSchema = new Schema<PostContestData>(
  {
    cfContestLink:     { type: String, default: '' },
    editorialLink:     { type: String, default: '' },
    solutionsRepoLink: { type: String, default: '' },
    videoEditorialLink:{ type: String },
    additionalNotes:   { type: String },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    weekNumber:    { type: Number, required: true, unique: true, min: 1, max: 8 },
    topic:         { type: String, required: true, trim: true },
    subTopics:     { type: [String], default: [] },
    targetRating:  { type: String, default: '' },

    // Live session
    sessionDate:   { type: Date },
    durationMinutes:{ type: Number, default: 120 },
    mentorName:    { type: String, default: '', trim: true },
    meetLink:      { type: String, default: '' },
    recordingLink: { type: String },

    // Resources
    prerequisites:       { type: [PrerequisiteSchema], default: [] },
    additionalResources: { type: [PrerequisiteSchema], default: [] },
    sessionNotes:        { type: String },

    // Post-contest
    postContestData: { type: PostContestSchema },

    // Flags
    isUnlocked:            { type: Boolean, default: false },
    isContestPosted:       { type: Boolean, default: false },
    isRecordingAvailable:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

SessionSchema.index({ weekNumber: 1 });
SessionSchema.index({ isUnlocked: 1 });

export const Session: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) ??
  mongoose.model<ISession>('Session', SessionSchema);
