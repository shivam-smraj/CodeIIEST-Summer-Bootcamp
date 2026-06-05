import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CFSubmission } from '@/types/codeforces';
import type { UserMapInfo, ScoreRow } from './types';
import { CFHandle } from './CFHandle';

interface LiveQueueProps {
  recentEvents: CFSubmission[];
  userMap: Record<string, UserMapInfo>;
  scoreboard: ScoreRow[];
}

export function LiveQueue({ recentEvents, userMap, scoreboard }: LiveQueueProps) {
  
  const getTeamStats = (handle: string) => {
    const idx = scoreboard.findIndex(r => r.handle === handle);
    if (idx === -1) return { rank: '-', points: '-' };
    return { rank: idx + 1, points: scoreboard[idx].points };
  };

  return (
    <div className="w-80 bg-[#0a0f18]/85 border-l border-white/[0.06] backdrop-blur-xl flex flex-col z-20 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] selection:bg-white/10">
      
      {/* Queue Header */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <h3 className="font-bold text-xs text-white/90 uppercase tracking-[0.2em]">Broadcast Feed</h3>
        </div>
        <span className="text-[10px] bg-white/[0.03] text-white/40 border border-white/[0.06] px-2 py-0.5 rounded-full font-bold">
          {recentEvents.length} Active
        </span>
      </div>
      
      {/* Queue List */}
      <div className="flex-1 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {recentEvents.map(event => {
            const handle = event.author.members[0].handle;
            const mapped = userMap[handle.toLowerCase()];
            const name = mapped ? mapped.firstName : handle;
            const isAC = event.verdict === 'OK';
            
            let bgColor = '#444';
            let darkColor = '#222';
            let accentColor = 'rgba(255,255,255,0.1)';
            let verdictText = '??';
            
            if (isAC) {
              bgColor = '#198754';
              darkColor = '#146c43';
              accentColor = '#198754';
              verdictText = 'AC';
            } else if (event.verdict === 'WRONG_ANSWER') {
              bgColor = '#dc3545';
              darkColor = '#a71d1d';
              accentColor = '#dc3545';
              verdictText = 'WA';
            } else if (event.verdict === 'TIME_LIMIT_EXCEEDED') {
              bgColor = '#fd7e14';
              darkColor = '#ca6510';
              accentColor = '#fd7e14';
              verdictText = 'TLE';
            } else if (event.verdict === 'RUNTIME_ERROR') {
              bgColor = '#6f42c1';
              darkColor = '#563396';
              accentColor = '#6f42c1';
              verdictText = 'RE';
            } else if (event.verdict === 'MEMORY_LIMIT_EXCEEDED') {
              bgColor = '#6f42c1';
              darkColor = '#563396';
              accentColor = '#6f42c1';
              verdictText = 'MLE';
            } else if (event.verdict === 'COMPILATION_ERROR') {
              bgColor = '#6c757d';
              darkColor = '#495057';
              accentColor = '#6c757d';
              verdictText = 'CE';
            }

            const stats = getTeamStats(handle);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, padding: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 18 }}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.03] text-white font-sans text-xs hover:bg-white/[0.02] transition-colors relative"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                {/* Team Rank */}
                <div className="w-5 text-right font-bold text-white/30 shrink-0">{stats.rank}</div>
                
                {/* Name */}
                <div className="flex-1 truncate pr-1">
                  <CFHandle 
                    handle={name} 
                    rating={mapped?.rating} 
                    rank={mapped?.rank} 
                  />
                </div>
                
                {/* Solved Count Badge */}
                <div className="text-[11px] font-bold text-white/40 bg-white/[0.03] border border-white/[0.05] w-5 h-5 rounded flex items-center justify-center shrink-0">
                  {stats.points}
                </div>
                
                {/* Problem Code block */}
                <div 
                  className="w-6 h-6 flex items-center justify-center text-[10px] font-extrabold rounded shadow-sm text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${darkColor} 100%)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  {event.problem.index}
                </div>
                
                {/* Verdict block */}
                <div 
                  className="w-10 h-6 flex items-center justify-center text-[9px] font-black rounded shadow-sm text-white shrink-0 uppercase tracking-wide"
                  style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${darkColor} 100%)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  {verdictText}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {recentEvents.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-6">
            <div className="relative w-8 h-8 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-white/5" />
              <div className="absolute inset-0 rounded-full border-2 border-t-red-500 animate-spin" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold">Waiting for broadcasts...</span>
          </div>
        )}
      </div>
    </div>
  );
}
