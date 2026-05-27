/**
 * Score Calculator — "Best 6 out of 8" logic and per-problem scoring.
 *
 * Two scoring modes (determined by contest type from CF API):
 *
 * 1. CF-RULES contests: row.points is already the score. Use directly.
 *    - Standard Codeforces round: points decay over time automatically
 *    - Score = row.points (already computed by CF)
 *
 * 2. ICPC-RULES contests (Gym, ICPC-style):
 *    - Points field is always 0
 *    - We calculate using the ICPC formula with time decay
 *    - Score = max(0.3×x, x − (1/250)×x×t) − 50×w
 *      where x = max problem points, t = solve time (min), w = wrong attempts
 *
 * Global total: sum of top BEST_N_WEEKS (6) scores from the scores[] array.
 * Participation bonus (+50) is added if user solved at least 1 problem.
 */

import {
  BEST_N_WEEKS,
  PARTICIPATION_BONUS,
  CF_MIN_FRACTION,
  CF_TIME_DECAY,
  CF_WA_PENALTY,
} from '@/lib/constants';
import type { CFRanklistRow, CFProblem } from '@/types/codeforces';

// ─── PER-PROBLEM SCORING (ICPC mode) ─────────────────────────────────────────

/**
 * Calculate score for a single problem in ICPC mode.
 * Formula: max(m×x, x − c×x×t) − p×w
 *
 * @param maxPoints  - Max points for the problem (from problem definition)
 * @param solveTimeMinutes - Time of solve in minutes from contest start
 * @param wrongAttempts - Number of rejected submissions before AC
 * @returns Score (never negative, 0 if wrong formula gives negative)
 */
export function calcICPCProblemScore(
  maxPoints: number,
  solveTimeMinutes: number,
  wrongAttempts: number
): number {
  const decayed = maxPoints - CF_TIME_DECAY * maxPoints * solveTimeMinutes;
  const withPenalty = decayed - CF_WA_PENALTY * wrongAttempts;
  const minimum = CF_MIN_FRACTION * maxPoints;
  return Math.max(0, Math.max(minimum, withPenalty));
}

// ─── ROW SCORING ──────────────────────────────────────────────────────────────

/**
 * Calculate a user's total score for a contest row.
 *
 * @param row - CF ranklist row for this user
 * @param problems - List of contest problems (for maxPoints in ICPC mode)
 * @param isICPC - Whether to use ICPC formula (true) or use row.points (false)
 * @returns { score, participated }
 */
export function calcRowScore(
  row: CFRanklistRow,
  problems: CFProblem[],
  isICPC: boolean
): { score: number; participated: boolean } {
  if (isICPC) {
    // Sum ICPC-mode scores across all solved problems
    let total = 0;
    let solved = false;

    for (let i = 0; i < row.problemResults.length; i++) {
      const result = row.problemResults[i];
      const problem = problems[i];

      if (!result || result.type !== 'FINAL') continue;
      if (!result.bestSubmissionTimeSeconds) continue;

      const maxPoints = problem?.points ?? 1000;
      const solveTimeMin = Math.floor(result.bestSubmissionTimeSeconds / 60);
      const wrongAttempts = result.rejectedAttemptCount;

      const problemScore = calcICPCProblemScore(maxPoints, solveTimeMin, wrongAttempts);
      total += problemScore;
      solved = true;
    }

    const bonus = solved ? PARTICIPATION_BONUS : 0;
    return { score: Math.round(total + bonus), participated: solved };
  } else {
    // CF-rules: use row.points directly
    const participated = row.points > 0;
    const bonus = participated ? PARTICIPATION_BONUS : 0;
    return { score: Math.round(row.points + bonus), participated };
  }
}

// ─── TOTAL POINTS (BEST N OF 8) ───────────────────────────────────────────────

/**
 * Calculate total points from a user's scores array.
 * Uses the "Best 6 out of 8" rule: sort descending, sum top 6.
 *
 * @param scores - Array of up to 8 weekly scores (0 if missed)
 * @returns Total points (sum of top BEST_N_WEEKS scores)
 */
export function calcTotalPoints(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;

  // Sort descending and take top N
  const sorted = [...scores].sort((a, b) => b - a);
  const topN = sorted.slice(0, BEST_N_WEEKS);
  return topN.reduce((sum, s) => sum + s, 0);
}

/**
 * Calculate streak — number of consecutive weeks with score > 0
 * (from the most recent non-zero week, working backwards).
 *
 * @param scores - Weekly scores array
 * @returns Number of consecutive weeks (current streak)
 */
export function calculateStreak(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;

  let streak = 0;
  // Work backwards from the last non-zero score
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i] > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
