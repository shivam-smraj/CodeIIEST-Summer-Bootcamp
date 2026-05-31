'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import useSWR from 'swr';
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

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function SessionsClient() {
  const { data, isLoading } = useSWR<{
    sessions: SessionData[];
  }>('/api/sessions', fetcher);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sessions = data?.sessions ?? [];

  // Automatically expand the active unlocked week by default
  useEffect(() => {
    if (sessions.length > 0 && !expandedId) {
      const activeUnlocked = sessions.find((s: SessionData) => s.isUnlocked);
      if (activeUnlocked) {
        setExpandedId(activeUnlocked._id);
      }
    }
  }, [sessions, expandedId]);

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
        className="session-card-header"
        style={{
          background: 'none',
          border: 'none',
          cursor: isLocked ? 'default' : 'pointer',
          color: 'inherit',
        }}
      >
        {/* Week badge */}
        <div className="session-card-badge" style={{
          background: isLocked ? 'rgba(255,255,255,0.04)' : accent.bg,
          border: `1px solid ${isLocked ? 'rgba(255,255,255,0.06)' : accent.border}`,
        }}>
          <span className="session-card-wk-text" style={{ color: isLocked ? '#374151' : accent.text, opacity: 0.7 }}>
            Wk
          </span>
          <span className="session-card-num-text" style={{ color: isLocked ? '#374151' : accent.text }}>
            {session.weekNumber}
          </span>
        </div>

        {/* Content */}
        <div className="session-card-content">
          <h3 className="session-card-title" style={{
            color: isLocked ? '#374151' : '#fff',
          }}>
            {session.topic}
          </h3>

          {isLocked ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 12 }}>
                <Lock style={{ width: 11, height: 11 }} /> Locked
              </span>
              {weekDates && (
                <span className="session-card-dates" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4b5563', fontSize: 11 }}>
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
        <div className="session-card-right">
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginBottom: 18, fontSize: 13 }}>
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
          </div>

          {/* 1. Primary Action Row: The two study PDF Viewers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
            <Link
              href={`/sessions/viewer?file=${encodeURIComponent(`/pdf/Week 0${session.weekNumber} · Prerequisites.pdf`)}&title=${encodeURIComponent(`Week 0${session.weekNumber} · Prerequisites`)}`}
              className="session-link shadow-lg shadow-red-950/5 hover:scale-[1.01] transition-transform"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.22)',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <BookOpen style={{ width: 15, height: 15 }} />
              <span className="font-bold">View Prerequisites PDF</span>
              <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
            </Link>

            <Link
              href={`/sessions/viewer?file=${encodeURIComponent(`/pdf/Week 0${session.weekNumber} · Slides.pdf`)}&title=${encodeURIComponent(`Week 0${session.weekNumber} · Session Slides`)}`}
              className="session-link shadow-lg shadow-blue-950/5 hover:scale-[1.01] transition-transform"
              style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.22)',
                color: '#93c5fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Video style={{ width: 15, height: 15 }} />
              <span className="font-bold">View Session Slides PDF</span>
              <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
            </Link>
          </div>

          {/* 2. Secondary Actions Row: Google Meet, Contest, Editorial */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10, marginBottom: 20 }}>
            {session.meetLink && (
              <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.20)', color:'#6ee7b7' }}>
                <Play style={{ width: 14, height: 14 }} />
                <span>Join Google Meet</span>
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
              <a href={session.postContestData.editorialLink} target="_blank" rel="noopener noreferrer" className="session-link" style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.20)', color:'#c084fc' }}>
                <BookOpen style={{ width: 14, height: 14 }} />
                <span>Editorial</span>
                <ExternalLink style={{ width: 12, height: 12, marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            )}
          </div>

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
        .session-card-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          text-align: left;
        }
        .session-card-badge {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          line-height: 1;
        }
        .session-card-wk-text {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.7;
        }
        .session-card-num-text {
          font-size: 20px;
          font-weight: 900;
        }
        .session-card-content {
          flex: 1;
          min-width: 0;
        }
        .session-card-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .session-card-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .session-card-header {
            flex-wrap: wrap !important;
            padding: 14px 14px !important;
            gap: 10px !important;
          }
          .session-card-badge {
            width: 44px !important;
            height: 44px !important;
            border-radius: 10px !important;
          }
          .session-card-wk-text {
            font-size: 8px !important;
          }
          .session-card-num-text {
            font-size: 16px !important;
          }
          .session-card-content {
            flex: 1;
            min-width: 140px !important;
          }
          .session-card-title {
            white-space: normal !important;
            font-size: 14px !important;
            line-height: 1.35 !important;
          }
          .session-card-dates {
            font-size: 10px !important;
          }
          .session-card-right {
            width: 100% !important;
            justify-content: flex-end !important;
            margin-top: 4px !important;
            border-top: 1px solid rgba(255,255,255,0.04);
            padding-top: 6px;
            gap: 6px !important;
          }
        }

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
