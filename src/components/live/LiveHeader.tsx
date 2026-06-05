import React from 'react';
import { Play, Pause, Settings, ChevronDown, Check } from 'lucide-react';
import type { CFContest } from '@/types/codeforces';
import type { AppMode, ContestMode } from './types';

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

export function LiveHeader({
  contest, mode, speed, setSpeed, currentTime, isPaused, setIsPaused, onSetup
}: LiveHeaderProps) {
  const [isSpeedOpen, setIsSpeedOpen] = React.useState(false);
  const speeds = [1, 5, 10, 20, 60, 200];

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-14 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-6">
        <div className="text-white font-bold tracking-widest text-lg flex items-center gap-2">
          Code<span className="text-[#888]">IIEST</span>
        </div>
        <div className="h-6 w-px bg-[#333]" />
        <h2 className="text-white font-medium text-lg">{contest?.name || 'Contest'}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {mode === 'replay' && (
          <div className="relative">
            <button 
              onClick={() => setIsSpeedOpen(!isSpeedOpen)}
              className="flex items-center gap-2 text-white bg-[#2a2a2a] hover:bg-[#333] px-3 py-1 border border-[#444] text-sm"
            >
              Speed: {speed}x <ChevronDown className="w-4 h-4" />
            </button>
            {isSpeedOpen && (
              <div className="absolute top-full right-0 mt-1 w-32 bg-[#2a2a2a] border border-[#444] shadow-xl z-50">
                {speeds.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setIsSpeedOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#444] flex items-center justify-between"
                  >
                    {s}x {speed === s && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-white font-mono text-xl">
          <span className="text-[#888] text-sm font-sans uppercase">Time</span>
          {formatTime(currentTime)}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 text-white bg-[#2a2a2a] hover:bg-[#333] border border-[#444]"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
          <button 
            onClick={onSetup}
            className="p-1.5 text-[#888] hover:text-white bg-[#2a2a2a] hover:bg-[#333] border border-[#444]"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
