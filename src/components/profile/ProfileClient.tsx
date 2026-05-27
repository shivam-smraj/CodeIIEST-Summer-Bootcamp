'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CF_RANK_COLORS, WEEK_TOPICS, WEEK_DATES } from '@/lib/constants';
import { ExternalLink, Trophy, CheckCircle2, XCircle, Lock, Star, Flame, TrendingUp, Calendar, GitBranch, Award } from 'lucide-react';
import type { UserProfile } from '@/types';

const WEEK_TOPICS_ARR = [...WEEK_TOPICS];
const WEEK_DATES_ARR  = [...WEEK_DATES];

const CF_RANK_HEX: Record<string, { text: string; bg: string; border: string }> = {
  newbie:             { text: '#9e9e9e', bg: 'rgba(158,158,158,0.10)', border: 'rgba(158,158,158,0.25)' },
  pupil:              { text: '#4caf50', bg: 'rgba(76,175,80,0.10)',   border: 'rgba(76,175,80,0.25)' },
  specialist:         { text: '#03a9f4', bg: 'rgba(3,169,244,0.10)',   border: 'rgba(3,169,244,0.25)' },
  expert:             { text: '#1e88e5', bg: 'rgba(30,136,229,0.10)',  border: 'rgba(30,136,229,0.25)' },
  'candidate master': { text: '#aa00ff', bg: 'rgba(170,0,255,0.10)',   border: 'rgba(170,0,255,0.25)' },
  master:             { text: '#ff6d00', bg: 'rgba(255,109,0,0.10)',   border: 'rgba(255,109,0,0.25)' },
  'international master': { text: '#ff6d00', bg: 'rgba(255,109,0,0.10)', border: 'rgba(255,109,0,0.25)' },
  grandmaster:        { text: '#f44336', bg: 'rgba(244,67,54,0.10)',   border: 'rgba(244,67,54,0.25)' },
  'international grandmaster': { text: '#f44336', bg: 'rgba(244,67,54,0.10)', border: 'rgba(244,67,54,0.25)' },
  'legendary grandmaster':     { text: '#f44336', bg: 'rgba(244,67,54,0.10)', border: 'rgba(244,67,54,0.25)' },
};

export function ProfileClient() {
  const { data: session } = useSession();
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(d => setProfile(d))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[240, 140, 200, 120].map((h, i) => (
          <div key={i} style={{
            height: h, borderRadius: 18,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            animation: 'pulse 2s infinite',
          }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '56px 32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <p style={{ color: '#374151', fontSize: 15 }}>Failed to load profile. Please refresh.</p>
      </div>
    );
  }

  // ── Computed values ───────────────────────────────────────────────────────
  const rankKey     = profile.cfRank?.toLowerCase() ?? 'newbie';
  const rc          = CF_RANK_HEX[rankKey] ?? CF_RANK_HEX.newbie;
  const initials    = (profile.displayName ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const participated = profile.scores.filter(s => s > 0).length;
  const maxScore    = Math.max(...(profile.scores ?? [1]), 1);
  const streakCount = (() => {
    let streak = 0;
    for (let i = (profile.scores ?? []).length - 1; i >= 0; i--) {
      if ((profile.scores[i] ?? 0) > 0) streak++; else break;
    }
    return streak;
  })();
  const bestScore   = Math.max(...(profile.scores ?? [0]));
  const avgScore    = participated > 0
    ? Math.round(profile.scores.filter(s => s > 0).reduce((a, b) => a + b, 0) / participated)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Identity Hero Card ───────────────────────────────────────────── */}
      <div style={{
        borderRadius: 20, border: `1px solid ${rc.border}`,
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${rc.text}80, transparent)`,
        }} />
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          background: `${rc.text}08`, borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt={profile.displayName ?? 'Avatar'}
                  style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${rc.border}`, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', border: `3px solid ${rc.border}`,
                  background: `linear-gradient(135deg, ${rc.bg}, rgba(99,102,241,0.15))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 900, color: rc.text,
                }}>{initials}</div>
              )}
              {profile.role !== 'user' && (
                <div style={{
                  position: 'absolute', bottom: -4, right: -4,
                  background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)',
                  borderRadius: 20, padding: '1px 7px', fontSize: 9, fontWeight: 800, color: '#c4b5fd',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {profile.role === 'superadmin' ? 'superadmin' : 'admin'}
                </div>
              )}
            </div>

            {/* Identity info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 26, margin: 0 }}>
                  {profile.displayName}
                </h2>
              </div>

              <p style={{ color: '#374151', fontSize: 12, fontFamily: 'monospace', marginBottom: 12 }}>
                {profile.email}
              </p>

              {/* Tags row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.rollId && (
                  <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                    {profile.rollId}
                  </span>
                )}
                {profile.batch && (
                  <span style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.20)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#818cf8' }}>
                    {profile.batch === 2029 ? '2nd Year' : '3rd Year'} · Batch {profile.batch}
                  </span>
                )}
                {profile.department && (
                  <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#64748b' }}>
                    {profile.department}
                  </span>
                )}
                {profile.gender && (
                  <span style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.18)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#f472b6' }}>
                    {profile.gender}
                  </span>
                )}
              </div>
            </div>

            {/* Season badge */}
            <div style={{
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.20)',
              borderRadius: 14, padding: '12px 16px', textAlign: 'center', flexShrink: 0,
            }}>
              <p style={{ color: '#dc2626', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>SEASON 01</p>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>Jun – Jul</p>
              <p style={{ color: '#374151', fontSize: 10, marginTop: 2 }}>2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CF Handle + Stats row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* CF Handle Card */}
        <div style={{
          borderRadius: 16, border: profile.isCfVerified ? `1px solid ${rc.border}` : '1px solid rgba(255,255,255,0.07)',
          background: profile.isCfVerified ? rc.bg : 'rgba(255,255,255,0.02)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} />
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Codeforces</span>
          </div>

          {profile.isCfVerified && profile.cfHandle ? (
            <div>
              {profile.cfAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.cfAvatar} alt="CF avatar" style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${rc.border}`, marginBottom: 10 }} />
              )}
              <a href={`https://codeforces.com/profile/${profile.cfHandle}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, color: rc.text, fontFamily: 'monospace', fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 6 }}>
                @{profile.cfHandle}
                <ExternalLink style={{ width: 12, height: 12, opacity: 0.6 }} />
              </a>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {profile.cfRating && (
                  <span style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 13, fontWeight: 800, color: rc.text, fontFamily: 'monospace' }}>
                    {profile.cfRating}
                  </span>
                )}
                <span style={{ color: rc.text, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{profile.cfRank}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#34d399', fontSize: 11, fontWeight: 600 }}>
                  <CheckCircle2 style={{ width: 11, height: 11 }} /> Verified
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <XCircle style={{ width: 18, height: 18, color: '#ef4444' }} />
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>No handle linked</p>
              </div>
              <a href="/api/cf/start" style={{ display: 'inline-block', background: '#dc2626', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                Verify Now →
              </a>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: <Trophy style={{ width: 14, height: 14 }} />, label: 'Total Pts', value: profile.totalPoints ?? 0, color: '#fbbf24' },
            { icon: <Flame style={{ width: 14, height: 14 }} />, label: 'Streak', value: `${streakCount}W`, color: '#fb923c' },
            { icon: <Star style={{ width: 14, height: 14 }} />, label: 'Best Score', value: bestScore || '—', color: '#34d399' },
            { icon: <TrendingUp style={{ width: 14, height: 14 }} />, label: 'Avg Score', value: avgScore || '—', color: '#60a5fa' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color }}>
                {icon}
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' }}>{label}</span>
              </div>
              <p style={{ color: '#fff', fontWeight: 900, fontSize: 22, fontFamily: 'monospace', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly Scores Chart ───────────────────────────────────────────── */}
      <div style={{
        borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)', padding: '22px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy style={{ width: 16, height: 16, color: '#fbbf24' }} />
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Bootcamp Scores</h3>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: 12 }}>
              {participated} of 8 contests · {participated > 0 ? `${Math.round(participated / 8 * 100)}% participation` : 'No contests yet'}
            </span>
            <div style={{
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <span style={{ color: '#fbbf24', fontWeight: 900, fontSize: 18, fontFamily: 'monospace' }}>{profile.totalPoints ?? 0}</span>
              <span style={{ color: '#64748b', fontSize: 11, marginLeft: 4 }}>total pts</span>
            </div>
          </div>
        </div>

        {/* Score bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const score   = profile.scores?.[i];
            const hasSco  = score != null;
            const isMiss  = hasSco && score === 0;
            const isGood  = hasSco && score > 0;
            const barH    = isGood ? Math.max(8, Math.round((score / maxScore) * 80)) : 0;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Bar container */}
                <div style={{ width: '100%', height: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                  {/* Score label */}
                  {isGood && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', color: '#34d399', fontSize: 11, fontWeight: 800, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {score}
                    </div>
                  )}
                  {/* Bar */}
                  <div style={{
                    width: '100%', borderRadius: 6,
                    height: hasSco ? (isGood ? `${barH}px` : 4) : 4,
                    background: !hasSco ? 'rgba(255,255,255,0.05)'
                      : isMiss ? 'rgba(239,68,68,0.25)'
                      : `linear-gradient(180deg, #34d399, #10b981)`,
                    border: !hasSco ? '1px solid rgba(255,255,255,0.05)'
                      : isMiss ? '1px solid rgba(239,68,68,0.30)'
                      : '1px solid rgba(52,211,153,0.35)',
                    transition: 'height 0.5s ease',
                    position: 'relative',
                  }}>
                    {!hasSco && (
                      <Lock style={{ width: 10, height: 10, color: '#1f2937', position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }} />
                    )}
                    {isMiss && (
                      <XCircle style={{ width: 10, height: 10, color: '#ef4444', position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }} />
                    )}
                  </div>
                </div>

                {/* Week label */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#374151', fontSize: 10, fontWeight: 700 }}>W{i + 1}</div>
                  <div style={{ color: '#1f2937', fontSize: 9, marginTop: 1 }}>
                    {WEEK_DATES_ARR[i]?.contest.replace('Fri, ', '') ?? ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ color: '#1f2937', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          Best 6 of 8 weeks counted toward total. Red = missed. Gray = upcoming.
        </p>
      </div>

      {/* ── 8-Week Curriculum ─────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)', padding: '22px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Calendar style={{ width: 16, height: 16, color: '#60a5fa' }} />
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Season Schedule</h3>
          <span style={{ color: '#374151', fontSize: 12, marginLeft: 4 }}>Jun 01 – Jul 24, 2026</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {WEEK_TOPICS_ARR.map((topic, i) => {
            const score   = profile.scores?.[i];
            const isGood  = score != null && score > 0;
            const isMiss  = score === 0;
            const dates   = WEEK_DATES_ARR[i];

            return (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '10px 14px', borderRadius: 10,
                background: isGood ? 'rgba(52,211,153,0.04)' : isMiss ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                border: isGood ? '1px solid rgba(52,211,153,0.15)' : isMiss ? '1px solid rgba(239,68,68,0.12)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                {/* Status dot */}
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: isGood ? 'rgba(52,211,153,0.15)' : isMiss ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
                  border: isGood ? '1px solid rgba(52,211,153,0.35)' : isMiss ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isGood ? '#34d399' : isMiss ? '#f87171' : '#374151',
                  fontWeight: 800, fontSize: 10,
                }}>
                  {isGood ? '✓' : isMiss ? '✗' : i + 1}
                </div>

                {/* Topic */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: isGood ? '#e2e8f0' : '#64748b', fontSize: 13, fontWeight: isGood ? 600 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic}
                  </p>
                </div>

                {/* Score / date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isGood ? (
                    <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 800, fontSize: 14 }}>{score}</span>
                  ) : isMiss ? (
                    <span style={{ color: '#374151', fontSize: 12 }}>missed</span>
                  ) : (
                    <span style={{ color: '#1f2937', fontSize: 11 }}>{dates?.contest}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scoring System Info ───────────────────────────────────────────── */}
      <div style={{
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.01)', padding: '18px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Award style={{ width: 15, height: 15, color: '#fbbf24' }} />
          <h3 style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>Scoring System</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { label: 'Format', value: 'Best 6 of 8 contests' },
            { label: 'Total', value: 'Average of top 6' },
            { label: 'Missed', value: 'Free drop (zero, not counted)' },
            { label: 'Open Board', value: 'All batches compete together' },
            { label: "Girls' Board", value: 'Separate leaderboard · double eligible' },
            { label: 'Prizes', value: '1st: Mech KB · 2nd: Mouse · 3rd: LED Lamp' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: '#1f2937', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</p>
              <p style={{ color: '#475569', fontSize: 12 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
