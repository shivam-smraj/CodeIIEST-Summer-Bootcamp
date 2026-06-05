import React from 'react';
import { Play, Pause, Settings, ChevronDown, Check } from 'lucide-react';
import type { CFContest } from '@/types/codeforces';
import type { ContestMode, ScoreboardTheme } from './types';

interface LiveHeaderProps {
  contest: CFContest | null;
  mode: ContestMode;
  speed: number;
  setSpeed: (v: number) => void;
  currentTime: number;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  onSetup: () => void;
  theme: ScoreboardTheme;
}

// CodeIIEST logo SVG — viewBox 600×495 → ratio 1.212
function CodeIIESTLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 495" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="425" height="40" fill="#F60000" />
      <rect x="110" y="60" width="315" height="40" fill="#FF0000" />
      <rect x="165" y="400" width="260" height="40" fill="#F60000" />
      <rect x="55" y="455" width="370" height="40" fill="#671616" />
      <rect x="55" y="60" width="40" height="435" fill="#671616" />
      <rect x="110" y="60" width="40" height="380" fill="#FF0000" />
      <rect width="40" height="495" fill="#F60000" />
      <rect x="445" width="37" height="495" fill="#A6A6A6" />
      <rect x="502" width="37" height="495" fill="#D9D9D9" />
      <rect x="559" width="37" height="495" fill="#D9D9D9" />
    </svg>
  );
}

export function LiveHeader({
  contest, mode, speed, setSpeed, currentTime, isPaused, setIsPaused, onSetup, theme,
}: LiveHeaderProps) {
  const [isSpeedOpen, setIsSpeedOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const speeds = [1, 5, 10, 20, 60, 200];
  const isLive = mode === 'live';
  const isDark = theme === 'dark';

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpeedOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fmt = (secs: number) => {
    const s = Math.floor(secs);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <div style={{
      height: 60,
      background: isDark
        ? 'rgba(7,8,10,0.94)'
        : 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '3px solid #0d47a1',
      backdropFilter: isDark ? 'blur(24px)' : 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      zIndex: 30,
      position: 'relative',
      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    }}>

      {/* ── Left: Logo + Contest Name ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {/* Logo box — SVG 600:495 ≈ 1.21 → w=44 h=36 */}
        <div style={{
          padding: '6px 9px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.25)',
          flexShrink: 0,
          backdropFilter: 'blur(4px)',
        }}>
          <CodeIIESTLogo className="w-11 h-9" />
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />

        {/* Contest info */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            lineHeight: 1,
            marginBottom: 5,
            fontFamily: 'Roboto, sans-serif',
          }}>
            CodeIIEST · Summer Bootcamp 2026
          </p>
          <h2
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              lineHeight: 1.1,
              fontFamily: 'Roboto, sans-serif',
            }}
            className="truncate max-w-[180px] md:max-w-[320px] lg:max-w-[500px]"
            title={contest?.name || 'Contest'}
          >
            {contest?.name || 'Codeforces Contest'}
          </h2>
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Mode pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 13px',
          borderRadius: 999,
          background: isLive ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)',
          border: `1px solid ${isLive ? 'rgba(255,100,100,0.6)' : 'rgba(245,200,11,0.6)'}`,
        }}>
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: isLive ? '#ff6b6b' : '#fcd34d',
              opacity: 0.8, animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: isLive ? '#ff6b6b' : '#fcd34d' }} />
          </span>
          <span style={{
            color: isLive ? '#ffb3b3' : '#fef3c7',
            fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em',
            fontFamily: 'Roboto, sans-serif',
          }}>
            {isLive ? 'Live' : 'Replay'}
          </span>
        </div>

        {/* Speed selector (replay only) */}
        {mode === 'replay' && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsSpeedOpen(!isSpeedOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Roboto, sans-serif',
              }}
            >
              <span>{speed}×</span>
              <ChevronDown style={{
                width: 12, height: 12, color: 'rgba(255,255,255,0.6)',
                transform: isSpeedOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }} />
            </button>

            {isSpeedOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 150,
                background: '#fff',
                border: '1px solid #dee2e6',
                borderRadius: 10, padding: '4px',
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                fontFamily: 'Roboto, sans-serif',
              }}>
                {speeds.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setIsSpeedOpen(false); }}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: 13, fontWeight: speed === s ? 700 : 400,
                      color: speed === s ? '#1a237e' : '#333',
                      background: speed === s ? '#e8eaf6' : 'transparent',
                      border: 'none', borderRadius: 7, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      {s}×
                      {s === 10 && <span style={{ color: '#9e9e9e', fontSize: 11, fontWeight: 400, marginLeft: 6 }}>rec</span>}
                    </span>
                    {speed === s && <Check style={{ width: 13, height: 13, color: '#1a237e' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clock — centrepiece */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 16px',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', fontFamily: 'Roboto, sans-serif' }}>
            Time
          </span>
          <span style={{ color: '#fff', fontFamily: 'ui-monospace, monospace', fontSize: 20, fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1 }}>
            {fmt(currentTime)}
          </span>
          {contest?.durationSeconds ? (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600 }}>
              / {fmt(contest.durationSeconds)}
            </span>
          ) : null}
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          title={isPaused ? 'Resume' : 'Pause'}
          style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isPaused ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)',
            border: isPaused ? '1px solid rgba(255,100,100,0.6)' : '1px solid rgba(255,255,255,0.25)',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isPaused
            ? <Play  style={{ width: 15, height: 15, fill: 'currentColor' }} />
            : <Pause style={{ width: 15, height: 15, fill: 'currentColor' }} />
          }
        </button>

        {/* Settings */}
        <button
          onClick={onSetup}
          title="Back to Setup"
          style={{
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Settings style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}
