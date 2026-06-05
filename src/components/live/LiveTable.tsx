import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CFProblem } from '@/types/codeforces';
import type { ScoreRow, UserMapInfo, ScoreboardTheme, ContestMode } from './types';
import { CFHandle } from './CFHandle';

interface LiveTableProps {
  scoreboard: ScoreRow[];
  problems: CFProblem[];
  firstSolves: Record<string, number>;
  userMap: Record<string, UserMapInfo>;
  theme: ScoreboardTheme;
  mode: ContestMode;
  currentTime: number;
  durationSeconds: number;
  officialRanks: Record<string, number>;
}

// ICPC-exact colors (from DOMjudge / ICPC World Finals live scoreboards)
const ICPC = {
  // Problem cell backgrounds
  firstSolve: '#1DAA1D', // darker green — "score_first"
  accepted: '#60E760', // bright green  — "score_correct"
  wrong: '#E87272', // pink-red      — "score_incorrect"
  pending: '#6666FF', // blue          — "score_pending"

  // Medal rank cell backgrounds
  gold: '#EEC710', // gold   ranks 1–4
  silver: '#AAAAAA', // silver ranks 5–8
  bronze: '#C08E55', // bronze ranks 9–12

  // Table structure
  rowBorder: '1px solid #dee2e6',
  colBorder: '1px solid silver',
  headerBg: '#f8f9fa',
  bodyBg: '#ffffff',
  rowBg: '#ffffff',
};

// Problem header badge colors — same sequence as ICPC (per-problem letter hue)
const PROB_COLORS = [
  '#9e9e9e', '#4caf50', '#2196f3', '#ffeb3b', '#ff5722',
  '#9c27b0', '#795548', '#e91e63', '#3f51b5', '#ff9800',
  '#00bcd4', '#8bc34a',
];

const ROW_H = 46;

function getMedalStyle(rank: number): React.CSSProperties {
  if (rank <= 4) return { background: ICPC.gold, color: '#000', fontWeight: 900 };
  if (rank <= 8) return { background: ICPC.silver, color: '#000', fontWeight: 900 };
  if (rank <= 12) return { background: ICPC.bronze, color: '#000', fontWeight: 900 };
  return { background: 'transparent', color: '#555', fontWeight: 600 };
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank <= 4) return <span style={{ fontSize: 16 }}>🥇</span>;
  if (rank <= 8) return <span style={{ fontSize: 16 }}>🥈</span>;
  if (rank <= 12) return <span style={{ fontSize: 16 }}>🥉</span>;
  return null;
}

export function LiveTable({
  scoreboard,
  problems,
  firstSolves,
  userMap,
  theme,
  mode,
  currentTime,
  durationSeconds,
  officialRanks,
}: LiveTableProps) {
  const isDark = theme === 'dark';
  const showCFRankCol = mode === 'live' || (mode === 'replay' && currentTime >= durationSeconds);

  // ─── DARK THEME ───────────────────────────────────────────────────
  if (isDark) {
    const ROW_H_DARK = 52;
    const RANK_ACCENT: Record<number, string> = { 0: '#fde047', 1: '#94a3b8', 2: '#cd7c3f' };
    const MEDAL_DARK: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

    return (
      <div className="flex-1 overflow-auto bg-[#07080a] relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="min-w-max w-full">
          {/* Dark header */}
          <div className="flex items-stretch text-white/40 text-[10.5px] font-bold uppercase tracking-wider sticky top-0 z-20"
            style={{ background: 'rgba(10,11,14,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 56, padding: '14px 0', textAlign: 'center' }}>#</div>
            <div style={{ flex: 1, minWidth: 220, padding: '14px 20px' }}>Contestant</div>
            {showCFRankCol && (
              <div style={{ width: 75, padding: '14px 0', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>CF Rank</div>
            )}
            <div style={{ width: 64, padding: '14px 0', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>Σ</div>
            <div style={{ width: 80, padding: '14px 0', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>Pen.</div>
            <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
              {problems.map(p => (
                <div key={p.index} style={{ width: 58, padding: '14px 0', textAlign: 'center', position: 'relative', cursor: 'help' }} className="group/tip hover:text-white transition-colors">
                  {p.index}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block whitespace-nowrap"
                    style={{ background: '#0e0f13', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,0.7)', zIndex: 60, textTransform: 'none', letterSpacing: '0.02em' }}>
                    {p.index}. {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <AnimatePresence>
              {scoreboard.map((row, index) => {
                const isEven = index % 2 === 0;
                const isTop3 = index < 3;
                const accent = RANK_ACCENT[index];
                const mapped = userMap[row.handle.toLowerCase()];
                return (
                  <motion.div key={row.handle} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                    className="flex items-stretch absolute w-full group"
                    style={{ top: index * ROW_H_DARK, height: ROW_H_DARK, backgroundColor: isEven ? '#0a0b0e' : '#0c0d11', borderBottom: '1px solid rgba(255,255,255,0.03)', borderLeft: isTop3 ? `3px solid ${accent}` : '3px solid transparent' }}>
                    {/* Rank */}
                    <div style={{ width: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isTop3 ? 18 : 12, fontWeight: 800, color: isTop3 ? accent : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                      {isTop3 ? MEDAL_DARK[index] : index + 1}
                    </div>
                    {/* Contestant Cell with Tooltip on Hover */}
                    <div 
                      className="transition-colors group-hover:bg-white/[0.015] relative group/tip cursor-help" 
                      style={{ 
                        flex: 1, 
                        minWidth: 220, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        padding: '0 20px', 
                        overflow: 'visible',
                        gap: 2 
                      }}
                    >
                      <a 
                        href={`https://codeforces.com/profile/${row.handle}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col justify-center gap-0.5 group/link"
                        style={{ textDecoration: 'none', color: 'inherit', outline: 'none' }}
                      >
                        {/* Name Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="group-hover/link:underline">
                            {row.displayName}
                          </span>
                          {isTop3 && (
                            <div style={{ padding: '1px 7px', borderRadius: 999, background: `${accent}18`, border: `1px solid ${accent}35`, color: accent, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0 }}>
                              #{index + 1}
                            </div>
                          )}
                        </div>

                        {/* Handle & Rating Row */}
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <CFHandle handle={`@${row.handle}`} rating={mapped?.rating} rank={mapped?.rank} />
                          {mapped?.rating && (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 10.5, marginLeft: 4 }}>
                              · {mapped.rating}
                            </span>
                          )}
                        </div>
                      </a>


                      {/* Hover Tooltip Card */}
                      <div className="absolute left-4 bottom-[90%] mb-1.5 hidden group-hover/tip:block whitespace-nowrap z-30"
                        style={{ 
                          background: '#0e0f13', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          color: '#fff', 
                          fontSize: 12, 
                          padding: '10px 14px', 
                          borderRadius: 8, 
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
                          pointerEvents: 'none',
                          textTransform: 'none',
                          letterSpacing: 'normal'
                        }}>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fff' }}>{mapped?.fullName || row.displayName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>
                          Roll ID: <span style={{ color: '#fff', fontWeight: 600 }}>{mapped?.rollId || 'N/A'}</span>
                        </div>
                        {mapped?.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 4 }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>CF Rating:</span>
                            <CFHandle handle={String(mapped.rating)} rating={mapped.rating} rank={mapped.rank} />
                            {mapped.rank && (
                              <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
                                ({mapped.rank})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CF Rank */}
                    {showCFRankCol && (
                      <div className="transition-colors group-hover:bg-white/[0.015]" style={{ width: 75, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                        {officialRanks[row.handle.toLowerCase()] ? `#${officialRanks[row.handle.toLowerCase()]}` : '—'}
                      </div>
                    )}
                    {/* Solved */}
                    <div className="transition-colors group-hover:bg-white/[0.015]" style={{ width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)', fontSize: 15, fontWeight: 900, color: row.points > 0 ? '#fff' : 'rgba(255,255,255,0.2)' }}>{row.points}</div>
                    {/* Penalty */}
                    <div className="transition-colors group-hover:bg-white/[0.015]" style={{ width: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.03)', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>{row.penalty || '—'}</div>
                    {/* Problems */}
                    <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
                      {problems.map((p, pi) => {
                        const pr = row.problemResults[p.index];
                        if (!pr) return <div key={p.index} className="transition-colors group-hover:bg-white/[0.01]" style={{ width: 58, borderLeft: '1px solid rgba(255,255,255,0.025)' }} />;
                        if (pr.isAC) {
                          const isFirst = pr.timeSeconds === firstSolves[p.index];
                          return (
                            <div key={p.index} style={{ width: 58, borderLeft: '1px solid rgba(255,255,255,0.025)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isFirst ? 'linear-gradient(160deg,#064e3b,#022c22)' : 'linear-gradient(160deg,#14532d,#0d3b20)', boxShadow: isFirst ? 'inset 0 0 0 1px rgba(253,224,71,0.2)' : 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span style={{ fontWeight: 800, fontSize: 11, color: '#fff' }}>+{pr.attempts > 0 ? pr.attempts : ''}</span>
                                {isFirst && <svg className="w-3 h-3 text-yellow-300 fill-current animate-pulse" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>}
                              </div>
                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginTop: 1 }}>{Math.floor((pr.timeSeconds || 0) / 60)}m</span>
                            </div>
                          );
                        }
                        return (
                          <div key={p.index} style={{ width: 58, borderLeft: '1px solid rgba(255,255,255,0.025)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#7f1d1d,#450a0a)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                            <span style={{ fontWeight: 800, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>-{pr.attempts}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <div style={{ height: scoreboard.length * ROW_H_DARK }} />
          {scoreboard.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16, color: 'rgba(255,255,255,0.25)' }}>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#ef4444', animation: 'spin 1s linear infinite' }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>Waiting for submissions</p>
            </div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div
      style={{ flex: 1, overflow: 'auto', background: ICPC.bodyBg, fontFamily: 'Roboto, sans-serif' }}
      className="scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent"
    >
      <div style={{ minWidth: 'max-content', width: '100%' }}>

        {/* ── Sticky Header ── */}
        <div
          style={{
            display: 'flex', alignItems: 'stretch',
            background: ICPC.headerBg,
            borderBottom: '2px solid #dee2e6',
            position: 'sticky', top: 0, zIndex: 20,
          }}
        >
          {/* Rank */}
          <div style={{ width: 70, padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderRight: ICPC.colBorder, flexShrink: 0 }}>
            Rank
          </div>
          {/* Team */}
          <div style={{ flex: 1, minWidth: 260, padding: '12px 20px', fontWeight: 700, fontSize: 12, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderRight: ICPC.colBorder }}>
            Participant
          </div>
          {/* CF Rank */}
          {showCFRankCol && (
            <div style={{ width: 85, padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderRight: ICPC.colBorder, flexShrink: 0 }}>
              CF Rank
            </div>
          )}
          {/* Score */}
          <div style={{ width: 110, padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: 12, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', borderRight: ICPC.colBorder, flexShrink: 0 }}>
            Score
          </div>
          {/* Problems */}
          {problems.map((p, i) => (
            <div
              key={p.index}
              style={{
                width: 65, padding: '6px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRight: i < problems.length - 1 ? ICPC.colBorder : 'none',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: PROB_COLORS[i % PROB_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }}>
                {p.index}
              </div>
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence>
            {scoreboard.map((row, index) => {
              const rank = index + 1;
              const mapped = userMap[row.handle.toLowerCase()];
              const medalStyle = getMedalStyle(rank);

              return (
                <motion.div
                  key={row.handle}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                  style={{
                    position: 'absolute', top: index * ROW_H, width: '100%',
                    display: 'flex', alignItems: 'stretch',
                    height: ROW_H,
                    background: ICPC.rowBg,
                    borderBottom: ICPC.rowBorder,
                  }}
                  className="group hover:bg-[#f0f4ff] transition-colors"
                >

                  {/* Rank cell */}
                  <div
                    style={{
                      width: 70, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 4,
                      borderRight: ICPC.colBorder,
                      ...medalStyle,
                    }}
                  >
                    <MedalIcon rank={rank} />
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{rank}</span>
                  </div>

                  {/* Participant cell with tooltip */}
                  <div
                    className="relative group/tip cursor-help"
                    style={{
                      flex: 1, minWidth: 260,
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '0 16px',
                      borderRight: ICPC.colBorder,
                      overflow: 'visible', gap: 2,
                    }}
                  >
                    <a
                      href={`https://codeforces.com/profile/${row.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col justify-center gap-0.5 group/link"
                      style={{ textDecoration: 'none', color: 'inherit', outline: 'none' }}
                    >
                      {/* Name Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="group-hover/link:underline">
                          {row.displayName}
                        </span>
                      </div>

                      {/* Handle & Rating Row */}
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <CFHandle handle={`@${row.handle}`} rating={mapped?.rating} rank={mapped?.rank} />
                        {mapped?.rating && (
                          <span style={{ color: '#666', fontFamily: 'monospace', fontSize: 10.5, marginLeft: 4 }}>
                            · {mapped.rating}
                          </span>
                        )}
                      </div>
                    </a>

                    {/* Hover Tooltip Card */}
                    <div className="absolute left-4 bottom-[90%] mb-1.5 hidden group-hover/tip:block whitespace-nowrap z-30"
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #dee2e6', 
                        color: '#212529', 
                        fontSize: 12, 
                        padding: '10px 14px', 
                        borderRadius: 8, 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                        pointerEvents: 'none',
                        textTransform: 'none',
                        letterSpacing: 'normal'
                      }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1a1a1a' }}>{mapped?.fullName || row.displayName}</div>
                      <div style={{ color: '#666', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>
                        Roll ID: <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{mapped?.rollId || 'N/A'}</span>
                      </div>
                      {mapped?.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 4 }}>
                          <span style={{ color: '#666' }}>CF Rating:</span>
                          <CFHandle handle={String(mapped.rating)} rating={mapped.rating} rank={mapped.rank} />
                          {mapped.rank && (
                            <span style={{ color: '#666', textTransform: 'capitalize' }}>
                              ({mapped.rank})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CF Rank cell */}
                  {showCFRankCol && (
                    <div
                      style={{
                        width: 85, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRight: ICPC.colBorder,
                        fontSize: 13, fontWeight: 700, color: '#444',
                        background: '#f8f9fa',
                      }}
                    >
                      {officialRanks[row.handle.toLowerCase()] ? `#${officialRanks[row.handle.toLowerCase()]}` : '—'}
                    </div>
                  )}

                  {/* Score: solved + penalty */}
                  <div
                    style={{
                      width: 110, flexShrink: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      borderRight: ICPC.colBorder,
                      gap: 1,
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#111', lineHeight: 1 }}>{row.points}</span>
                    <span style={{ fontSize: 11, color: '#888', fontFamily: 'ui-monospace, monospace' }}>{row.penalty} pen</span>
                  </div>

                  {/* Problem cells */}
                  {problems.map((p, pi) => {
                    const pr = row.problemResults[p.index];

                    if (!pr) {
                      return (
                        <div
                          key={p.index}
                          style={{
                            width: 65, flexShrink: 0,
                            borderRight: pi < problems.length - 1 ? ICPC.colBorder : 'none',
                          }}
                        />
                      );
                    }

                    if (pr.isAC) {
                      const isFirst = pr.timeSeconds === firstSolves[p.index];
                      const bg = isFirst ? ICPC.firstSolve : ICPC.accepted;
                      const mins = Math.floor((pr.timeSeconds || 0) / 60);
                      return (
                        <div
                          key={p.index}
                          style={{
                            width: 65, flexShrink: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: bg,
                            borderRight: pi < problems.length - 1 ? ICPC.colBorder : 'none',
                            gap: 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: isFirst ? '#fff' : '#000', lineHeight: 1 }}>{mins}</span>
                            {isFirst && (
                              <svg style={{ width: 9, height: 9, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            )}
                          </div>
                          <span style={{ fontSize: 10, color: isFirst ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)', lineHeight: 1 }}>
                            {pr.attempts > 1 ? `${pr.attempts} tries` : '1 try'}
                          </span>
                        </div>
                      );
                    }

                    // Wrong answer
                    const mins = pr.timeSeconds ? Math.floor(pr.timeSeconds / 60) : null;
                    return (
                      <div
                        key={p.index}
                        style={{
                          width: 65, flexShrink: 0,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          background: ICPC.wrong,
                          borderRight: pi < problems.length - 1 ? ICPC.colBorder : 'none',
                          gap: 1,
                        }}
                      >
                        {mins !== null && (
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#000', lineHeight: 1 }}>{mins}</span>
                        )}
                        <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.65)', lineHeight: 1 }}>
                          {pr.attempts > 0 ? `${pr.attempts} ${pr.attempts === 1 ? 'try' : 'tries'}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div style={{ height: scoreboard.length * ROW_H }} />

        {/* Empty state */}
        {scoreboard.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px', gap: 16,
            color: '#999', background: '#fff',
          }}>
            <div style={{ position: 'relative', width: 40, height: 40 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #eee' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#1DAA1D', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#666', marginBottom: 4 }}>Waiting for submissions</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>Scoreboard will update automatically</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
