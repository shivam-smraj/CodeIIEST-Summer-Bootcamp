import type { CFContest, CFProblem, CFSubmission } from '@/types/codeforces';

export type AppMode = 'setup' | 'playing' | 'finished';
export type ContestMode = 'replay' | 'live';
export type FilterMode = 'bootcamp' | 'all';

export interface UserMapInfo {
  firstName: string;
  rollId: string;
  rating?: number;
  rank?: string;
}

export interface ScoreRow {
  handle: string;
  displayName: string;
  isBootcamp: boolean;
  points: number; 
  penalty: number; 
  problemResults: Record<string, { 
    isAC: boolean; 
    attempts: number; 
    timeSeconds: number | null;
    penalty: number;
  }>;
}

export interface LiveState {
  appMode: AppMode;
  contestId: string;
  groupId: string;
  mode: ContestMode;
  speed: number;
  filter: FilterMode;
  contest: CFContest | null;
  problems: CFProblem[];
  userMap: Record<string, UserMapInfo>;
  submissions: CFSubmission[];
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  isPaused: boolean;
  scoreboard: ScoreRow[];
  recentEvents: CFSubmission[];
  firstSolves: Record<string, number>;
}
