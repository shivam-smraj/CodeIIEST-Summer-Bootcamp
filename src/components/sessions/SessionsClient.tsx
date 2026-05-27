'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Lock, Video, ExternalLink, BookOpen, Trophy,
  Calendar, Clock, ChevronDown, ChevronUp, Play,
} from 'lucide-react';
import type { SessionData } from '@/types';
import { WEEK_DATES } from '@/lib/constants';

const DATES = [...WEEK_DATES];

// Static week accent colors — inline styles instead of dynamic classes
const WEEK_ACCENTS: { bg: string; border: string; text: string; label: string }[] = [
  { bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.25)',  text: '#60a5fa', label: '#60a5fa' },   // blue
  { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa', label: '#a78bfa' },  // violet
  { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#34d399', label: '#34d399' },  // emerald
  { bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.25)',  text: '#fb923c', label: '#fb923c' },  // orange
  { bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.25)', text: '#f472b6', label: '#f472b6' }, // pink
  { bg: 'rgba(34,211,238,0.10)',  border: 'rgba(34,211,238,0.25)',  text: '#22d3ee', label: '#22d3ee' },  // cyan
  { bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.25)',  text: '#facc15', label: '#facc15' },  // yellow
  { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', text: '#f87171', label: '#f87171' }, // red
];

export function SessionsClient() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shimmer" style={{ height: 72, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sessions.map(session => (
        <SessionCard
          key={session._id}
          session={session}
          isExpanded={expandedId === session._id}
          onToggle={() => setExpandedId(expandedId === session._id ? null : session._id)}
        />
      ))}
    </div>
  );
}

function SessionCard({
  session, isExpanded, onToggle,
}: { session: SessionData; isExpanded: boolean; onToggle: () => void; }) {
  const isLocked = !session.isUnlocked;
  const accent = WEEK_ACCENTS[(session.weekNumber - 1) % WEEK_ACCENTS.length];
  const weekDates = DATES[session.weekNumber - 1];

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : isExpanded ? accent.border : 'rgba(255,255,255,0.08)'}`,
      background: isLocked ? 'rgba(255,255,255,0.02)' : isExpanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.03)',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease, background 0.2s ease',
    }}>
      {/* ── Header row ──────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        disabled={isLocked}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 18px',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: isLocked ? 'default' : 'pointer',
          color: 'inherit',
        }}
      >
        {/* Week badge */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: isLocked ? 'rgba(255,255,255,0.04)' : accent.bg,
          border: `1px solid ${isLocked ? 'rgba(255,255,255,0.06)' : accent.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 1,
        }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isLocked ? '#374151' : accent.text, opacity: 0.7 }}>
            Wk
          </span>
          <span style={{ fontSize: 20, fontWeight: 900, color: isLocked ? '#374151' : accent.text }}>
            {session.weekNumber}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            color: isLocked ? '#374151' : '#fff',
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {session.topic}
          </h3>

          {isLocked ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 12 }}>
                <Lock style={{ width: 11, height: 11 }} /> Locked
              </span>
              {weekDates && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1f2937', fontSize: 11 }}>
                  <Calendar style={{ width: 10, height: 10 }} />
                  {weekDates.session} &nbsp;·&nbsp; Contest: {weekDates.contest}
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {session.subTopics.slice(0, 3).map((t, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: '#94a3b8',
                }}>
                  {t}
                </span>
              ))}
              {session.subTopics.length > 3 && (
                <span style={{ fontSize: 11, color: '#4b5563' }}>+{session.subTopics.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: badges + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!isLocked && session.isRecordingAvailable && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#f87171',
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.20)',
              borderRadius: 20, padding: '3px 8px',
            }}>
              <Video style={{ width: 10, height: 10 }} /> Rec
            </span>
          )}
          {!isLocked && session.isContestPosted && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#34d399',
              background: 'rgba(52,211,153,0.10)',
              border: '1px solid rgba(52,211,153,0.20)',
              borderRadius: 20, padding: '3px 8px',
            }}>
              <Trophy style={{ width: 10, height: 10 }} /> Done
            </span>
          )}
          {!isLocked && (
            isExpanded
              ? <ChevronUp style={{ width: 18, height: 18, color: '#64748b' }} />
              : <ChevronDown style={{ width: 18, height: 18, color: '#64748b' }} />
          )}
        </div>
      </button>

      {/* ── Expanded body ────────────────────────────────────────────── */}
      {isExpanded && !isLocked && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 18px',
        }}>
          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginBottom: 16, fontSize: 13 }}>
            {weekDates && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                <Calendar style={{ width: 13, height: 13 }} />
                <span>Session: <strong style={{ color: '#e2e8f0' }}>{weekDates.session}</strong></span>
                <span style={{ color: '#374151' }}>·</span>
                <span>Contest: <strong style={{ color: accent.text }}>{weekDates.contest}</strong></span>
              </span>
            )}
            {session.mentorName && (
              <span style={{ color: '#94a3b8' }}>👤 <strong style={{ color: '#fff' }}>{session.mentorName}</strong></span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
              <Clock style={{ width: 13, height: 13 }} /> {session.durationMinutes} min
            </span>
            {session.targetRating && (
              <span style={{ color: '#64748b' }}>🎯 Target: <strong style={{ color: accent.text }}>{session.targetRating}</strong></span>
            )}
          </div>

          {/* Action links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10, marginBottom: 20 }}>
            {session.meetLink && (
              <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.20)', color:'#6ee7b7' }}>
                <Play style={{ width: 14, height: 14 }} />
                <span>Join Google Meet</span>
                <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            )}
            {session.recordingLink && (
              <a href={session.recordingLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.20)', color:'#fca5a5' }}>
                <Video style={{ width: 14, height: 14 }} />
                <span>Watch Recording</span>
                <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            )}
            {session.postContestData?.cfContestLink && (
              <a href={session.postContestData.cfContestLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(251,146,60,0.08)', border:'1px solid rgba(251,146,60,0.20)', color:'#fdba74' }}>
                <Trophy style={{ width: 14, height: 14 }} />
                <span>CF Contest</span>
                <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            )}
            {session.postContestData?.editorialLink && (
              <a href={session.postContestData.editorialLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.20)', color:'#93c5fd' }}>
                <BookOpen style={{ width: 14, height: 14 }} />
                <span>Editorial</span>
                <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            )}
          </div>

          {/* Prerequisites */}
          {session.prerequisites.length > 0 && (
            <div>
              <h4 style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Prerequisites
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {session.prerequisites.map((p, i) => (
                  <a key={i} href={p.link} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontSize: 13,
                    }}
                    className="prereq-link"
                  >
                    <span style={{ background:'rgba(255,255,255,0.07)', color:'#94a3b8', borderRadius:6, padding:'2px 8px', fontSize:10, fontFamily:'monospace', flexShrink:0 }}>{p.type}</span>
                    <span style={{ color: '#cbd5e1', flex: 1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</span>
                    {p.isRequired && <span style={{ color:'#f87171', fontSize:10, flexShrink:0 }}>Required</span>}
                    <ExternalLink style={{ width:12, height:12, color:'#374151', flexShrink:0 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {session.sessionNotes && (
            <div style={{ marginTop: 16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 16px' }}>
              <h4 style={{ color:'#fff', fontSize:13, fontWeight:600, marginBottom:8 }}>📝 Session Notes</h4>
              <p style={{ color:'#94a3b8', fontSize:13, lineHeight:1.7, whiteSpace:'pre-line' }}>{session.sessionNotes}</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .session-link {
          display: flex; align-items: center; gap: 8;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .session-link:hover { opacity: 0.8; }
        .prereq-link:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.05) !important; }
      `}</style>
    </div>
  );
}
