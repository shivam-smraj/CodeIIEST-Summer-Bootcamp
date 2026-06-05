import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CFSubmission } from '@/types/codeforces';
import type { UserMapInfo, ScoreRow, ScoreboardTheme } from './types';
import { CFHandle } from './CFHandle';

interface LiveQueueProps {
  recentEvents: CFSubmission[];
  userMap: Record<string, UserMapInfo>;
  scoreboard: ScoreRow[];
  theme: ScoreboardTheme;
}

// ICPC-exact verdict colors (from DOMjudge)
const VERDICT: Record<string, { bg: string; label: string; short: string; textColor: string }> = {
  OK:                   { bg: '#60E760', label: 'Accepted',     short: 'AC',  textColor: '#000' },
  WRONG_ANSWER:         { bg: '#E87272', label: 'Wrong Answer', short: 'WA',  textColor: '#000' },
  TIME_LIMIT_EXCEEDED:  { bg: '#ff9800', label: 'Time Limit',   short: 'TLE', textColor: '#000' },
  RUNTIME_ERROR:        { bg: '#9c27b0', label: 'Runtime Err',  short: 'RE',  textColor: '#fff' },
  MEMORY_LIMIT_EXCEEDED:{ bg: '#7b1fa2', label: 'Memory Limit', short: 'MLE', textColor: '#fff' },
  COMPILATION_ERROR:    { bg: '#607d8b', label: 'Compile Err',  short: 'CE',  textColor: '#fff' },
  PENDING:              { bg: '#6666FF', label: 'Pending',      short: '...',  textColor: '#fff' },
};

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function LiveQueue({ recentEvents, userMap, scoreboard, theme }: LiveQueueProps) {
  const isDark = theme === 'dark';

  const getTeamStats = (handle: string) => {
    const idx = scoreboard.findIndex(r => r.handle === handle);
    if (idx === -1) return { rank: null, points: 0 };
    return { rank: idx + 1, points: scoreboard[idx].points };
  };

  const acCount  = recentEvents.filter(e => e.verdict === 'OK').length;
  const waCount  = recentEvents.filter(e => e.verdict === 'WRONG_ANSWER').length;

  return (
    <div
      style={{
        width: 288,
        background: isDark ? 'rgba(9,10,14,0.92)' : '#f8f9fa',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #dee2e6',
        backdropFilter: isDark ? 'blur(20px)' : 'none',
        boxShadow: isDark ? '-12px 0 40px rgba(0,0,0,0.5)' : '0 0 0 rgba(0,0,0,0)',
        display: 'flex', flexDirection: 'column',
        zIndex: 20, flexShrink: 0,
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
        borderBottom: '2px solid #0d47a1',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ff6b6b', opacity: 0.75, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }} />
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: '#ff6b6b' }} />
            </span>
            <h3 style={{ color: '#fff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Live Feed
            </h3>
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 999, fontFamily: 'ui-monospace, monospace',
          }}>
            {recentEvents.length}
          </span>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, background: '#60E760', borderRadius: 6, padding: '4px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#000' }}>AC</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#000' }}>{acCount}</span>
          </div>
          <div style={{
            flex: 1, background: '#E87272', borderRadius: 6, padding: '4px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#000' }}>WA</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#000' }}>{waCount}</span>
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 8px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{recentEvents.length}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent"
        style={{ display: 'flex', flexDirection: 'column', background: isDark ? '#09090c' : '#fff' }}
      >
        <AnimatePresence initial={false}>
          {recentEvents.map(event => {
            const handle  = event.author.members[0].handle;
            const mapped  = userMap[handle.toLowerCase()];
            const name    = mapped ? mapped.firstName : handle;
            const vd      = VERDICT[event.verdict ?? ''] || { bg: '#9e9e9e', label: 'Unknown', short: '??', textColor: '#fff' };
            const stats   = getTeamStats(handle);
            const isAC    = event.verdict === 'OK';
            const timeStr = fmtTime(event.relativeTimeSeconds);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  padding: '9px 12px 9px 0',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', gap: 0,
                  borderLeft: `4px solid ${vd.bg}`,
                  background: isDark 
                    ? (isAC ? 'rgba(96,231,96,0.04)' : 'transparent')
                    : (isAC ? 'rgba(96,231,96,0.06)' : '#fff'),
                }}
                className={isDark ? 'hover:bg-white/[0.02] transition-colors' : 'hover:bg-blue-50 transition-colors'}
              >
                {/* Verdict badge */}
                <div style={{
                  width: 42, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  <div style={{
                    padding: '3px 5px',
                    borderRadius: 5,
                    background: vd.bg,
                    color: vd.textColor,
                    fontSize: 9, fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    minWidth: 28,
                  }}>
                    {vd.short}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  {/* Name + problem */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5, fontWeight: 600 }}>
                      <CFHandle handle={name} rating={mapped?.rating} rank={mapped?.rank} />
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#1a237e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 800,
                    }}>
                      {event.problem.index}
                    </div>
                  </div>

                  {/* Rank + solved + time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {stats.rank !== null && (
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#666', fontSize: 10.5, fontWeight: 600 }}>
                        #{stats.rank}
                      </span>
                    )}
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#ccc', fontSize: 10 }}>·</span>
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#666', fontSize: 10.5 }}>
                      {stats.points} solved
                    </span>
                    <span style={{ marginLeft: 'auto', color: isDark ? 'rgba(255,255,255,0.3)' : '#888', fontSize: 10.5, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                      {timeStr}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {recentEvents.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '40px 20px', gap: 12, color: '#bbb',
          }}>
            <div style={{ position: 'relative', width: 36, height: 36 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #eee' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#60E760', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#999', marginBottom: 3 }}>Waiting for submissions</p>
              <p style={{ fontSize: 11, color: '#bbb' }}>Events appear here in real-time</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
