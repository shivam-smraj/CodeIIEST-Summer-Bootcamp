/**
 * Shared TypeScript types and interfaces for the CodeIIEST Bootcamp platform.
 * These supplement the Mongoose model types and provide client-friendly shapes.
 */

// ─── LEADERBOARD TYPES ────────────────────────────────────────────────────────

export interface LeaderboardUser {
  _id: string;
  rank: number;
  displayName: string;
  name: string;
  cfHandle: string;
  cfRating?: number;
  cfRank?: string;
  cfAvatar?: string;
  totalPoints: number;
  scores: number[];
  weeklyRanks: number[];
  batch: number;
  gender: string;
  department: string;
  rollId: string;
  house?: 'Turing' | 'Dijkstra' | 'Lovelace' | 'VonNeumann';
}

export interface LeaderboardResponse {
  users: LeaderboardUser[];
  top3: LeaderboardUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filter: string;
}

// ─── SESSION TYPES ────────────────────────────────────────────────────────────

export interface PrerequisiteItem {
  title: string;
  link: string;
  type: 'pdf' | 'video' | 'article' | 'problem-set';
  isRequired: boolean;
}

export interface PostContestData {
  cfContestLink: string;
  editorialLink: string;
  solutionsRepoLink: string;
  videoEditorialLink?: string;
  additionalNotes?: string;
}

export interface SessionData {
  _id: string;
  weekNumber: number;
  topic: string;
  subTopics: string[];
  targetRating: string;
  sessionDate?: string;
  durationMinutes: number;
  mentorName: string;
  meetLink: string;
  recordingLink?: string;
  prerequisites: PrerequisiteItem[];
  postContestData?: PostContestData;
  sessionNotes?: string;
  additionalResources: PrerequisiteItem[];
  isUnlocked: boolean;
  isContestPosted: boolean;
  isRecordingAvailable: boolean;
}

export type WeekMeta = Pick<SessionData, '_id' | 'weekNumber' | 'topic' | 'isUnlocked'>;

// Alias for backward compatibility
export type SessionResource = PrerequisiteItem;

// ─── CONTEST SYNC TYPES ───────────────────────────────────────────────────────

export interface ContestSyncRequest {
  contestId: string;
  weekNumber: number;
}

export interface ContestSyncResponse {
  success: boolean;
  contestId: string;
  contestName: string;
  weekNumber: number;
  participantCount: number;
  updatedUserCount: number;
  logs: string[];
  error?: string;
}

// ─── ADMIN TYPES ──────────────────────────────────────────────────────────────

export interface AdminUser {
  _id: string;
  name: string;
  displayName: string;
  email: string;
  rollId: string;
  batch: number;
  department: string;
  gender: string | null;
  cfHandle: string;
  cfRating?: number;
  isCfVerified: boolean;
  role: 'user' | 'admin' | 'superadmin';
  totalPoints: number;
  scores: number[];
  isOnboardingComplete: boolean;
  createdAt: string;
}

export interface UserRoleUpdateRequest {
  userId: string;
  newRole: 'user' | 'admin';
}

// ─── FILTER TYPES ─────────────────────────────────────────────────────────────

export type LeaderboardFilter =
  | 'combined-all'
  | 'combined-juniors'
  | 'combined-peers'
  | 'women-all'
  | 'women-juniors';

export type UserRole = 'user' | 'admin' | 'superadmin';
export type Gender = 'Male' | 'Female' | 'Other' | 'PreferNotToSay';

// ─── PROFILE TYPES ────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  displayName: string;
  email: string;
  image?: string;
  rollId: string;
  batch: number;
  department: string;
  deptCode: string;
  gender?: Gender;
  role: UserRole;
  cfHandle?: string;
  cfRating?: number;
  cfRank?: string;
  cfAvatar?: string;
  isCfVerified: boolean;
  cfVerifiedAt?: string;
  totalPoints: number;
  scores: number[];
  weeklyRanks: number[];
  missedContests: number[];
  isOnboardingComplete: boolean;
  house?: 'Turing' | 'Dijkstra' | 'Lovelace' | 'VonNeumann';
  createdAt: string;
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}

export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
  message?: string;
}
