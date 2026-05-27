/**
 * Application-wide constants for the CodeIIEST Bootcamp platform.
 * Import from here rather than hardcoding values in components.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_BOOTCAMP_NAME ?? 'CodeIIEST Bootcamp 2026';
export const INSTITUTE_DOMAIN = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL_DOMAIN ?? 'students.iiests.ac.in';
export const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? '';

// Bootcamp configuration
export const TOTAL_WEEKS = 8;
export const BEST_N_WEEKS = 6; // "Best 6 out of 8"
export const PARTICIPATION_BONUS = 50;

// Bootcamp batches participating
export const JUNIOR_BATCH = 2029;  // 2nd year students
export const PEER_BATCH = 2028;    // 3rd year students

// Codeforces scoring formula constants (ICPC mode fallback)
export const CF_MIN_FRACTION = 0.3;    // m — minimum fraction of points
export const CF_TIME_DECAY = 1 / 250;  // c — points decrease per minute
export const CF_WA_PENALTY = 50;       // p — penalty per wrong attempt

// Codeforces API / URL bases
export const CF_API_BASE = 'https://codeforces.com/api';
export const CF_PROFILE_BASE = 'https://codeforces.com/profile';
export const CF_CONTEST_BASE = 'https://codeforces.com/contest';

// Leaderboard filter options
export const LEADERBOARD_FILTERS = [
  { value: 'combined-all', label: 'All Years', icon: '🌐' },
  { value: 'combined-juniors', label: '2nd Year (2029)', icon: '🎓' },
  { value: 'combined-peers', label: '3rd Year (2028)', icon: '👨‍💻' },
  { value: 'women-all', label: 'Women — All', icon: '⭐' },
  { value: 'women-juniors', label: 'Women — Junior', icon: '🌟' },
] as const;

// Department code to full name mapping (parsed from IIEST email)
export const DEPARTMENT_MAP: Record<string, string> = {
  EEB: 'Electrical Engineering',
  CEB: 'Civil Engineering',
  CSB: 'Computer Science & Engineering',
  MEB: 'Mechanical Engineering',
  ETB: 'Electronics & Telecommunication',
  ITB: 'Information Technology',
  MNB: 'Mining Engineering',
  MMB: 'Metallurgical & Materials Engineering',
  AMB: 'Aerospace and Applied Mechanics Engineering',
};

// CF rank color mapping (Tailwind class strings)
export const CF_RANK_COLORS: Record<string, string> = {
  newbie: 'text-slate-400',
  pupil: 'text-green-400',
  specialist: 'text-cyan-400',
  expert: 'text-blue-400',
  'candidate master': 'text-violet-400',
  master: 'text-orange-400',
  'international master': 'text-orange-300',
  grandmaster: 'text-red-400',
  'international grandmaster': 'text-red-500',
  'legendary grandmaster': 'text-red-500',
};

// Week topics & dates — from official Summer Bootcamp 2026 schedule (Jun 01 – Jul 24)
export const WEEK_TOPICS = [
  'STL, Custom Sorting & Syntax',           // W01: Jun 01–05  (The Toolkit)
  'Two Pointers, Sliding Window & Prefix',  // W02: Jun 08–12
  'Binary Search (incl. BS on Answer)',     // W03: Jun 15–19
  'Stack, Queue & Priority Queue',          // W04: Jun 22–26
  'Bit Manipulation',                       // W05: Jun 29–Jul 03
  'Number Theory: Sieve, GCD & Fermat',    // W06: Jul 06–10
  'Recursion & Backtracking',              // W07: Jul 13–17
  'DFS & BFS — Graph Foundations',         // W08: Jul 20–24
] as const;

// Official contest dates from PDF schedule (Season 01)
export const WEEK_DATES = [
  { session: 'Mon, Jun 02', contest: 'Fri, Jun 05' },
  { session: 'Mon, Jun 09', contest: 'Fri, Jun 12' },
  { session: 'Mon, Jun 16', contest: 'Fri, Jun 19' },
  { session: 'Mon, Jun 23', contest: 'Fri, Jun 26' },
  { session: 'Mon, Jun 30', contest: 'Fri, Jul 03' },
  { session: 'Mon, Jul 07', contest: 'Fri, Jul 10' },
  { session: 'Mon, Jul 14', contest: 'Fri, Jul 17' },
  { session: 'Mon, Jul 21', contest: 'Fri, Jul 24' },
] as const;

// House config for faction system (Phase 14)
export const HOUSE_CONFIG = {
  Turing: { color: '#3b82f6', emoji: '⚡', description: 'Champions of algorithms' },
  Dijkstra: { color: '#8b5cf6', emoji: '🕸️', description: 'Masters of graph theory' },
  Lovelace: { color: '#ec4899', emoji: '💡', description: 'Pioneers of elegant solutions' },
  VonNeumann: { color: '#10b981', emoji: '🧠', description: 'Architects of dynamic logic' },
} as const;
