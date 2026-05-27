'use client';

import { Trophy, BarChart3, Zap, Shield, BookOpen, Star } from 'lucide-react';

const FEATURES = [
  { icon: Trophy,    title: 'Live Leaderboard',       description: 'Scores auto-calculated from Codeforces. Separate categories for juniors, seniors, and women.', iconColor: '#fbbf24', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
  { icon: Zap,       title: 'One-Click CF Verification', description: 'Link your Codeforces handle in under 3 seconds using OAuth — no manual token process.',       iconColor: '#60a5fa', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.20)'  },
  { icon: BarChart3, title: 'Progress Tracking',       description: 'See your week-by-week performance, missed contests, rank changes, and score trends.',             iconColor: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.20)'  },
  { icon: BookOpen,  title: 'Session Resources',        description: 'Access prerequisites, recordings, editorials, and solution repos — all in one place.',            iconColor: '#a78bfa', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)' },
  { icon: Star,      title: "Women-Only Track",          description: 'Dedicated leaderboard categories for women participants — junior and combined.',                 iconColor: '#f472b6', bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.20)' },
  { icon: Shield,    title: 'Institute Verified',        description: 'Restricted to IIEST Shibpur students only, authenticated via your G-Suite account.',             iconColor: '#22d3ee', bg: 'rgba(34,211,238,0.10)',  border: 'rgba(34,211,238,0.20)'  },
];

export function FeaturesGrid() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(52,211,153,0.10)',
          border: '1px solid rgba(52,211,153,0.20)',
          borderRadius: 40, padding: '7px 18px',
          fontSize: 13, color: '#34d399', marginBottom: 16,
        }}>
          ✨ Why CodeIIEST Bootcamp
        </span>
        <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Built for Serious Learners
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Everything you need to track progress, stay motivated, and improve your CP skills systematically.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {FEATURES.map(({ icon: Icon, title, description, iconColor, bg, border }) => (
          <div
            key={title}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '24px 24px 28px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = border;
              el.style.background = 'rgba(255,255,255,0.05)';
              el.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = 'rgba(255,255,255,0.08)';
              el.style.background = 'rgba(255,255,255,0.03)';
              el.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: bg,
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}>
              <Icon style={{ width: 22, height: 22, color: iconColor }} />
            </div>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
