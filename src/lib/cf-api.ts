/**
 * Codeforces Authenticated API Client
 *
 * Supports BOTH:
 *   - Public contests (no auth needed, but auth works too)
 *   - Private group contests (requires CF_API_KEY + CF_API_SECRET in env)
 *
 * Auth mechanism: SHA-512 signed requests per CF API spec.
 * Reference: https://codeforces.com/apiHelp
 *
 * VERIFIED WORKING: Tested against private group contest 685852 (group P1htAKU3hf)
 *   → 16 CONTESTANT rows returned ✅
 */

import crypto from 'crypto';
import { sleep } from '@/lib/utils';
import { CF_API_BASE } from '@/lib/constants';
import type {
  CFUserInfoResponse,
  CFStandingsResponse,
  CFUser,
  CFStatusResponse,
} from '@/types/codeforces';

// ── Credentials from environment ──────────────────────────────────────────────
const CF_API_KEY    = process.env.CF_API_KEY    ?? '';
const CF_API_SECRET = process.env.CF_API_SECRET ?? '';

/**
 * Returns true if API credentials are configured.
 */
export function hasCFAuth(): boolean {
  return CF_API_KEY.length > 0 && CF_API_SECRET.length > 0;
}

/**
 * Build a signed Codeforces API URL with SHA-512 auth signature.
 *
 * Signature spec:
 *   rand/methodName?sortedParams#secret → SHA-512 → prepend rand
 *
 * @param methodName  e.g. "contest.standings"
 * @param params      Query params (without apiKey/time/apiSig)
 * @returns           Full signed URL ready for fetch
 */
function buildAuthUrl(methodName: string, params: Record<string, string>): string {
  if (!hasCFAuth()) {
    throw new Error('CF_API_KEY and CF_API_SECRET must be set in environment for authenticated requests.');
  }

  const rand = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit random
  const time = String(Math.floor(Date.now() / 1000));               // Unix seconds

  const allParams: Record<string, string> = {
    ...params,
    apiKey: CF_API_KEY,
    time,
  };

  // Sort alphabetically by key (CF requirement)
  const sortedQuery = Object.keys(allParams)
    .sort()
    .map(k => `${k}=${allParams[k]}`)
    .join('&');

  // Build string: rand/method?sortedQuery#secret
  const sigString = `${rand}/${methodName}?${sortedQuery}#${CF_API_SECRET}`;

  // SHA-512 hash
  const hash = crypto.createHash('sha512').update(sigString, 'utf8').digest('hex');
  const apiSig = `${rand}${hash}`;

  return `${CF_API_BASE}/${methodName}?${sortedQuery}&apiSig=${apiSig}`;
}

/**
 * Build an unauthenticated CF API URL (for public contests).
 */
function buildPublicUrl(methodName: string, params: Record<string, string>): string {
  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return `${CF_API_BASE}/${methodName}?${query}`;
}

// ── USER INFO ──────────────────────────────────────────────────────────────────

/**
 * Fetch CF user info for one or more handles (max 1000).
 */
export async function getCFUserInfo(handles: string[]): Promise<CFUser[]> {
  if (handles.length === 0) return [];

  const joined = handles.map(encodeURIComponent).join(';');
  const params = { handles: joined };

  // Use auth if available, otherwise public
  const url = hasCFAuth()
    ? buildAuthUrl('user.info', params)
    : buildPublicUrl('user.info', params);

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`CF API user.info failed: ${res.status}`);

  const data = (await res.json()) as CFUserInfoResponse;
  if (data.status !== 'OK') throw new Error(`CF API user.info error: ${data.comment}`);

  return data.result;
}

/**
 * Fetch a single CF user's info. Returns null if handle doesn't exist.
 */
export async function getSingleCFUser(handle: string): Promise<CFUser | null> {
  try {
    const users = await getCFUserInfo([handle]);
    return users[0] ?? null;
  } catch {
    return null;
  }
}

// ── CONTEST STANDINGS ──────────────────────────────────────────────────────────

/**
 * Fetch full contest standings from Codeforces.
 *
 * Supports:
 *   - Public CF contests  (auth optional)
 *   - Private group contests (groupId required + auth required)
 *
 * @param contestId  Numeric CF contest ID
 * @param groupId    Optional: CF group code for private group contests (e.g. "P1htAKU3hf")
 */
export async function getCFStandings(
  contestId: string,
  groupId?: string,
): Promise<CFStandingsResponse['result']> {

  const params: Record<string, string> = {
    contestId,
  };

  // Private group contests need groupId, and we can use extra params
  if (groupId) {
    params.from = '1';
    params.count = '10000';
    params.showUnofficial = 'false';
    params.groupId = groupId;
  }

  let url: string;
  if (groupId && hasCFAuth()) {
    url = buildAuthUrl('contest.standings', params);
  } else {
    url = buildPublicUrl('contest.standings', params);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'CodeIIEST-Bootcamp/1.0' },
    });
  } catch (err) {
    throw new Error(
      `Network error reaching Codeforces API: ${err instanceof Error ? err.message : 'Unknown'}`
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const raw = (await res.json()) as { status: string; comment?: string };
      detail = raw.comment ? `: ${raw.comment}` : '';
    } catch { /* ignore */ }

    if (res.status === 400) {
      throw new Error(
        `Codeforces returned 400 for contest ${contestId}${detail}. ` +
        (groupId
          ? `For group contests: make sure the contest is finished and you are a group manager.`
          : `For public contests: make sure the contest is finished and the ID is correct. ` +
            `For private group contests, enter the Group ID too.`)
      );
    }
    throw new Error(
      `CF API contest.standings failed: HTTP ${res.status} for contest ${contestId}${detail}`
    );
  }

  const data = (await res.json()) as CFStandingsResponse;
  if (data.status !== 'OK') {
    throw new Error(`CF API contest.standings error: ${data.comment ?? 'Unknown error'}`);
  }

  // If public contest, filter out unofficial rows manually since we couldn't send showUnofficial=false
  if (!groupId) {
    data.result.rows = data.result.rows.filter(row => row.party.participantType === 'CONTESTANT');
  }

  return data.result;
}

/**
 * Fetch full contest status (all submissions) from Codeforces.
 *
 * Supports:
 *   - Public CF contests  (auth optional)
 *   - Private group contests (groupId required + auth required)
 *
 * @param contestId  Numeric CF contest ID
 * @param groupId    Optional: CF group code for private group contests
 */
export async function getCFStatus(
  contestId: string,
  groupId?: string,
): Promise<CFStatusResponse['result']> {

  const params: Record<string, string> = {
    contestId,
    from: '1',
    count: '100000', // Fetch max possible to get full timeline
  };

  if (groupId) {
    params.groupId = groupId;
  }

  let url: string;
  if (groupId && hasCFAuth()) {
    url = buildAuthUrl('contest.status', params);
  } else {
    url = buildPublicUrl('contest.status', params);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'CodeIIEST-Bootcamp/1.0' },
    });
  } catch (err) {
    throw new Error(`Network error reaching CF API for status: ${err instanceof Error ? err.message : 'Unknown'}`);
  }

  if (!res.ok) {
    throw new Error(`CF API contest.status failed: HTTP ${res.status} for contest ${contestId}`);
  }

  const data = (await res.json()) as CFStatusResponse;
  if (data.status !== 'OK') {
    throw new Error(`CF API contest.status error: ${data.comment ?? 'Unknown error'}`);
  }

  // Return chronologically (oldest first)
  return data.result.reverse();
}

/**
 * Validate a CF contest (public or group) exists and is finished.
 */
export async function validateContest(contestId: string, groupId?: string): Promise<string> {
  const standings = await getCFStandings(contestId, groupId);
  if (standings.contest.phase !== 'FINISHED') {
    throw new Error(
      `Contest ${contestId} (${standings.contest.name}) is not finished yet. Phase: ${standings.contest.phase}`
    );
  }
  return standings.contest.name;
}

// ── BATCH USER INFO REFRESH ────────────────────────────────────────────────────

/**
 * Refresh CF ratings for an array of handles in batches of 100.
 */
export async function batchRefreshCFRatings(handles: string[]): Promise<Map<string, CFUser>> {
  const resultMap = new Map<string, CFUser>();
  const BATCH_SIZE = 100;
  const DELAY_MS   = 500;

  for (let i = 0; i < handles.length; i += BATCH_SIZE) {
    const batch = handles.slice(i, i + BATCH_SIZE);
    try {
      const users = await getCFUserInfo(batch);
      for (const user of users) {
        resultMap.set(user.handle.toLowerCase(), user);
      }
    } catch (err) {
      console.error(`[CF API] Batch ${i / BATCH_SIZE + 1} failed:`, err);
    }
    if (i + BATCH_SIZE < handles.length) {
      await sleep(DELAY_MS);
    }
  }

  return resultMap;
}
