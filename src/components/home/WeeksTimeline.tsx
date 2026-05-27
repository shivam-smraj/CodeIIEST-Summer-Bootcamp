import { WEEK_TOPICS, WEEK_DATES } from '@/lib/constants';

const WEEK_META = [
  { color: '#60a5fa', emoji: '⚙️' },   // W1 — STL, Custom Sorting
  { color: '#a78bfa', emoji: '👆' },   // W2 — Two Pointers
  { color: '#34d399', emoji: '🔍' },   // W3 — Binary Search
  { color: '#fb923c', emoji: '📦' },   // W4 — Stack/Queue
  { color: '#f472b6', emoji: '💡' },   // W5 — Bit Manipulation
  { color: '#22d3ee', emoji: '🧮' },   // W6 — Number Theory
  { color: '#facc15', emoji: '🌀' },   // W7 — Recursion
  { color: '#f87171', emoji: '🕸️' },   // W8 — DFS/BFS
];

const DATES = [...WEEK_DATES];
const TOPICS = [...WEEK_TOPICS];

// Determine active week based on current date
function getActiveWeek(): number {
  const now = new Date();
  const WEEK_STARTS = [
    new Date('2026-06-01'), new Date('2026-06-08'), new Date('2026-06-15'),
    new Date('2026-06-22'), new Date('2026-06-29'), new Date('2026-07-06'),
    new Date('2026-07-13'), new Date('2026-07-20'),
  ];
  const END = new Date('2026-07-25');
  if (now < WEEK_STARTS[0] || now >= END) return 0; // Not started or ended
  for (let i = WEEK_STARTS.length - 1; i >= 0; i--) {
    if (now >= WEEK_STARTS[i]) return i + 1; // 1-based
  }
  return 0;
}

export function WeeksTimeline() {
  const activeWeek = getActiveWeek();

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(59,130,246,0.10)',
          border: '1px solid rgba(59,130,246,0.20)',
          borderRadius: 40, padding: '7px 18px',
          fontSize: 13, color: '#60a5fa',
          marginBottom: 16,
        }}>
          📚 8-Week Curriculum
        </span>
        <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Each week ends in a contest.
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          By week eight, you'll laugh at the problems you couldn't touch in week one.
          <br />
          <span style={{ color: '#374151', fontSize: 13 }}>SEASON 01 · JUN 01 – JUL 24</span>
        </p>
      </div>

      {/* Schedule table style */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '64px 120px 1fr 120px',
          gap: 0,
          padding: '10px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['WEEK', 'DATES', 'TOPIC', 'CONTEST'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6b7280' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {TOPICS.map((topic, i) => {
          const weekNum = i + 1;
          const meta = WEEK_META[i];
          const dates = DATES[i];
          const isActive = weekNum === activeWeek;
          const isPast = activeWeek > 0 && weekNum < activeWeek;
          const isFuture = activeWeek > 0 ? weekNum > activeWeek : weekNum > 1;

          return (
            <div
              key={weekNum}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 120px 1fr 120px',
                gap: 0,
                padding: '14px 24px',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: isActive
                  ? `${meta.color}08`
                  : 'transparent',
                borderLeft: isActive ? `3px solid ${meta.color}` : '3px solid transparent',
                alignItems: 'center',
                opacity: isFuture ? 0.60 : 1,
                transition: 'background 0.2s',
              }}
            >
              {/* Week label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: 'monospace', fontWeight: 900, fontSize: 15,
                  color: isActive ? meta.color : isPast ? '#34d399' : '#6b7280',
                }}>
                  W{String(weekNum).padStart(2, '0')}
                </span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                )}
              </div>

              {/* Date range */}
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                {dates ? (
                  <>
                    <span>{dates.session.replace('Mon, ', '')}</span>
                    <span style={{ color: '#4b5563' }}> → </span>
                    <span>{dates.contest.replace('Fri, ', '')}</span>
                  </>
                ) : '—'}
              </div>

              {/* Topic */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                <span style={{
                  color: isActive ? '#fff' : isPast ? '#cbd5e1' : '#94a3b8',
                  fontWeight: isActive ? 700 : isPast ? 500 : 500,
                  fontSize: 14,
                  lineHeight: 1.3,
                }}>
                  {topic}
                </span>
                {isPast && (
                  <span style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', borderRadius: 20, padding: '1px 8px', fontSize: 10, color: '#34d399', fontWeight: 600 }}>
                    ✓ Done
                  </span>
                )}
                {isActive && (
                  <span style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, borderRadius: 20, padding: '1px 8px', fontSize: 10, color: meta.color, fontWeight: 700 }}>
                    ● Active
                  </span>
                )}
              </div>

              {/* Contest date */}
              <div style={{ fontSize: 12, color: isActive ? meta.color : '#6b7280', fontWeight: isActive ? 700 : 500, textAlign: 'right' }}>
                {dates?.contest ?? '—'}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 16, fontWeight: 500 }}>
        Sessions: Monday evenings · Contests: Friday evenings · Exact timings in WhatsApp group
      </p>

      <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}`}</style>
    </section>
  );
}
