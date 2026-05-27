'use client';

import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LEADERBOARD_FILTERS, CF_RANK_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import type { LeaderboardUser, LeaderboardFilter } from '@/types';

// Map CF rank → color value (not class)
const RANK_COLORS: Record<string, string> = {
  newbie: '#9e9e9e', pupil: '#4caf50', specialist: '#03a9f4',
  expert: '#1e88e5', 'candidate master': '#aa00ff',
  master: '#ff6d00', 'international master': '#ff3d00',
  grandmaster: '#f44336', 'legendary grandmaster': '#f44336',
};

function getRankColor(rank?: string) {
  return RANK_COLORS[(rank ?? '').toLowerCase()] ?? '#94a3b8';
}

export function LeaderboardClient() {
  const [filter, setFilter] = useState<LeaderboardFilter>('combined-all');
  const [users, setUsers]   = useState<LeaderboardUser[]>([]);
  const [top3, setTop3]     = useState<LeaderboardUser[]>([]);
  const [total, setTotal]   = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?filter=${filter}&page=${page}&limit=50`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTop3(data.top3 ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, [filter, page]);

  useEffect(() => { setPage(1); }, [filter]);
  useEffect(() => { void fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Filter tabs ────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto', paddingBottom: 4, margin: '0 -4px' }}>
        <div style={{ display: 'flex', gap: 8, padding: '4px', minWidth: 'max-content' }}>
          {LEADERBOARD_FILTERS.map(({ value, label, icon }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                onClick={() => setFilter(value as LeaderboardFilter)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: active ? '1px solid rgba(220,38,38,0.40)' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fca5a5' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 0 12px rgba(220,38,38,0.10)' : 'none',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Participant count */}
      <p style={{ color: '#64748b', fontSize: 13 }}>
        {isLoading ? '...' : <><strong style={{ color: '#fff' }}>{total}</strong> participants</>}
      </p>

      {/* ── Podium ─────────────────────────────────────────────────── */}
      {!isLoading && top3.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '32px 24px 24px',
        }}>
          <Podium top3={top3} />
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Desktop header */}
        <div className="lb-desktop-header" style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 80px repeat(8,36px)',
          gap: 0,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 20px',
        }}>
          {['#','Participant','Total','W1','W2','W3','W4','W5','W6','W7','W8'].map(h => (
            <div key={h} style={{ fontSize: 11, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h.startsWith('W') || h === 'Total' ? 'center' : 'left' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({length:7}).map((_,i) => (
              <div key={i} className="shimmer" style={{ height: 56, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <p style={{ color: '#4b5563', fontWeight: 500 }}>No participants yet</p>
            <p style={{ color: '#374151', fontSize: 13, marginTop: 6 }}>Check back after the first contest!</p>
          </div>
        ) : (
          <div>
            {users.map(user => <LeaderboardRow key={user._id} user={user} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
            style={{ padding:'9px 20px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, color:'#94a3b8', cursor:'pointer', fontSize:13, fontWeight:500, opacity: page===1 ? 0.3 : 1 }}>
            ← Prev
          </button>
          <span style={{ color:'#64748b', fontSize:13 }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
            style={{ padding:'9px 20px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, color:'#94a3b8', cursor:'pointer', fontSize:13, fontWeight:500, opacity: page===totalPages ? 0.3 : 1 }}>
            Next →
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1023px) {
          .lb-desktop-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Podium ────────────────────────────────────────────────────────────────────
function Podium({ top3 }: { top3: LeaderboardUser[] }) {
  const [first, second, third] = top3;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
      {second && <PodiumCard user={second} place={2} />}
      {first  && <PodiumCard user={first}  place={1} />}
      {third  && <PodiumCard user={third}  place={3} />}
    </div>
  );
}

function PodiumCard({ user, place }: { user: LeaderboardUser; place: 1|2|3 }) {
  const configs = {
    1: { emoji:'🥇', avatarSize:76, blockH:96, borderColor:'rgba(234,179,8,0.5)', blockBg:'rgba(234,179,8,0.08)', textColor:'#fbbf24', glow:'0 0 24px rgba(234,179,8,0.2)' },
    2: { emoji:'🥈', avatarSize:60, blockH:68, borderColor:'rgba(148,163,184,0.3)', blockBg:'rgba(148,163,184,0.05)', textColor:'#94a3b8', glow:'none' },
    3: { emoji:'🥉', avatarSize:52, blockH:52, borderColor:'rgba(180,83,9,0.3)', blockBg:'rgba(180,83,9,0.05)', textColor:'#c2774f', glow:'none' },
  }[place];

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <div style={{ position:'relative' }}>
        <div style={{
          width: configs.avatarSize, height: configs.avatarSize,
          borderRadius: '50%',
          border: `2px solid ${configs.borderColor}`,
          boxShadow: configs.glow,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)',
        }}>
          <Avatar style={{ width:'100%', height:'100%' }}>
            <AvatarImage src={user.cfAvatar ?? ''} />
            <AvatarFallback style={{ background:'#1e293b', color:'#fff', fontWeight:700, fontSize: place===1?20:16 }}>
              {user.displayName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <span style={{ position:'absolute', top:-6, right:-6, fontSize: place===1?22:18 }}>{configs.emoji}</span>
      </div>

      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#fff', fontWeight:700, fontSize: place===1?15:13 }}>{user.displayName?.split(' ')[0]}</p>
        <p style={{ color: getRankColor(user.cfRank), fontSize:11, fontFamily:'monospace' }}>@{user.cfHandle}</p>
        <p style={{ color: configs.textColor, fontWeight:900, fontSize: place===1?20:15, marginTop:4 }}>
          {user.totalPoints} <span style={{ fontSize:10, fontWeight:400, color:'#64748b' }}>pts</span>
        </p>
      </div>

      {/* Podium block */}
      <div style={{
        width: place===1?100:80,
        height: configs.blockH,
        background: configs.blockBg,
        borderRadius:'8px 8px 0 0',
        border: `1px solid ${configs.borderColor}`,
        borderBottom: 'none',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ fontSize: place===1?32:24, fontWeight:900, opacity:0.15, color: configs.textColor }}>
          #{place}
        </span>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function LeaderboardRow({ user }: { user: LeaderboardUser }) {
  const rankColor = getRankColor(user.cfRank);
  const isTop3 = user.rank <= 3;
  const medalEmoji = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉';

  return (
    <>
      {/* Desktop */}
      <div
        className="lb-desktop-row"
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 80px repeat(8,36px)',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: isTop3 ? 'rgba(234,179,8,0.02)' : 'transparent',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = isTop3 ? 'rgba(234,179,8,0.05)' : 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isTop3 ? 'rgba(234,179,8,0.02)' : 'transparent'; }}
      >
        <div style={{ fontSize:13, fontWeight:700 }}>
          {isTop3 ? <span>{medalEmoji}</span> : <span style={{color:'#374151'}}>{user.rank}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.10)', overflow:'hidden', flexShrink:0 }}>
            <Avatar style={{ width:'100%', height:'100%' }}>
              <AvatarImage src={user.cfAvatar ?? ''} />
              <AvatarFallback style={{ background:'#1e293b', color:'#fff', fontSize:11, fontWeight:700 }}>{user.displayName?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ color:'#fff', fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.displayName}</p>
            <p style={{ color:rankColor, fontSize:11, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>@{user.cfHandle}{user.cfRating ? ` · ${user.cfRating}` : ''}</p>
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontWeight:900, fontSize:15, color: isTop3 ? '#fbbf24' : '#fff' }}>{user.totalPoints}</span>
        </div>
        {Array.from({length:8}).map((_,i) => {
          const score = user.scores?.[i];
          return (
            <div key={i} style={{ textAlign:'center', fontSize:11, fontFamily:'monospace' }}>
              {score == null ? <span style={{color:'#1f2937'}}>—</span>
               : score === 0 ? <span style={{color:'rgba(239,68,68,0.5)'}}>✕</span>
               : <span style={{color:'#34d399'}}>{score}</span>}
            </div>
          );
        })}
      </div>

      {/* Mobile card */}
      <div
        className="lb-mobile-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: isTop3 ? 'rgba(234,179,8,0.02)' : 'transparent',
        }}
      >
        <div style={{ width:28, textAlign:'center', fontWeight:700, fontSize:12 }}>
          {isTop3 ? medalEmoji : <span style={{color:'#374151'}}>{user.rank}</span>}
        </div>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.10)', overflow:'hidden', flexShrink:0 }}>
          <Avatar style={{ width:'100%', height:'100%' }}>
            <AvatarImage src={user.cfAvatar ?? ''} />
            <AvatarFallback style={{ background:'#1e293b', color:'#fff', fontSize:12, fontWeight:700 }}>{user.displayName?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ color:'#fff', fontWeight:600, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.displayName}</p>
          <p style={{ color:rankColor, fontSize:11, fontFamily:'monospace' }}>@{user.cfHandle}</p>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:900, fontSize:16, color: isTop3 ? '#fbbf24' : '#fff' }}>{user.totalPoints}</div>
          <div style={{ color:'#374151', fontSize:10 }}>pts</div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lb-mobile-row { display: none !important; } }
        @media (max-width: 1023px) { .lb-desktop-row { display: none !important; } }
      `}</style>
    </>
  );
}
