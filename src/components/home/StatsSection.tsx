'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 8,  suffix: '',    label: 'Weeks of Training',  emoji: '📅', color: '#60a5fa' },
  { value: 8,  suffix: '',    label: 'Weekly CF Contests', emoji: '🏆', color: '#fbbf24' },
  { value: 6,  suffix: ' /8', label: 'Best Scores Count',  emoji: '✅', color: '#34d399' },
  { value: 3,  suffix: 's',   label: 'CF Verify Speed',    emoji: '⚡', color: '#fb923c' },
];

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ value, suffix, label, emoji, color, trigger }: typeof STATS[0] & { trigger: boolean }) {
  const count = useCountUp(value, 1200, trigger);
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '28px 20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.05)';
        el.style.transform = 'translateY(-3px)';
        el.style.borderColor = `${color}30`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.03)';
        el.style.transform = 'translateY(0)';
        el.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 'clamp(32px,4vw,44px)', fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>
        {count}{suffix}
      </div>
      <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ padding: '60px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} {...stat} trigger={triggered} />
        ))}
      </div>
    </section>
  );
}
