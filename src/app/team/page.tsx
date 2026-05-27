import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Meet the CodeIIEST CP Team — mentors and organizers of the CodeIIEST CP & DSA Summer Bootcamp 2026.',
};

// ── Team data ──────────────────────────────────────────────────────────────────
// Replace with real data from Google Form submissions before June 1st
const MENTORS: {
  name: string; role: string; cfHandle: string; cfRating: number;
  cfRank: string; department: string; batch: number;
  linkedin?: string; image?: string; bio: string; speciality: string;
}[] = [
  {
    name: 'Aryan Gupta',
    role: 'Head Mentor',
    cfHandle: 'aryan_g',
    cfRating: 1847,
    cfRank: 'expert',
    department: 'CSB',
    batch: 2025,
    bio: 'Placed at Google SWE. Loves constructive algorithms and DP. Has solved 1200+ problems on Codeforces.',
    speciality: 'DP & Graph Theory',
    linkedin: 'https://linkedin.com/',
  },
  {
    name: 'Priyanka Sharma',
    role: 'Mentor — DSA',
    cfHandle: 'priyanka_cp',
    cfRating: 1723,
    cfRank: 'expert',
    department: 'CSB',
    batch: 2025,
    bio: 'ICPC Amritapuri Regionalist 2024. Passionate about teaching binary search and number theory.',
    speciality: 'Binary Search & Math',
    linkedin: 'https://linkedin.com/',
  },
  {
    name: 'Rohan Das',
    role: 'Mentor — Algorithms',
    cfHandle: 'rohan_d99',
    cfRating: 1651,
    cfRank: 'expert',
    department: 'ETB',
    batch: 2026,
    bio: 'CP enthusiast since 1st year. Specializes in graph algorithms and segment trees.',
    speciality: 'Graphs & Trees',
    linkedin: 'https://linkedin.com/',
  },
  {
    name: 'Ananya Roy',
    role: 'Mentor — Competitive Math',
    cfHandle: 'ananya_r',
    cfRating: 1604,
    cfRank: 'expert',
    department: 'MEB',
    batch: 2026,
    bio: 'Started CP in 2nd year, went from Newbie to Expert in 8 months. Loves teaching number theory.',
    speciality: 'Number Theory & Combinatorics',
    linkedin: 'https://linkedin.com/',
  },
  {
    name: 'Souvik Mondal',
    role: 'Mentor — STL & Implementation',
    cfHandle: 'souvik_m',
    cfRating: 1556,
    cfRank: 'specialist',
    department: 'ITB',
    batch: 2027,
    bio: 'Known for clean, fast C++ code. Runs weekly upsolving sessions in the WhatsApp group.',
    speciality: 'STL, Sorting & Implementation',
    linkedin: 'https://linkedin.com/',
  },
  {
    name: 'Ishita Agarwal',
    role: 'Mentor — Backtracking & Recursion',
    cfHandle: 'ishita_a',
    cfRating: 1501,
    cfRank: 'specialist',
    department: 'CSB',
    batch: 2027,
    bio: 'Her backtracking sessions are legendary in CodeIIEST. Makes recursion feel natural.',
    speciality: 'Recursion & Backtracking',
    linkedin: 'https://linkedin.com/',
  },
];

const ORGANIZERS = [
  {
    name: 'Shivam Kumar',
    role: 'Platform Developer',
    cfHandle: 'sh1van_dev',
    department: 'EEB',
    batch: 2028,
    bio: 'Built the entire bootcamp platform — Google OAuth, CF verification, leaderboard & CMS.',
    linkedin: undefined as string | undefined,
    isDevLead: true,
  },
];

const RANK_COLORS: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  newbie:             { text: '#9e9e9e', bg: 'rgba(158,158,158,0.10)', border: 'rgba(158,158,158,0.20)', gradient: 'from-gray-500/20 to-gray-600/10' },
  pupil:              { text: '#4caf50', bg: 'rgba(76,175,80,0.10)',   border: 'rgba(76,175,80,0.20)',   gradient: 'from-green-500/20 to-green-600/10' },
  specialist:         { text: '#03a9f4', bg: 'rgba(3,169,244,0.10)',   border: 'rgba(3,169,244,0.20)',   gradient: 'from-cyan-500/20 to-blue-600/10' },
  expert:             { text: '#1e88e5', bg: 'rgba(30,136,229,0.10)',  border: 'rgba(30,136,229,0.20)',  gradient: 'from-blue-500/20 to-blue-700/10' },
  'candidate master': { text: '#aa00ff', bg: 'rgba(170,0,255,0.10)',   border: 'rgba(170,0,255,0.20)',   gradient: 'from-purple-500/20 to-violet-700/10' },
  master:             { text: '#ff6d00', bg: 'rgba(255,109,0,0.10)',   border: 'rgba(255,109,0,0.20)',   gradient: 'from-orange-500/20 to-amber-600/10' },
};

export default function TeamPage() {
  return (
    <MainLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(220,38,38,0.05) 0%, rgba(30,136,229,0.04) 60%, transparent 100%)',
        paddingTop: 60, paddingBottom: 56, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative background orbs */}
        <div style={{ position: 'absolute', top: -60, left: '20%', width: 300, height: 300, background: 'rgba(220,38,38,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: '20%', width: 250, height: 250, background: 'rgba(30,136,229,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          {/* A CodeIIEST × GDG Production badge from PDF */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 40, padding: '7px 18px', fontSize: 11,
            color: '#6b7280', letterSpacing: '0.08em', fontWeight: 600,
          }}>
            ⚡ A CODEIIEST × GDG PRODUCTION
          </div>

          <h1 style={{
            color: '#fff', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Meet the{' '}
            <span style={{
              background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CodeIIEST</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>CP Team</span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, maxWidth: 540, margin: '0 auto 28px' }}>
            Seniors who actually use this stuff — not recordings from 2019.
            Taught by IIEST Shibpur CP experts who&apos;ve been in your shoes.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: `${MENTORS.length} Mentors`, icon: '🎓' },
              { label: 'Expert+ Rated', icon: '⭐' },
              { label: 'IIEST Verified', icon: '🏫' },
              { label: 'Mon Sessions', icon: '📅' },
            ].map(({ label, icon }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 30, padding: '6px 14px', fontSize: 13, color: '#94a3b8',
              }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>

        {/* ── Season Info Banner ───────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, rgba(30,136,229,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
          padding: '20px 24px', marginBottom: 56,
          display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center',
        }}>
          <div>
            <p style={{ color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
              SEASON 01
            </p>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Jun 01 → Jul 24, 2026</p>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Sessions', value: 'Mon Evenings' },
              { label: 'Contests', value: 'Fri Evenings' },
              { label: 'Duration', value: '8 Weeks' },
              { label: 'Format', value: '1 Topic + 1 CF Contest / Week' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ color: '#374151', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p>
                <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mentors ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>Mentors</h2>
            <span style={{ color: '#374151', fontSize: 13 }}>
              Taught by seniors who actually use this stuff
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 18,
          }}>
            {MENTORS.map(m => <MentorCard key={m.cfHandle} mentor={m} />)}
          </div>
        </div>

        {/* ── Organizers ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>Platform & Org</h2>
            <span style={{ color: '#374151', fontSize: 13 }}>The people who built and run this</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {ORGANIZERS.map(org => (
              <div key={org.cfHandle} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: 24, display: 'flex', gap: 16,
                position: 'relative', overflow: 'hidden',
              }}>
                {org.isDevLead && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)',
                    borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#60a5fa',
                  }}>
                    Dev Lead
                  </div>
                )}
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(139,92,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c4b5fd', fontWeight: 900, fontSize: 22,
                }}>
                  {org.name[0]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{org.name}</h3>
                  <p style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{org.role}</p>
                  <p style={{ color: '#4b5563', fontSize: 12, lineHeight: 1.65, marginBottom: 10 }}>{org.bio}</p>
                  <a href={`https://codeforces.com/profile/${org.cfHandle}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#60a5fa', fontSize: 12, fontFamily: 'monospace', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    @{org.cfHandle} <ExternalLink style={{ width: 10, height: 10, opacity: 0.5 }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rules from PDF ───────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '36px 32px', marginBottom: 56,
        }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>
            📋 Ground Rules — Six Lines
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {[
              { n: 'i', rule: 'Write your own code.', detail: 'Discussing live, copying, or letting AI do your thinking = cheating. We catch it, you\'re out.' },
              { n: 'ii', rule: 'Syntax ok. Solution not.', detail: 'Looking up syntax is fine. If you can\'t write what you\'re pasting, you don\'t know it yet.' },
              { n: 'iii', rule: 'Missed a contest?', detail: 'Scores zero and gets dropped from your average. Life happens — just show up next week.' },
              { n: 'iv', rule: 'Upsolve, always.', detail: 'Every problem you couldn\'t crack on Friday is homework before Monday. The contest is the diagnostic.' },
              { n: 'v', rule: 'Don\'t watch your rating in W1.', detail: 'It will dip. It will bounce. Two contests is noise. Two months is signal. Stop refreshing.' },
              { n: 'vi', rule: 'Stuck? WhatsApp group.', detail: 'Seniors are in there for a reason. No dumb questions — only unasked ones.' },
            ].map(({ n, rule, detail }) => (
              <div key={n} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#dc2626', fontWeight: 800, fontSize: 12, fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>{n}.</span>
                  <div>
                    <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{rule}</p>
                    <p style={{ color: '#4b5563', fontSize: 12, lineHeight: 1.6 }}>{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(30,136,229,0.06))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '44px 32px' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🚀</div>
          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 24, marginBottom: 10 }}>
            Two summers from now, you&apos;ll wish you&apos;d started this one.
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 24px' }}>
            The growth is the point. The prizes are real. Eight weeks from now you&apos;ll be a different programmer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/sessions" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dc2626', color: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 24px rgba(220,38,38,0.3)' }}>
              View Sessions →
            </a>
            <a href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Leaderboard
            </a>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ── MentorCard ────────────────────────────────────────────────────────────────
function MentorCard({ mentor }: { mentor: typeof MENTORS[0] }) {
  const rankKey = mentor.cfRank.toLowerCase();
  const rc = RANK_COLORS[rankKey] ?? RANK_COLORS.specialist;
  const initials = mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${rc.border}`,
      borderRadius: 18, padding: 22, overflow: 'hidden', position: 'relative',
      transition: 'transform 0.2s ease, border-color 0.2s ease',
    }}>
      {/* Top color accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${rc.text}50, transparent)` }} />

      {/* Header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: rc.bg, border: `2px solid ${rc.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: rc.text, overflow: 'hidden',
        }}>
          {mentor.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={mentor.image} alt={mentor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{mentor.name}</h3>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>{mentor.role}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: rc.text }}>
              {mentor.cfRank.charAt(0).toUpperCase() + mentor.cfRank.slice(1)} · {mentor.cfRating}
            </span>
          </div>
        </div>
      </div>

      {/* Speciality */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151' }}>Focus</span>
        <span style={{ fontSize: 12, color: rc.text, fontWeight: 600 }}>{mentor.speciality}</span>
      </div>

      {/* Bio */}
      <p style={{ color: '#4b5563', fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>{mentor.bio}</p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
        <a href={`https://codeforces.com/profile/${mentor.cfHandle}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#60a5fa', fontSize: 12, fontFamily: 'monospace', textDecoration: 'none' }}>
          @{mentor.cfHandle} <ExternalLink style={{ width: 10, height: 10, opacity: 0.5 }} />
        </a>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#1f2937', fontSize: 11 }}>{mentor.department} · {mentor.batch}</span>
          {mentor.linkedin && (
            <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 6, padding: '2px 8px', color: '#60a5fa', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>
              in ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
