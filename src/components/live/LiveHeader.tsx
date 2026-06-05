import React from 'react';
import { Play, Pause, Settings, ChevronDown, Check } from 'lucide-react';
import type { CFContest } from '@/types/codeforces';
import type { ContestMode } from './types';

interface LiveHeaderProps {
  contest: CFContest | null;
  mode: ContestMode;
  speed: number;
  setSpeed: (v: number) => void;
  currentTime: number;
  isPaused: boolean;
  setIsPaused: (v: boolean) => void;
  onSetup: () => void;
}

// --- CodeIIEST SVG Logo ---
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
  contest, mode, speed, setSpeed, currentTime, isPaused, setIsPaused, onSetup
}: LiveHeaderProps) {
  const [isSpeedOpen, setIsSpeedOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const speeds = [1, 5, 10, 20, 60, 200];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpeedOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-[#07080a]/80 border-b border-white/[0.06] backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-30 selection:bg-white/10">
      
      {/* Left: CodeIIEST Logo + Contest Name */}
      <div className="flex items-center gap-4">
        <div className="p-1.5 bg-white/[0.03] rounded-lg border border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <CodeIIESTLogo className="w-7 h-5.5" />
        </div>
        <div className="h-5 w-px bg-white/[0.08]" />
        <div className="flex flex-col min-w-0">
          <p className="text-[9px] text-white/30 tracking-[0.25em] uppercase font-bold leading-none">CodeIIEST Broadcast</p>
          <h2 className="text-white font-extrabold text-[14px] leading-tight tracking-wide mt-1.5 truncate max-w-[240px] md:max-w-[380px] lg:max-w-[550px]" title={contest?.name || 'Contest'}>
            {contest?.name || 'Codeforces Contest'}
          </h2>
        </div>
      </div>
      
      {/* Right: Broadcast controls, clock, time status badge */}
      <div className="flex items-center gap-5">
        
        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${mode === 'live' ? 'bg-red-500' : 'bg-amber-500'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${mode === 'live' ? 'bg-red-500' : 'bg-amber-500'}`} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            {mode === 'live' ? 'Live Standing' : 'Contest Replay'}
          </span>
        </div>

        {/* Speed Selector Dropdown for Replay */}
        {mode === 'replay' && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsSpeedOpen(!isSpeedOpen)}
              className="flex items-center gap-2 text-white/80 bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs font-semibold tracking-wide transition-all"
            >
              <span>Speed: {speed}x</span> 
              <ChevronDown className={`w-3.5 h-3.5 text-white/45 transition-transform duration-200 ${isSpeedOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSpeedOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 w-36 bg-[#0e0f12] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-xl py-1.5 z-50 backdrop-blur-xl">
                {speeds.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setIsSpeedOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-white/70 hover:text-white hover:bg-white/[0.04] flex items-center justify-between transition-colors"
                  >
                    <span>{s}x {s === 10 && <span className="text-[9px] text-white/30 font-normal ml-1">(Rec)</span>}</span> 
                    {speed === s && <Check className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Clock */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-lg">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Elapsed</span>
          <span className="text-white font-mono text-base font-bold tabular-nums">
            {formatTime(currentTime)}
          </span>
        </div>
        
        {/* Play/Pause & Settings Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Broadcast' : 'Pause Broadcast'}
            className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] active:scale-95 border border-white/[0.06] rounded-lg transition-all"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-white/80" /> : <Pause className="w-4 h-4 fill-current text-white/80" />}
          </button>
          <button 
            onClick={onSetup}
            title="Exit to Setup Console"
            className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] active:scale-95 border border-white/[0.06] rounded-lg transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
