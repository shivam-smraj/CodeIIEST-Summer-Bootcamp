'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Trophy, CalendarDays, TrendingUp, TerminalSquare,
  SlidersHorizontal, Shield, Zap, ChevronRight, Activity,
  BookOpen, RefreshCw, Eye, Globe,
} from 'lucide-react';
import { WEEK_TOPICS, WEEK_DATES } from '@/lib/constants';

const TOPICS  = [...WEEK_TOPICS];
const DATES   = [...WEEK_DATES];

interface DashboardStats {
  totalUsers: number;
  totalContestsSynced: number;
  totalSessions: number;
  unlockedSessions: number;
  contestsDone: number;
  views: number;
  uniqueVisitors: number;
}

const QUICK_ACTIONS = [
  {
    href: '/admin/sync',
    icon: TerminalSquare,
    label: 'Sync Contest',
    desc: 'Fetch standings from Codeforces and update scores',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.20)',
  },
  {
    href: '/admin/scores',
    icon: SlidersHorizontal,
    label: 'Score Manager',
    desc: 'Edit individual week scores for any student',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.20)',
  },
  {
    href: '/admin/contests',
    icon: Trophy,
    label: 'Contest Log',
    desc: 'View full standings & revert synced contests',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.20)',
  },
  {
    href: '/admin/sessions',
    icon: CalendarDays,
    label: 'Sessions CMS',
    desc: 'Unlock weeks, add meet links & editorials',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.20)',
  },
  {
    href: '/admin/users',
    icon: Users,
    label: 'Users',
    desc: 'View & manage all registered participants',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.20)',
  },
];

const WEEK_ACCENTS = [
  '#60a5fa', '#a78bfa', '#34d399', '#fb923c',
  '#f472b6', '#22d3ee', '#facc15', '#f87171',
];

export function AdminDashboard() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [isLoading, setLoad]  = useState(true);
  const [sessions, setSessions] = useState<{ weekNumber: number; isUnlocked: boolean; isContestPosted: boolean }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users?limit=1').then(r => r.json()),
      fetch('/api/admin/contests').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/admin/analytics').then(r => r.json()).catch(() => ({ views: 0, uniqueVisitors: 0 })),
    ])
      .then(([usersData, contestsData, sessionsData, analyticsData]) => {
        const s: typeof sessions = sessionsData.sessions ?? [];
        setSessions(s);
        setStats({
          totalUsers: usersData.total ?? 0,
          totalContestsSynced: contestsData.contests?.length ?? 0,
          totalSessions: s.length,
          unlockedSessions: s.filter(x => x.isUnlocked).length,
          contestsDone: s.filter(x => x.isContestPosted).length,
          views: analyticsData.views ?? 0,
          uniqueVisitors: analyticsData.uniqueVisitors ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoad(false));
  }, []);

  const now   = new Date();
  const START = new Date('2026-06-01');
  const END   = new Date('2026-07-25');
  const WEEK_STARTS = [
    new Date('2026-06-01'), new Date('2026-06-08'), new Date('2026-06-15'),
    new Date('2026-06-22'), new Date('2026-06-29'), new Date('2026-07-06'),
    new Date('2026-07-13'), new Date('2026-07-20'),
  ];
  let currentWeek = 0;
  if (now >= START && now < END) {
    for (let i = WEEK_STARTS.length - 1; i >= 0; i--) {
      if (now >= WEEK_STARTS[i]) { currentWeek = i + 1; break; }
    }
  }
  const bootcampStarted = now >= START;
  const bootcampEnded   = now >= END;

  const STAT_CARDS = [
    {
      icon: Users,
      label: 'Registered',
      value: stats?.totalUsers ?? '—',
      sub: 'participants',
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(96,165,250,0.04))',
      border: 'rgba(96,165,250,0.20)',
    },
    {
      icon: Trophy,
      label: 'Contests Synced',
      value: stats?.totalContestsSynced ?? '—',
      sub: `of 8 total`,
      color: '#fbbf24',
      gradient: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))',
      border: 'rgba(251,191,36,0.20)',
    },
    {
      icon: CalendarDays,
      label: 'Sessions Unlocked',
      value: stats ? `${stats.unlockedSessions}` : '—',
      sub: `of ${stats?.totalSessions ?? 8} weeks`,
      color: '#a78bfa',
      gradient: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(167,139,250,0.04))',
      border: 'rgba(167,139,250,0.20)',
    },
    {
      icon: TrendingUp,
      label: bootcampEnded ? 'Season Over' : bootcampStarted ? 'Current Week' : 'Starts In',
      value: bootcampEnded ? 'Done' : bootcampStarted ? `W${currentWeek}` : 'Jun 01',
      sub: bootcampEnded ? 'Season 01 complete' : bootcampStarted ? `Week ${currentWeek} of 8` : '2026 Season 01',
      color: '#34d399',
      gradient: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))',
      border: 'rgba(52,211,153,0.20)',
    },
    {
      icon: Eye,
      label: 'Page Views',
      value: stats?.views !== undefined ? stats.views.toLocaleString() : '—',
      sub: 'total hits',
      color: '#f472b6',
      gradient: 'linear-gradient(135deg, rgba(244,114,182,0.12), rgba(244,114,182,0.04))',
      border: 'rgba(244,114,182,0.20)',
    },
    {
      icon: Globe,
      label: 'Unique Visitors',
      value: stats?.uniqueVisitors !== undefined ? stats.uniqueVisitors.toLocaleString() : '—',
      sub: 'unique IPs',
      color: '#22d3ee',
      gradient: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(34,211,238,0.04))',
      border: 'rgba(34,211,238,0.20)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: 18, height: 18, color: '#f87171' }} />
            </div>
            <div>
              <p style={{ color: '#f87171', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Admin Panel
              </p>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                Dashboard
              </h1>
            </div>
          </div>
          <p style={{ color: '#374151', fontSize: 13, marginLeft: 46 }}>
            CodeIIEST CP Bootcamp 2026 · Season 01 · Jun 01 – Jul 24
          </p>
        </div>

        {/* Season status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: bootcampStarted ? 'rgba(52,211,153,0.08)' : 'rgba(96,165,250,0.08)',
          border: `1px solid ${bootcampStarted ? 'rgba(52,211,153,0.25)' : 'rgba(96,165,250,0.25)'}`,
          borderRadius: 30, padding: '8px 16px',
        }}>
          <Activity style={{ width: 14, height: 14, color: bootcampStarted ? '#34d399' : '#60a5fa' }} />
          <span style={{ color: bootcampStarted ? '#34d399' : '#60a5fa', fontSize: 12, fontWeight: 700 }}>
            {bootcampEnded ? 'Season Complete' : bootcampStarted ? `Week ${currentWeek} Active` : 'Season Starting Jun 01'}
          </span>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {STAT_CARDS.map(({ icon: Icon, label, value, sub, color, gradient, border }) => (
          <div key={label} style={{
            background: gradient,
            border: `1px solid ${border}`,
            borderRadius: 16, padding: '20px 20px 18px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circle */}
            <div style={{ position: 'absolute', right: -12, top: -12, width: 70, height: 70, borderRadius: '50%', background: `${color}10` }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 18, height: 18, color }} />
              </div>
            </div>
            {isLoading ? (
              <div style={{ height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{value}</div>
            )}
            <p style={{ color: '#4b5563', fontSize: 12, fontWeight: 600 }}>{label}</p>
            <p style={{ color: '#374151', fontSize: 11, marginTop: 2 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>

        {/* Quick Actions */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap style={{ width: 16, height: 16, color: '#fbbf24' }} />
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Quick Actions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  background: bg, border: `1px solid ${border}`,
                  transition: 'all 0.15s ease', cursor: 'pointer',
                }}
                  className="dash-action"
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 16, height: 16, color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{label}</p>
                    <p style={{ color: '#374151', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</p>
                  </div>
                  <ChevronRight style={{ width: 14, height: 14, color: '#374151', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Season Schedule */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BookOpen style={{ width: 16, height: 16, color: '#a78bfa' }} />
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Season Schedule</h2>
            <span style={{ marginLeft: 'auto', color: '#374151', fontSize: 11 }}>Jun 01 – Jul 24</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {TOPICS.map((topic, i) => {
              const weekNum   = i + 1;
              const color     = WEEK_ACCENTS[i];
              const dates     = DATES[i];
              const sInfo     = sessions.find(s => s.weekNumber === weekNum);
              const isUnlocked= sInfo?.isUnlocked ?? false;
              const isContest = sInfo?.isContestPosted ?? false;
              const isActive  = weekNum === currentWeek;
              const isPast    = currentWeek > 0 && weekNum < currentWeek;

              return (
                <div key={weekNum} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10,
                  background: isActive ? `${color}08` : 'transparent',
                  borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
                  opacity: !bootcampStarted && weekNum > 1 ? 0.5 : 1,
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 900, color: isActive ? color : isPast ? '#34d399' : '#374151', minWidth: 28 }}>
                    W{String(weekNum).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: isActive ? '#fff' : isPast ? '#94a3b8' : '#4b5563', fontSize: 12, fontWeight: isActive ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {topic}
                    </p>
                    {dates && (
                      <p style={{ color: '#1f2937', fontSize: 10, marginTop: 1 }}>
                        {dates.session.replace('Mon, ', '')} → {dates.contest.replace('Fri, ', '')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: isUnlocked ? '#34d399' : '#1f2937' }} title={isUnlocked ? 'Unlocked' : 'Locked'}>
                      {isUnlocked ? '🔓' : '🔒'}
                    </span>
                    {isContest && (
                      <span style={{ fontSize: 10 }} title="Contest done">🏆</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Key rules reminder ────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12,
        background: 'rgba(220,38,38,0.03)', border: '1px solid rgba(220,38,38,0.10)',
        borderRadius: 16, padding: 16,
      }}>
        {[
          { icon: '🏆', label: 'Scoring', value: 'Best 6 of 8 contests' },
          { icon: '📅', label: 'Sessions', value: 'Monday evenings' },
          { icon: '⚡', label: 'Contests', value: 'Friday evenings (ICPC mode)' },
          { icon: '🎯', label: 'Target', value: '2028 & 2029 batch · IIEST Shibpur' },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <p style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
              <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .dash-action:hover { opacity: 0.85; transform: translateX(2px); }
      `}</style>
    </div>
  );
}
