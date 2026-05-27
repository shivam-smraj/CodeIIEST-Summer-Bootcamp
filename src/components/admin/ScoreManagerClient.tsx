'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Save, RotateCcw, ExternalLink, ChevronDown, Search, Filter } from 'lucide-react';
import { WEEK_TOPICS } from '@/lib/constants';

const TOPICS = [...WEEK_TOPICS];

const CF_RANK_COLOR: Record<string, string> = {
  newbie: '#9e9e9e', pupil: '#4caf50', specialist: '#03a9f4',
  expert: '#1e88e5', 'candidate master': '#aa00ff',
  master: '#ff6d00', grandmaster: '#f44336',
};

interface ScoreUser {
  _id: string;
  cfHandle: string;
  cfRating?: number;
  cfRank?: string;
  displayName: string;
  rollId: string;
  department: string;
  deptCode: string;
  batch: number;
  email: string;
  gender?: string;
  scores: number[];
  weeklyRanks: number[];
  totalPoints: number;
}

interface PendingEdit {
  userId: string;
  weekIndex: number;
  originalScore: number;
  newScore: number;
}

export function ScoreManagerClient() {
  const [users,        setUsers]        = useState<ScoreUser[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [pendingEdits, setPendingEdits] = useState<Map<string, PendingEdit>>(new Map());
  const [isSaving,     setIsSaving]     = useState(false);
  const [searchQ,      setSearchQ]      = useState('');
  const [filterBatch,  setFilterBatch]  = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // ── Load users ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/scores')
      .then(r => r.json())
      .then(d => setUsers(d.users ?? []))
      .catch(() => toast.error('Failed to load scores'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Edit handler ──────────────────────────────────────────────────────────
  const handleEdit = useCallback((userId: string, weekIndex: number, rawVal: string, originalScore: number) => {
    const newScore = parseInt(rawVal, 10);
    if (isNaN(newScore) || newScore < 0) return;

    const key = `${userId}_w${weekIndex}`;
    setPendingEdits(prev => {
      const next = new Map(prev);
      if (newScore === originalScore) {
        next.delete(key); // No change → remove pending
      } else {
        next.set(key, { userId, weekIndex, originalScore, newScore });
      }
      return next;
    });

    // Optimistic UI update
    setUsers(prev => prev.map(u => {
      if (u._id !== userId) return u;
      const scores = [...u.scores];
      while (scores.length <= weekIndex) scores.push(0);
      scores[weekIndex] = newScore;
      // Recalculate total locally
      const sorted = [...scores].sort((a, b) => b - a);
      const total  = sorted.slice(0, 6).reduce((s, v) => s + v, 0);
      return { ...u, scores, totalPoints: total };
    }));
  }, []);

  const revertEdit = useCallback((userId: string, weekIndex: number, originalScore: number) => {
    const key = `${userId}_w${weekIndex}`;
    setPendingEdits(prev => { const next = new Map(prev); next.delete(key); return next; });

    setUsers(prev => prev.map(u => {
      if (u._id !== userId) return u;
      const scores = [...u.scores];
      scores[weekIndex] = originalScore;
      const sorted = [...scores].sort((a, b) => b - a);
      const total  = sorted.slice(0, 6).reduce((s, v) => s + v, 0);
      return { ...u, scores, totalPoints: total };
    }));
  }, []);

  // ── Save all pending edits ─────────────────────────────────────────────────
  const saveAll = async () => {
    if (pendingEdits.size === 0) {
      toast.info('No changes to save');
      return;
    }
    setIsSaving(true);

    const updates = [...pendingEdits.values()].map(e => ({
      userId:    e.userId,
      weekIndex: e.weekIndex,
      newScore:  e.newScore,
    }));

    try {
      const res  = await fetch('/api/admin/scores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`✅ ${data.updatedCount} users updated`);
        setPendingEdits(new Map());
        // Refresh from server to get accurate totals
        const fresh = await fetch('/api/admin/scores').then(r => r.json());
        setUsers(fresh.users ?? []);
      } else {
        toast.error(data.error ?? 'Save failed');
      }
    } catch {
      toast.error('Network error saving scores');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filtered users ────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || u.displayName.toLowerCase().includes(q) || u.cfHandle.toLowerCase().includes(q) || u.rollId.toLowerCase().includes(q);
    const matchBatch  = !filterBatch || String(u.batch) === filterBatch;
    return matchSearch && matchBatch;
  });

  const batches = [...new Set(users.map(u => u.batch))].sort();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.03)', animation: 'pulse 2s infinite' }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#374151' }} />
          <input type="text" placeholder="Search by name, handle, roll..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
            style={{ width: '100%', paddingLeft: 30, paddingRight: 12, height: 36, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
          />
        </div>

        {/* Batch filter */}
        <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
          style={{ height: 36, padding: '0 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, color: '#64748b', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b} value={String(b)}>Batch {b}</option>)}
        </select>

        {/* Stats */}
        <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>
          {filtered.length} of {users.length} users
        </div>

        {/* Pending edits indicator + save */}
        {pendingEdits.size > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8 }}>
            <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>{pendingEdits.size} unsaved edits</span>
            <button onClick={saveAll} disabled={isSaving}
              style={{ background: '#fbbf24', color: '#000', border: 'none', borderRadius: 6, padding: '4px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {isSaving ? 'Saving...' : <><Save style={{ width: 12, height: 12 }} /> Save All</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Week header strip ─────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 900 }}>
          {/* Column headers */}
          <div style={gridStyle}>
            <div style={{ gridColumn: '1 / 3', padding: '6px 12px', fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Participant</div>
            {TOPICS.map((t, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '6px 4px' }}>
                <div style={{ color: '#374151', fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>W{i + 1}</div>
                <div style={{ color: '#1f2937', fontSize: 8, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t}>{t.split('&')[0].split(',')[0].trim()}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', padding: '6px 4px', fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
          </div>

          {/* User rows */}
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#374151' }}>No users found</div>
            )}

            {filtered.map((user, i) => {
              const rc          = CF_RANK_COLOR[user.cfRank?.toLowerCase() ?? ''] ?? '#9e9e9e';
              const isExpanded  = expandedUser === user._id;
              const hasPending  = [...pendingEdits.keys()].some(k => k.startsWith(user._id));

              return (
                <div key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Main row */}
                  <div style={{
                    ...gridStyle,
                    padding: '8px 0',
                    background: hasPending ? 'rgba(251,191,36,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    borderLeft: hasPending ? '2px solid rgba(251,191,36,0.5)' : '2px solid transparent',
                  }}>
                    {/* Name + handle */}
                    <div style={{ padding: '0 12px', gridColumn: '1' }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <a href={`https://codeforces.com/profile/${user.cfHandle}`} target="_blank" rel="noopener noreferrer" style={{ color: rc, fontSize: 11, fontFamily: 'monospace', textDecoration: 'none' }}>
                          @{user.cfHandle}
                        </a>
                        <span style={{ color: '#374151', fontSize: 10 }}>·</span>
                        <span style={{ color: '#374151', fontSize: 10 }}>{user.rollId}</span>
                      </div>
                    </div>

                    {/* Batch/dept */}
                    <div style={{ padding: '0 4px', fontSize: 10, color: '#374151' }}>
                      <div>{user.deptCode}</div>
                      <div style={{ color: '#1f2937' }}>{user.batch}</div>
                    </div>

                    {/* Score cells W1–W8 */}
                    {Array.from({ length: 8 }, (_, w) => {
                      const key           = `${user._id}_w${w}`;
                      const pending       = pendingEdits.get(key);
                      const currentScore  = user.scores?.[w] ?? 0;
                      const originalScore = pending ? pending.originalScore : currentScore;
                      const isEdited      = !!pending;

                      return (
                        <div key={w} style={{ padding: '0 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <input
                            type="number" min="0"
                            value={currentScore}
                            onChange={e => handleEdit(user._id, w, e.target.value, originalScore)}
                            style={{
                              width: '100%', textAlign: 'center', padding: '4px 2px',
                              background: isEdited ? 'rgba(251,191,36,0.10)' : currentScore > 0 ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isEdited ? 'rgba(251,191,36,0.40)' : currentScore > 0 ? 'rgba(52,211,153,0.20)' : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: 6, color: isEdited ? '#fbbf24' : currentScore > 0 ? '#34d399' : '#374151',
                              fontSize: 12, fontFamily: 'monospace', fontWeight: currentScore > 0 ? 700 : 400, outline: 'none',
                              appearance: 'none', MozAppearance: 'textfield',
                            }}
                          />
                          {isEdited && (
                            <button onClick={() => revertEdit(user._id, w, originalScore)}
                              title="Revert" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 0, fontSize: 9, lineHeight: 1 }}>
                              <RotateCcw style={{ width: 9, height: 9 }} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Total */}
                    <div style={{ textAlign: 'center', padding: '0 4px' }}>
                      <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800, fontSize: 15 }}>
                        {user.totalPoints}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Save bar ──────────────────────────────────────────────────────── */}
      {pendingEdits.size > 0 && (
        <div style={{ position: 'sticky', bottom: 16, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14, flex: 1 }}>
            {pendingEdits.size} unsaved score edits
          </span>
          <button onClick={() => { setPendingEdits(new Map()); window.location.reload(); }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#64748b', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Discard All
          </button>
          <button onClick={saveAll} disabled={isSaving}
            style={{ background: '#ca8a04', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {isSaving ? 'Saving...' : <><Save style={{ width: 14, height: 14 }} /> Save All Changes</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Grid style (matches column count: name/dept + 8 weeks + total = 11 cols) ──
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 48px repeat(8, 52px) 60px',
  alignItems: 'center',
  gap: 4,
};
