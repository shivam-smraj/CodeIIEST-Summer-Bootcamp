/**
 * Codeforces API response types.
 * Reference: https://codeforces.com/apiHelp
 */

// ─── CF USER ──────────────────────────────────────────────────────────────────

export interface CFUser {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CFUserInfoResponse {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: CFUser[];
}

// ─── CF CONTEST ───────────────────────────────────────────────────────────────

export interface CFContest {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase: 'BEFORE' | 'CODING' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST' | 'FINISHED';
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
  preparedBy?: string;
  websiteUrl?: string;
  description?: string;
  difficulty?: number;
  kind?: string;
  icpcRegion?: string;
  country?: string;
  city?: string;
  season?: string;
}

export interface CFContestListResponse {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: CFContest[];
}

// ─── CF STANDINGS ─────────────────────────────────────────────────────────────

export interface CFProblemResult {
  points: number;
  penalty?: number;
  rejectedAttemptCount: number;
  type: 'PRELIMINARY' | 'FINAL';
  bestSubmissionTimeSeconds?: number;
}

export interface CFRanklistRow {
  party: CFParty;
  rank: number;
  points: number;
  penalty: number;
  successfulHackCount: number;
  unsuccessfulHackCount: number;
  problemResults: CFProblemResult[];
  lastSubmissionTimeSeconds?: number;
}

export interface CFParty {
  contestId?: number;
  members: CFMember[];
  participantType: 'CONTESTANT' | 'PRACTICE' | 'VIRTUAL' | 'MANAGER' | 'OUT_OF_COMPETITION';
  teamId?: number;
  teamName?: string;
  ghost: boolean;
  room?: number;
  startTimeSeconds?: number;
}

export interface CFMember {
  handle: string;
  name?: string;
}

export interface CFProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: 'PROGRAMMING' | 'QUESTION';
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CFStandingsResponse {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: {
    contest: CFContest;
    problems: CFProblem[];
    rows: CFRanklistRow[];
  };
}

// ─── CF OAUTH ID TOKEN PAYLOAD ────────────────────────────────────────────────

export interface CFOAuthTokenPayload {
  sub: string;           // CF user ID
  handle: string;        // CF handle
  nonce: string;         // Anti-replay nonce
  iat: number;
  exp: number;
}
