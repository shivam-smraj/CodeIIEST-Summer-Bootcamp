'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ExternalLink, ChevronDown, ChevronRight, Trophy, RefreshCw, Trash2, AlertTriangle, CalendarPlus, X } from 'lucide-react';
import { WEEK_TOPICS } from '@/lib/constants';

const TOPICS = [...WEEK_TOPICS];

const CF_RANK_COLOR: Record<string, string> = {
  newbie: '#9e9e9e', pupil: '#4caf50', specialist: '#03a9f4',
  expert: '#1e88e5', 'candidate master': '#aa00ff',
  master: '#ff6d00', grandmaster: '#f44336',
};

interface ContestStanding {
  cfHandle: string;
  rank: number;
  points: number;
  penalty: number;
  displayName: string | null;
  rollId: string | null;
  department: string | null;
  batch: number | null;
  cfRating: number | null;
  cfRank: string | null;
  totalPoints: number;
  weekScore: number;
}

interface ContestLog {
  _id: string;
  cfContestId: string;
  contestName: string;
  weekNumber: number;
  syncedAt: string;
  syncedBy: string;
  participantCount: number;
  updatedUserCount: number;
  scoreType: 'cf-rules' | 'icpc-rules';
  standings?: ContestStanding[];
  status?: 'SCHEDULED' | 'SYNCED';
  groupId?: string;
  replayUrl?: string;
}

export function AdminContestsClient() {
  const [contests,     setContests]     = useState<ContestLog[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [loadingStand, setLoadingStand] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [revertingId,  setRevertingId]  = useState<string | null>(null);
  const [confirmId,    setConfirmId]    = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [formData, setFormData] = useState({ cfContestId: '', groupId: '', contestName: '', weekNumber: '1' });

  const handleArchive = async (contest: any) => {
    try {
      setArchivingId(contest._id);
      const res = await fetch('/api/admin/archive-contest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId: contest.cfContestId, groupId: contest.groupId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to archive');
      alert(`Success: ${data.message}\nSize reduced from ${data.sizeBefore} to ${data.sizeAfter}`);
      window.location.reload();
    } catch (err) {
      alert(`Archive failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    fetch('/api/admin/contests')
      .then(r => r.json())
      .then(d => setContests(d.contests ?? []))
      .catch(() => toast.error('Failed to load contests'))
      .finally(() => setIsLoading(false));
  }, []);

  const loadStandings = async (contest: ContestLog) => {
    if (contest.standings) {
      setExpandedId(expandedId === contest._id ? null : contest._id);
      return;
    }
    if (loadingStand === contest._id) return;
    setLoadingStand(contest._id);

    try {
      const res  = await fetch(`/api/admin/contests?contestId=${contest.cfContestId}`);
      const data = await res.json();
      if (data.success) {
        setContests(prev => prev.map(c => c._id === contest._id ? { ...c, standings: data.contest.standings } : c));
        setExpandedId(contest._id);
      }
    } catch {
      toast.error('Failed to load standings');
    } finally {
      setLoadingStand(null);
    }
  };

  const handleRevert = async (contest: ContestLog) => {
    setRevertingId(contest._id);
    setConfirmId(null);
    try {
      const res  = await fetch(`/api/admin/contests/${contest.cfContestId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ Reverted W${contest.weekNumber} — ${data.revertedCount} users zeroed`);
        setContests(prev => prev.filter(c => c._id !== contest._id));
      } else {
        toast.error(data.error ?? 'Revert failed');
      }
    } catch {
      toast.error('Network error during revert');
    } finally {
      setRevertingId(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    try {
      const res = await fetch('/api/admin/contests/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contest scheduled successfully!');
        setContests(prev => [...prev, data.contest].sort((a, b) => a.weekNumber - b.weekNumber));
        setShowSchedule(false);
        setFormData({ cfContestId: '', groupId: '', contestName: '', weekNumber: '1' });
      } else {
        toast.error(data.error || 'Failed to schedule contest');
      }
    } catch (err) {
      toast.error('Network error while scheduling');
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 76, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 2s infinite' }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '56px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📋</p>
        <p style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 6, fontSize: 18 }}>No contests synced yet</p>
        <p style={{ color: '#374151', fontSize: 14 }}>
          Use the <a href="/admin/sync" style={{ color: '#60a5fa' }}>Sync Contest</a> tool to sync your first contest.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Overview row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        {[
          { label: 'Contests Synced', value: contests.length },
          { label: 'Total Participants', value: contests.reduce((s, c) => s + c.participantCount, 0) },
          { label: 'Weeks Covered', value: new Set(contests.map(c => c.weekNumber)).size },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 20px', flex: 1, minWidth: 140 }}>
            <p style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 22, fontFamily: 'monospace' }}>{value}</p>
          </div>
        ))}
        
        {/* Schedule Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <button onClick={() => setShowSchedule(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            <CalendarPlus style={{ width: 18, height: 18 }} />
            Schedule Upcoming Contest
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 450, position: 'relative' }}>
            <button onClick={() => setShowSchedule(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X style={{ width: 24, height: 24 }} />
            </button>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Schedule Contest</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Add an upcoming or live contest to the dashboard before syncing it.</p>
            
            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>CF Contest ID *</label>
                <input required type="text" value={formData.cfContestId} onChange={e => setFormData({ ...formData, cfContestId: e.target.value })}
                  placeholder="e.g. 696557"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Contest Name *</label>
                <input required type="text" value={formData.contestName} onChange={e => setFormData({ ...formData, contestName: e.target.value })}
                  placeholder="e.g. CodeIIEST Week 1"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Week Number *</label>
                  <select required value={formData.weekNumber} onChange={e => setFormData({ ...formData, weekNumber: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => <option key={w} value={w} style={{ background: '#0f172a' }}>Week {w}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Group ID (Optional)</label>
                  <input type="text" value={formData.groupId} onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                    placeholder="e.g. P1htAKU3hf"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14 }} />
                </div>
              </div>
              <button disabled={isScheduling} type="submit"
                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 16, cursor: isScheduling ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                {isScheduling ? 'Scheduling...' : 'Schedule Contest'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contest cards */}
      {contests.map((c) => {
        const isExpanded = expandedId === c._id;
        const isLoadingSt = loadingStand === c._id;
        const isReverting = revertingId === c._id;
        const isConfirming = confirmId === c._id;

        return (
          <div key={c._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>

            {/* Contest header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', flexWrap: 'wrap' }}>
              {/* Week badge */}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#60a5fa', fontWeight: 900, fontSize: 16, fontFamily: 'monospace' }}>W{c.weekNumber}</span>
              </div>

              {/* Contest info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <a href={`https://codeforces.com/contest/${c.cfContestId}`} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {c.contestName}
                    <ExternalLink style={{ width: 12, height: 12, opacity: 0.4 }} />
                  </a>
                  {c.status === 'SCHEDULED' ? (
                    <span style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>
                      SCHEDULED
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700, color: '#34d399' }}>
                      SYNCED
                    </span>
                  )}
                  <span style={{ background: c.scoreType === 'icpc-rules' ? 'rgba(167,139,250,0.12)' : 'rgba(96,165,250,0.12)', border: `1px solid ${c.scoreType === 'icpc-rules' ? 'rgba(167,139,250,0.3)' : 'rgba(96,165,250,0.3)'}`, borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700, color: c.scoreType === 'icpc-rules' ? '#c4b5fd' : '#60a5fa' }}>
                    {c.scoreType === 'icpc-rules' ? 'ICPC' : 'CF'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ color: '#374151', fontSize: 12, fontFamily: 'monospace' }}>ID: {c.cfContestId}</span>
                  <span style={{ color: '#374151', fontSize: 12 }}>Week topic: {TOPICS[c.weekNumber - 1]}</span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#374151', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Participants</p>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>{c.participantCount}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#374151', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Updated</p>
                  <p style={{ color: '#34d399', fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>{c.updatedUserCount}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: 12 }}>{new Date(c.syncedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                  <p style={{ color: '#374151', fontSize: 11 }}>{c.syncedBy?.split('@')[0]}</p>
                </div>
              </div>

              {/* Expand button & Archive Button */}
              {c.status === 'SCHEDULED' ? (
                <div style={{ background: 'transparent', padding: '7px 14px', color: '#64748b', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                  Awaiting Sync
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => loadStandings(c)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                    {isLoadingSt
                      ? <RefreshCw style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                      : isExpanded
                        ? <ChevronDown style={{ width: 13, height: 13 }} />
                        : <ChevronRight style={{ width: 13, height: 13 }} />}
                    Full Standings
                  </button>
                  
                  {/* Archive Button */}
                  {c.replayUrl ? (
                     <a href={c.replayUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#34d399', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                       Archived (R2)
                     </a>
                  ) : (
                     <button onClick={() => handleArchive(c)} disabled={archivingId === c._id}
                       style={{ background: archivingId === c._id ? '#475569' : '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: archivingId === c._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}>
                       {archivingId === c._id ? <RefreshCw style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : 'Archive to CDN'}
                     </button>
                  )}
                </div>
              )}

              {/* Revert button */}
              {isConfirming ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                  <AlertTriangle style={{ width: 13, height: 13, color: '#f87171', flexShrink: 0 }} />
                  <span style={{ color: '#f87171', fontSize: 11, fontWeight: 600 }}>Revert W{c.weekNumber}?</span>
                  <button onClick={() => handleRevert(c)} disabled={isReverting}
                    style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {isReverting ? '...' : 'Yes, Revert'}
                  </button>
                  <button onClick={() => setConfirmId(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 11, cursor: 'pointer', padding: '4px 6px' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmId(c._id)} disabled={isReverting}
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  title="Revert this contest — zeros all participant scores">
                  <Trash2 style={{ width: 13, height: 13 }} />
                  Revert
                </button>
              )}
            </div>

            {/* Expanded standings table */}
            {isExpanded && c.standings && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'auto' }}>
                {/* Standings header */}
                <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Trophy style={{ width: 14, height: 14, color: '#fbbf24' }} />
                  <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13 }}>Full Standings — {c.standings.length} participants</span>
                  <span style={{ marginLeft: 'auto', color: '#374151', fontSize: 11 }}>Score in W{c.weekNumber} · Total Points (Best 6 of 8)</span>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {['Rank', 'Participant', 'Roll ID', 'Dept', 'Batch', 'CF Handle', 'Rating', `W${c.weekNumber} Score`, 'Total Points'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#374151', textAlign: h === 'Rank' ? 'center' : 'left', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.standings
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map((s, si) => {
                        const rc = CF_RANK_COLOR[s.cfRank?.toLowerCase() ?? ''] ?? '#9e9e9e';
                        return (
                          <tr key={`${s.cfHandle}-${si}`} style={{ background: si % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <span style={{ color: s.rank <= 3 ? '#fbbf24' : '#374151', fontWeight: s.rank <= 3 ? 900 : 500, fontFamily: 'monospace' }}>#{s.rank}</span>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {s.displayName
                                ? <span style={{ color: '#fff', fontWeight: 600 }}>{s.displayName}</span>
                                : <span style={{ color: '#374151', fontStyle: 'italic' }}>Unregistered</span>}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#374151', fontFamily: 'monospace', fontSize: 11 }}>{s.rollId ?? '—'}</td>
                            <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{s.department ?? '—'}</td>
                            <td style={{ padding: '8px 12px', color: '#374151', fontSize: 11 }}>{s.batch ?? '—'}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <a href={`https://codeforces.com/profile/${s.cfHandle}`} target="_blank" rel="noopener noreferrer"
                                style={{ color: rc, fontFamily: 'monospace', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                @{s.cfHandle} <ExternalLink style={{ width: 9, height: 9, opacity: 0.4 }} />
                              </a>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {s.cfRating
                                ? <span style={{ background: `${rc}15`, border: `1px solid ${rc}40`, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, color: rc, fontFamily: 'monospace' }}>{s.cfRating}</span>
                                : <span style={{ color: '#1f2937' }}>—</span>}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>{s.weekScore ?? s.points}</span>
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'left' }}>
                              <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>{s.totalPoints}</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
