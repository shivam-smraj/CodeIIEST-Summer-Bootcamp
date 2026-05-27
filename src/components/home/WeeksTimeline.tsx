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

const DATES  = [...WEEK_DATES];
const TOPICS = [...WEEK_TOPICS];

function getActiveWeek(): number {
  const now = new Date();
  const WEEK_STARTS = [
    new Date('2026-06-01'), new Date('2026-06-08'), new Date('2026-06-15'),
    new Date('2026-06-22'), new Date('2026-06-29'), new Date('2026-07-06'),
    new Date('2026-07-13'), new Date('2026-07-20'),
  ];
  const END = new Date('2026-07-25');
  if (now < WEEK_STARTS[0] || now >= END) return 0;
  for (let i = WEEK_STARTS.length - 1; i >= 0; i--) {
    if (now >= WEEK_STARTS[i]) return i + 1;
  }
  return 0;
}

export function WeeksTimeline() {
  const activeWeek = getActiveWeek();

  return (
    <section style={{ padding: '80px 16px', maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)',
          borderRadius: 40, padding: '7px 18px', fontSize: 13, color: '#60a5fa', marginBottom: 16,
        }}>
          📚 8-Week Curriculum
        </span>
        <h2 style={{ fontSize: 'clamp(26px,5vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Each week ends in a contest.
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          By week eight, you&apos;ll laugh at the problems you couldn&apos;t touch in week one.
          <br />
          <span style={{ color: '#6b7280', fontSize: 13 }}>SEASON 01 · JUN 01 – JUL 24</span>
        </p>
      </div>

      {/* ── Table wrapper ───────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18, overflow: 'hidden',
      }}>

        {/* Desktop header row — hidden on mobile via CSS class */}
        <div className="wt-header-row">
          {['WEEK', 'DATES', 'TOPIC / CONTEST'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#6b7280' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {TOPICS.map((topic, i) => {
          const weekNum = i + 1;
          const meta    = WEEK_META[i];
          const dates   = DATES[i];
          const isActive = weekNum === activeWeek;
          const isPast   = activeWeek > 0 && weekNum < activeWeek;
          const isFuture = activeWeek > 0 ? weekNum > activeWeek : weekNum > 1;

          const accentColor = isActive ? meta.color : isPast ? '#34d399' : '#6b7280';

          return (
            <div
              key={weekNum}
              className="wt-row"
              style={{
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background:   isActive ? `${meta.color}08` : 'transparent',
                borderLeft:   isActive ? `3px solid ${meta.color}` : '3px solid transparent',
                opacity:      isFuture ? 0.90 : 1,
                transition:   'background 0.2s',
              }}
            >
              {/* ── Week label ── */}
              <div className="wt-col-week" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 15, color: accentColor }}>
                  W{String(weekNum).padStart(2, '0')}
                </span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                )}
              </div>

              {/* ── Dates ── desktop: own column | mobile: inside topic block ── */}
              <div className="wt-col-dates" style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                {dates ? (
                  <>
                    <span>{dates.session.replace('Mon, ', '')}</span>
                    <span style={{ color: '#4b5563' }}> → </span>
                    <span>{dates.contest.replace('Fri, ', '')}</span>
                  </>
                ) : '—'}
              </div>

              {/* ── Topic + contest (combined) ── */}
              <div className="wt-col-topic">
                {/* Topic row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{meta.emoji}</span>
                  <span style={{
                    color:      isActive ? '#fff' : isPast ? '#cbd5e1' : '#e2e8f0',
                    fontWeight: 700,
                    fontSize:   14, lineHeight: 1.35,
                  }}>
                    {topic}
                  </span>
                  {isPast && (
                    <span style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#34d399', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ✓ Done
                    </span>
                  )}
                  {isActive && (
                    <span style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, borderRadius: 20, padding: '2px 8px', fontSize: 10, color: meta.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      ● Active
                    </span>
                  )}
                </div>

                {/* On mobile only: show dates + contest below the topic */}
                <div className="wt-mobile-meta">
                  <span style={{ fontSize: 11, color: '#6b7280' }}>
                    {dates
                      ? `${dates.session.replace('Mon, ', '')} → ${dates.contest.replace('Fri, ', '')}`
                      : '—'}
                  </span>
                  {dates?.contest && (
                    <span style={{ fontSize: 11, color: isActive ? meta.color : '#6b7280', fontWeight: isActive ? 700 : 400, marginLeft: 8 }}>
                      · Contest: {dates.contest}
                    </span>
                  )}
                </div>
              </div>

              {/* ── Contest date (desktop only right column) ── */}
              <div className="wt-col-contest" style={{
                fontSize: 12, color: isActive ? meta.color : '#6b7280',
                fontWeight: isActive ? 700 : 500, textAlign: 'right',
              }}>
                {dates?.contest ?? '—'}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 16, fontWeight: 500 }}>
        Sessions: Monday evenings · Contests: Friday evenings · Exact timings in WhatsApp group
      </p>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(1.4); }
        }

        /* ── DESKTOP (> 640px): 4-column grid ── */
        .wt-header-row {
          display: grid;
          grid-template-columns: 56px 130px 1fr;
          padding: 10px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .wt-row {
          display: grid;
          grid-template-columns: 56px 130px 1fr 110px;
          gap: 0;
          padding: 14px 20px;
          align-items: center;
        }
        .wt-col-week    { }
        .wt-col-dates   { display: block; }
        .wt-col-topic   { }
        .wt-col-contest { display: block; }
        .wt-mobile-meta { display: none; }

        /* ── MOBILE (≤ 640px): 2-column layout ── */
        @media (max-width: 640px) {
          .wt-header-row {
            display: none;            /* hide column headers on mobile */
          }
          .wt-row {
            grid-template-columns: 48px 1fr;
            grid-template-rows: auto;
            grid-template-areas:
              "week topic"
              "week meta";
            padding: 14px 16px;
            gap: 4px 12px;
            align-items: start;
          }
          .wt-col-week    { grid-area: week; align-self: center; }
          .wt-col-dates   { display: none; }   /* hidden — shown in mobile-meta */
          .wt-col-topic   { grid-area: topic; }
          .wt-col-contest { display: none; }   /* hidden — shown in mobile-meta */
          .wt-mobile-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            grid-area: meta;
            margin-top: 4px;
          }
        }
      `}</style>
    </section>
  );
}
