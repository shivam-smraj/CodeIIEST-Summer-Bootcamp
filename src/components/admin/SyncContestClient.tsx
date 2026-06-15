'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2, Eye, DatabaseZap, RotateCcw, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Trophy, Users, ExternalLink,
  Save, Info, Code2,
} from 'lucide-react';
import { WEEK_TOPICS, WEEK_DATES, PARTICIPATION_BONUS, CF_TIME_DECAY, CF_WA_PENALTY, CF_MIN_FRACTION } from '@/lib/constants';
import { calcICPCProblemScore } from '@/lib/score-calculator';
import type { BootcampParticipantPreview, CFRowPreview, PreviewResponse } from '@/app/api/admin/sync-contest/preview/route';

const TOPICS = [...WEEK_TOPICS];
const DATES  = [...WEEK_DATES];

const CF_RANK_COLOR: Record<string, string> = {
  newbie: '#9e9e9e', pupil: '#4caf50', specialist: '#03a9f4',
  expert: '#1e88e5', 'candidate master': '#aa00ff',
  master: '#ff6d00', grandmaster: '#f44336',
};

type Phase = 'FORM' | 'FETCHING' | 'PREVIEW' | 'COMMITTING' | 'DONE';

// ── Mutable participant row state ──────────────────────────────────────────────
interface EditableParticipant extends BootcampParticipantPreview {
  editedScore: number;    // admin-edited score (starts = calculatedScore)
  isIncluded:  boolean;
}

export function SyncContestClient() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [contestId,  setContestId]  = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [groupId,    setGroupId]    = useState('');
  const [isPrivate,  setIsPrivate]  = useState(false);

  // ── Phase state ─────────────────────────────────────────────────────────────
  const [phase,       setPhase]       = useState<Phase>('FORM');
  const [preview,     setPreview]     = useState<PreviewResponse | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  // ── Editable participant list ────────────────────────────────────────────────
  const [participants, setParticipants] = useState<EditableParticipant[]>([]);
  const [basePoints, setBasePoints] = useState<Record<string, number>>({});

  // ── UI state ────────────────────────────────────────────────────────────────
  const [cfRowsExpanded,     setCfRowsExpanded]     = useState(false);
  const [notPartExpanded,    setNotPartExpanded]     = useState(false);
  const [unmatchedExpanded,  setUnmatchedExpanded]  = useState(false);
  const [expandedRow,        setExpandedRow]        = useState<string | null>(null);
  const [commitResult,       setCommitResult]       = useState<{ updatedCount: number; contestName: string } | null>(null);
  const [markNonPart,        setMarkNonPart]        = useState(true);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFetchPreview = async () => {
    if (!contestId.trim() || !weekNumber) {
      toast.error('Please fill in Contest ID and Week Number');
      return;
    }
    if (isPrivate && !groupId.trim()) {
      toast.error('Group ID is required for private contests');
      return;
    }
    setPhase('FETCHING');

    try {
      const res = await fetch('/api/admin/sync-contest/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId: contestId.trim(),
          weekNumber: parseInt(weekNumber, 10),
          ...(isPrivate && groupId.trim() ? { groupId: groupId.trim() } : {}),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error ?? 'Failed to fetch preview');
        setPhase('FORM');
        return;
      }

      const pdata = data as PreviewResponse & { success: boolean };
      setPreview(pdata);

      // Initialise editable participant list
      const editable: EditableParticipant[] = pdata.bootcampParticipants.map(p => ({
        ...p,
        editedScore: p.calculatedScore,
        isIncluded:  true,
      }));
      setParticipants(editable);

      // Initialise base points for ICPC mode
      const initialBps: Record<string, number> = {};
      pdata.problems.forEach(p => {
        initialBps[p.index] = p.maxPoints ?? 1000;
      });
      setBasePoints(initialBps);

      setPhase('PREVIEW');
      toast.success(`Preview loaded — ${pdata.bootcampParticipants.length} bootcamp participants found`);
    } catch (err) {
      toast.error('Network error fetching preview');
      setPhase('FORM');
    }
  };

  const updateScore = useCallback((userId: string, val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return;
    setParticipants(prev => prev.map(p =>
      p.userId === userId ? { ...p, editedScore: n } : p
    ));
  }, []);

  const toggleInclude = useCallback((userId: string) => {
    setParticipants(prev => prev.map(p =>
      p.userId === userId ? { ...p, isIncluded: !p.isIncluded } : p
    ));
  }, []);

  // ── Auto-recalculation on base points change ─────────────────────────────────
  // Note: Using a custom stringified dep to prevent exhaustive-deps warning loops
  const basePointsStr = JSON.stringify(basePoints);
  useEffect(() => {
    if (!preview || preview.scoreType !== 'icpc-rules') return;

    setParticipants(prev => prev.map(p => {
      let total = 0;
      let solved = false;
      
      p.problemResults.forEach(pr => {
        if (pr.points > 0 && pr.solveTimeSeconds != null) { // Accepted
          const bp = basePoints[pr.index] ?? 1000;
          const solveTimeMin = Math.floor(pr.solveTimeSeconds / 60);
          total += calcICPCProblemScore(bp, solveTimeMin, pr.wrongAttempts);
          solved = true;
        }
      });
      
      const bonus = solved ? PARTICIPATION_BONUS : 0;
      const newCalc = Math.round(total + bonus);
      const isOverridden = p.editedScore !== p.calculatedScore;

      return {
        ...p,
        calculatedScore: newCalc,
        editedScore: isOverridden ? p.editedScore : newCalc,
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePointsStr, preview?.scoreType]);

  const handleCommit = async () => {
    if (!preview) return;
    setIsCommitting(true);
    setPhase('COMMITTING');

    const nonParticipantIds = markNonPart
      ? (preview.notParticipated?.map(u => u.userId) ?? [])
      : [];

    try {
      const res = await fetch('/api/admin/sync-contest/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId:    preview.contest.id,
          weekNumber:   preview.weekNumber,
          groupId:      isPrivate && groupId.trim() ? groupId.trim() : undefined,
          contestName:  preview.contest.name,
          contestType:  preview.contest.type,
          scoreType:    preview.scoreType,
          participants: participants.map(p => ({
            userId:     p.userId,
            cfHandle:   p.cfHandle,
            score:      p.editedScore,
            rank:       p.rank,
            isIncluded: p.isIncluded,
          })),
          markNonParticipants: markNonPart,
          nonParticipantIds,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setCommitResult({ updatedCount: data.updatedCount, contestName: data.contestName });
        setPhase('DONE');
        setIsCommitting(false);
        toast.success(`✅ ${data.updatedCount} scores committed to database`);
      } else {
        toast.error(data.error ?? 'Commit failed');
        setPhase('PREVIEW');
        setIsCommitting(false);
      }
    } catch {
      toast.error('Network error during commit');
      setPhase('PREVIEW');
      setIsCommitting(false);
    }
  };

  const handleReset = () => {
    setPhase('FORM');
    setPreview(null);
    setParticipants([]);
    setBasePoints({});
    setCommitResult(null);
    setCfRowsExpanded(false);
    setNotPartExpanded(false);
    setUnmatchedExpanded(false);
    setExpandedRow(null);
  };

  const weekIdx = weekNumber ? parseInt(weekNumber, 10) - 1 : -1;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  // ── DONE screen ─────────────────────────────────────────────────────────────
  if (phase === 'DONE' && commitResult) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 28, marginBottom: 8 }}>Sync Complete!</h2>
        <p style={{ color: '#34d399', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          {commitResult.updatedCount} scores written to database
        </p>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>
          Contest: <strong style={{ color: '#e2e8f0' }}>{commitResult.contestName}</strong> — Week {weekNumber}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={handleReset} style={btnStyle('#2563eb')}>← Sync Another Contest</button>
          <a href="/admin/contests" style={{ ...btnStyle('rgba(255,255,255,0.08)'), textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
            View Contest Log
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── FORM ────────────────────────────────────────────────────────────── */}
      {(phase === 'FORM' || phase === 'FETCHING') && (
        <div style={{ maxWidth: 640 }}>
          {/* Week preview banner */}
          {weekIdx >= 0 && (
            <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Week {weekNumber} Topic</p>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{TOPICS[weekIdx]}</p>
              </div>
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.07)' }} />
              <div>
                <p style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Contest Date</p>
                <p style={{ color: '#60a5fa', fontWeight: 600, fontSize: 12 }}>{DATES[weekIdx]?.contest}</p>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Contest ID */}
            <div>
              <Label htmlFor="contestId" style={labelStyle}>Codeforces Contest ID <Req /></Label>
              <Input id="contestId" value={contestId} onChange={e => setContestId(e.target.value)}
                placeholder="e.g. 685852" style={inputStyle} />
              <p style={hintStyle}>Group URL: codeforces.com/group/<span style={{ color: '#a78bfa' }}>GROUPCODE</span>/contest/<span style={{ color: '#60a5fa' }}>XXXXXX</span></p>
            </div>

            {/* Private toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isPrivate ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isPrivate ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10 }}>
              <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#a78bfa', cursor: 'pointer' }} />
              <label htmlFor="isPrivate" style={{ color: isPrivate ? '#c4b5fd' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1 }}>
                🔒 Private / Group Contest
                <span style={{ display: 'block', fontWeight: 400, fontSize: 11, color: '#374151', marginTop: 1 }}>Enable for Codeforces Group contests</span>
              </label>
            </div>

            {isPrivate && (
              <div>
                <Label htmlFor="groupId" style={{ ...labelStyle, color: '#c4b5fd' }}>CF Group ID <Req /></Label>
                <Input id="groupId" value={groupId} onChange={e => setGroupId(e.target.value)}
                  placeholder="e.g. P1htAKU3hf"
                  style={{ ...inputStyle, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.25)' }} />
                <p style={hintStyle}>Your default group: <span style={{ color: '#a78bfa' }}>P1htAKU3hf</span></p>
              </div>
            )}

            {/* Week selector */}
            <div>
              <Label style={labelStyle}>Week Number <Req /></Label>
              <Select value={weekNumber} onValueChange={setWeekNumber}>
                <SelectTrigger style={inputStyle}><SelectValue placeholder="Select week" /></SelectTrigger>
                <SelectContent style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.10)' }}>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(w => (
                    <SelectItem key={w} value={String(w)} style={{ color: '#fff' }}>
                      W{w} — {TOPICS[w - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fetch preview button */}
            <button onClick={handleFetchPreview} disabled={phase === 'FETCHING'}
              style={{ ...btnStyle('#2563eb'), height: 48, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', boxShadow: '0 0 24px rgba(37,99,235,0.25)' }}>
              {phase === 'FETCHING'
                ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Fetching from Codeforces...</>
                : <><Eye style={{ width: 16, height: 16 }} /> Fetch Preview</>}
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW ─────────────────────────────────────────────────────────── */}
      {phase === 'PREVIEW' && preview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contest meta header */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 22px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {preview.alreadySynced && (
                  <span style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.30)', borderRadius: 20, padding: '2px 10px', fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>
                    ⚠️ ALREADY SYNCED
                  </span>
                )}
                <span style={{ background: preview.scoreType === 'icpc-rules' ? 'rgba(167,139,250,0.12)' : 'rgba(96,165,250,0.12)', border: `1px solid ${preview.scoreType === 'icpc-rules' ? 'rgba(167,139,250,0.3)' : 'rgba(96,165,250,0.3)'}`, borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: preview.scoreType === 'icpc-rules' ? '#c4b5fd' : '#60a5fa' }}>
                  {preview.scoreType === 'icpc-rules' ? 'ICPC Rules' : 'CF Rules'}
                </span>
              </div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{preview.contest.name}</h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Week', value: `W${preview.weekNumber}` },
                  { label: 'CF Rows', value: preview.totalCFRows },
                  { label: 'Contestants', value: preview.contestantCount },
                  { label: 'Bootcamp Matched', value: preview.bootcampParticipants.length },
                  { label: 'Unmatched', value: preview.unmatchedCFHandles.length },
                  { label: 'Problems', value: preview.problems.length },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>{label}</p>
                    <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={handleReset} style={{ ...btnStyle('rgba(255,255,255,0.05)'), border: '1px solid rgba(255,255,255,0.12)', fontSize: 12 }}>
                <RotateCcw style={{ width: 13, height: 13 }} /> Change
              </button>
            </div>
          </div>

          {/* Problem legend */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#374151', fontSize: 11, fontWeight: 700 }}>Problems:</span>
            {preview.problems.map(p => (
              <span key={p.index} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#94a3b8' }}>
                {p.index}. {p.name}
              </span>
            ))}
          </div>

          {/* Scoring Rules & Formula */}
          {preview.scoreType === 'icpc-rules' && (
            <div style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.20)', borderRadius: 16, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Info style={{ width: 16, height: 16, color: '#a78bfa' }} />
                <h3 style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 14, margin: 0 }}>ICPC Scoring Formula & Base Points</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch' }}>
                <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(167,139,250,0.1)' }}>
                  <p style={{ color: '#fff', fontSize: 13, fontFamily: 'monospace', marginBottom: 8, fontWeight: 700 }}>
                    Score = max({CF_MIN_FRACTION}x, x - (x * t * {CF_TIME_DECAY})) - {CF_WA_PENALTY}w
                  </p>
                  <ul style={{ color: '#94a3b8', fontSize: 11, margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li><strong style={{ color: '#cbd5e1' }}>x</strong> = Base points for problem (configurable below)</li>
                    <li><strong style={{ color: '#cbd5e1' }}>t</strong> = Time taken to solve in minutes ({(CF_TIME_DECAY * 100).toFixed(1)}% decay per min)</li>
                    <li><strong style={{ color: '#cbd5e1' }}>w</strong> = Wrong attempts before correct answer (-{CF_WA_PENALTY} points each)</li>
                    <li><strong style={{ color: '#cbd5e1' }}>Bonus</strong>: +{PARTICIPATION_BONUS} points participation bonus if at least 1 problem is solved</li>
                  </ul>
                </div>
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, margin: 0 }}>Adjust Base Points (x):</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {preview.problems.map(p => (
                      <div key={p.index} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Prob {p.index}</label>
                        <input
                          type="number"
                          value={basePoints[p.index] ?? 1000}
                          onChange={e => setBasePoints(prev => ({ ...prev, [p.index]: parseInt(e.target.value, 10) || 0 }))}
                          style={{ width: 64, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(167,139,250,0.3)', color: '#fff', borderRadius: 6, padding: '4px 6px', fontSize: 12, fontFamily: 'monospace', textAlign: 'center', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TABLE A: All CF rows ──────────────────────────────────────── */}
          <CollapsibleSection
            label={`Table A — All CF Standings (${preview.cfRows.length} rows)`}
            icon={<Code2 style={{ width: 14, height: 14 }} />}
            expanded={cfRowsExpanded}
            onToggle={() => setCfRowsExpanded(v => !v)}
            accent="#374151"
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['#', 'Handle', 'Type', 'Solved', 'Points', 'Penalty', ...preview.problems.map(p => p.index), 'In Bootcamp'].map(h => (
                      <th key={h} style={{ ...thStyle, textAlign: h === '#' ? 'left' : 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.cfRows.map((row, i) => (
                    <tr key={`${row.cfHandle}-${i}`} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={tdStyle}><span style={{ color: row.rank <= 3 ? '#fbbf24' : '#374151', fontWeight: row.rank <= 3 ? 800 : 500, fontFamily: 'monospace' }}>#{row.rank}</span></td>
                      <td style={tdStyle}>
                        <a href={`https://codeforces.com/profile/${row.cfHandle}`} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontFamily: 'monospace', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {row.cfHandle} <ExternalLink style={{ width: 9, height: 9, opacity: 0.5 }} />
                        </a>
                        {row.isBootcampUser && <span style={{ marginLeft: 5, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 4, padding: '0 5px', fontSize: 9, color: '#34d399' }}>✓</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{ fontSize: 9, color: '#64748b' }}>{row.participantType}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#fff', fontWeight: 700 }}>{row.solved}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#e2e8f0', fontFamily: 'monospace' }}>{row.points}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>{row.penalty}</td>
                      {preview.problems.map((prob, pi) => {
                        const pr = row.problemResults[pi];
                        const solved = pr?.points > 0;
                        return (
                          <td key={prob.index} style={{ ...tdStyle, textAlign: 'center' }}>
                            {solved ? (
                              <span style={{ color: '#34d399', fontWeight: 700, fontSize: 11 }}>
                                +{pr.wrongAttempts > 0 ? pr.wrongAttempts : ''}
                                <br />
                                <span style={{ fontSize: 9, color: '#64748b' }}>{pr.solveTimeSeconds ? `${Math.floor(pr.solveTimeSeconds / 60)}m` : ''}</span>
                              </span>
                            ) : pr?.wrongAttempts > 0 ? (
                              <span style={{ color: '#f87171', fontSize: 11 }}>-{pr.wrongAttempts}</span>
                            ) : (
                              <span style={{ color: '#1f2937' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {row.isBootcampUser
                          ? <CheckCircle2 style={{ width: 13, height: 13, color: '#34d399', margin: '0 auto' }} />
                          : <XCircle style={{ width: 13, height: 13, color: '#374151', margin: '0 auto' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          {/* ── TABLE B: Bootcamp Participants — EDITABLE ─────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(52,211,153,0.20)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(52,211,153,0.04)' }}>
              <Trophy style={{ width: 15, height: 15, color: '#34d399' }} />
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Table B — Bootcamp Participants ({participants.length})</h3>
              <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 12 }}>Edit scores · Toggle include/exclude</span>
            </div>

            <div style={{ padding: '8px 16px', background: 'rgba(251,191,36,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 12 }}>
                <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
                Edit score in the <strong>Override</strong> column. Uncheck ✓ to exclude a participant from this sync.
              </p>
            </div>

            {/* Column headers */}
            <div style={{ ...gridB, padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['✓', '#', 'Participant', 'Dept/Batch', 'CF Rating', 'Solved', 'Penalty', 'Auto Score', 'Override', '→ New Total', 'Expand'].map((h, i) => (
                <div key={h} style={{ fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
              ))}
            </div>

            {participants.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#374151' }}>
                No bootcamp participants matched from this contest
              </div>
            )}

            {participants.map((p, idx) => {
              const rc = CF_RANK_COLOR[p.cfRank?.toLowerCase() ?? ''] ?? '#9e9e9e';
              const isExpanded = expandedRow === p.userId;
              const prevScoresArr = Array.from({ length: 8 }, (_, i) => 0); // placeholder
              return (
                <div key={p.userId}>
                  <div style={{
                    ...gridB, padding: '10px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: !p.isIncluded ? 'rgba(239,68,68,0.03)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    opacity: p.isIncluded ? 1 : 0.5,
                  }}>
                    {/* Include toggle */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" checked={p.isIncluded} onChange={() => toggleInclude(p.userId)}
                        style={{ width: 15, height: 15, accentColor: '#34d399', cursor: 'pointer' }} />
                    </div>

                    {/* Rank */}
                    <div style={{ color: p.rank <= 3 ? '#fbbf24' : '#374151', fontWeight: 800, fontFamily: 'monospace', fontSize: 13 }}>#{p.rank}</div>

                    {/* Name + handle */}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.displayName}</p>
                      <a href={`https://codeforces.com/profile/${p.cfHandle}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: rc, fontSize: 11, fontFamily: 'monospace', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        @{p.cfHandle} <ExternalLink style={{ width: 9, height: 9, opacity: 0.5 }} />
                      </a>
                    </div>

                    {/* Dept/Batch */}
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      <div>{p.deptCode}</div>
                      <div style={{ color: '#374151', fontSize: 10 }}>Batch {p.batch}</div>
                    </div>

                    {/* CF Rating */}
                    <div>
                      <span style={{ background: `${rc}15`, border: `1px solid ${rc}40`, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: rc, fontFamily: 'monospace' }}>
                        {p.cfRating || '—'}
                      </span>
                    </div>

                    {/* Solved */}
                    <div style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'monospace', fontSize: 13, textAlign: 'center' }}>{p.cfSolved}</div>

                    {/* Penalty */}
                    <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>{p.cfPenalty}</div>

                    {/* Auto score */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{p.calculatedScore}</span>
                      {p.prevWeekScore > 0 && (
                        <div style={{ fontSize: 9, color: '#374151', marginTop: 1 }}>prev: {p.prevWeekScore}</div>
                      )}
                    </div>

                    {/* Override input */}
                    <div>
                      <input type="number" min="0" value={p.editedScore}
                        onChange={e => updateScore(p.userId, e.target.value)}
                        style={{ width: '100%', padding: '5px 8px', background: p.editedScore !== p.calculatedScore ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.editedScore !== p.calculatedScore ? 'rgba(251,191,36,0.40)' : 'rgba(255,255,255,0.10)'}`, borderRadius: 7, color: '#fff', fontSize: 13, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }}
                      />
                      {p.editedScore !== p.calculatedScore && (
                        <div style={{ fontSize: 9, color: '#fbbf24', textAlign: 'center', marginTop: 2 }}>edited</div>
                      )}
                    </div>

                    {/* New total */}
                    <div style={{ textAlign: 'center' }}>
                      {(() => {
                        // Recalculate projected new total with edited score
                        // Simple approximation: just show the trend
                        const diff = p.editedScore - p.prevWeekScore;
                        return (
                          <>
                            <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>~{p.newTotalPoints}</span>
                            {diff !== 0 && (
                              <div style={{ fontSize: 9, color: diff > 0 ? '#34d399' : '#f87171', marginTop: 1 }}>
                                {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Expand per-problem */}
                    <div>
                      <button onClick={() => setExpandedRow(isExpanded ? null : p.userId)}
                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 7px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
                        {isExpanded ? <ChevronDown style={{ width: 11, height: 11 }} /> : <ChevronRight style={{ width: 11, height: 11 }} />}
                        {preview.problems.length}
                      </button>
                    </div>
                  </div>

                  {/* Expanded per-problem row */}
                  {isExpanded && (
                    <div style={{ padding: '10px 16px 14px 48px', background: 'rgba(96,165,250,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {p.problemResults.map((pr, pi) => {
                        const probName = preview.problems[pi]?.index ?? String(pi);
                        const solved = pr.points > 0;
                        return (
                          <div key={pr.index} style={{ background: solved ? 'rgba(52,211,153,0.08)' : pr.wrongAttempts > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${solved ? 'rgba(52,211,153,0.25)' : pr.wrongAttempts > 0 ? 'rgba(239,68,68,0.20)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '6px 12px', minWidth: 80 }}>
                            <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, marginBottom: 3 }}>Prob {probName}</div>
                            {solved ? (
                              <>
                                <div style={{ color: '#34d399', fontWeight: 800, fontSize: 13 }}>✓</div>
                                {pr.solveTimeSeconds && <div style={{ color: '#64748b', fontSize: 10 }}>{Math.floor(pr.solveTimeSeconds / 60)}m {pr.solveTimeSeconds % 60}s</div>}
                                {pr.wrongAttempts > 0 && <div style={{ color: '#f87171', fontSize: 10 }}>-{pr.wrongAttempts} WA</div>}
                              </>
                            ) : pr.wrongAttempts > 0 ? (
                              <div style={{ color: '#f87171', fontWeight: 700 }}>✗ ×{pr.wrongAttempts}</div>
                            ) : (
                              <div style={{ color: '#1f2937' }}>—</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Unmatched CF handles ──────────────────────────────────────── */}
          {preview.unmatchedCFHandles.length > 0 && (
            <CollapsibleSection
              label={`Unmatched CF Handles (${preview.unmatchedCFHandles.length}) — in CF but not registered`}
              icon={<AlertCircle style={{ width: 13, height: 13 }} />}
              expanded={unmatchedExpanded}
              onToggle={() => setUnmatchedExpanded(v => !v)}
              accent="#f97316"
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '12px 16px' }}>
                {preview.unmatchedCFHandles.map(h => (
                  <a key={h} href={`https://codeforces.com/profile/${h}`} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: '4px 12px', color: '#fb923c', fontSize: 12, fontFamily: 'monospace', textDecoration: 'none' }}>
                    @{h}
                  </a>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ── Not participated ──────────────────────────────────────────── */}
          {preview.notParticipated.length > 0 && (
            <CollapsibleSection
              label={`Not Participated (${preview.notParticipated.length}) — registered but didn't compete`}
              icon={<Users style={{ width: 13, height: 13 }} />}
              expanded={notPartExpanded}
              onToggle={() => setNotPartExpanded(v => !v)}
              accent="#374151"
            >
              <div style={{ padding: '8px 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: 'rgba(251,191,36,0.06)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.15)' }}>
                  <input type="checkbox" id="markNonPart" checked={markNonPart} onChange={e => setMarkNonPart(e.target.checked)} style={{ accentColor: '#fbbf24', cursor: 'pointer' }} />
                  <label htmlFor="markNonPart" style={{ color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark these {preview.notParticipated.length} users as &ldquo;missed&rdquo; in W{weekNumber} (score = 0)
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                  {preview.notParticipated.map(u => (
                    <div key={u.userId} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 12px' }}>
                      <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{u.displayName}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                        <a href={`https://codeforces.com/profile/${u.cfHandle}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace', textDecoration: 'none' }}>@{u.cfHandle}</a>
                        <span style={{ color: '#374151', fontSize: 11 }}>{u.rollId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* ── Final Commit Bar ──────────────────────────────────────────── */}
          <div style={{ position: 'sticky', bottom: 16, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(52,211,153,0.30)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                Ready to commit{' '}
                <span style={{ color: '#34d399' }}>{participants.filter(p => p.isIncluded).length}</span>
                {' '}participants
              </p>
              <p style={{ color: '#374151', fontSize: 12 }}>
                {participants.filter(p => p.editedScore !== p.calculatedScore).length} scores manually edited ·{' '}
                {participants.filter(p => !p.isIncluded).length} excluded
              </p>
            </div>
            <button onClick={handleCommit} disabled={isCommitting}
              style={{ ...btnStyle('#15803d'), fontSize: 14, height: 44, gap: 8, display: 'flex', alignItems: 'center', boxShadow: '0 0 24px rgba(21,128,61,0.35)', flexShrink: 0 }}>
              {isCommitting
                ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Committing...</>
                : <><DatabaseZap style={{ width: 16, height: 16 }} /> Apply to Database</>}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Req() {
  return <span style={{ color: '#ef4444' }}>*</span>;
}

function CollapsibleSection({ label, icon, expanded, onToggle, accent, children }: {
  label: string; icon: React.ReactNode; expanded: boolean;
  onToggle: () => void; accent: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: accent }}>{icon}</span>
        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, flex: 1 }}>{label}</span>
        {expanded ? <ChevronDown style={{ width: 14, height: 14, color: '#374151' }} /> : <ChevronRight style={{ width: 14, height: 14, color: '#374151' }} />}
      </button>
      {expanded && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
}

// ── Style helpers ──────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 8 };
const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' };
const hintStyle:  React.CSSProperties = { color: '#374151', fontSize: 11, marginTop: 6 };
const thStyle:    React.CSSProperties = { padding: '8px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#374151', whiteSpace: 'nowrap' };
const tdStyle:    React.CSSProperties = { padding: '8px 10px', verticalAlign: 'middle' };
const gridB:      React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '28px 44px 1fr 70px 70px 48px 56px 74px 80px 80px 56px',
  gap: 8, alignItems: 'center',
};
function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };
}
