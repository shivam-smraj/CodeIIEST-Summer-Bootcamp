import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CFProblem } from '@/types/codeforces';
import type { ScoreRow, UserMapInfo } from './types';
import { CFHandle } from './CFHandle';

interface LiveTableProps {
  scoreboard: ScoreRow[];
  problems: CFProblem[];
  firstSolves: Record<string, number>;
  userMap: Record<string, UserMapInfo>;
}

// Premium color palettes
const ROW_BG_DARK = '#0a0b0e';
const ROW_BG_LIGHT = '#0e0f13';
const BORDER_COLOR = 'rgba(255,255,255,0.03)';

export function LiveTable({ scoreboard, problems, firstSolves, userMap }: LiveTableProps) {
  
  const getRankBadgeStyle = (index: number) => {
    if (index === 0) {
      return {
        background: 'linear-gradient(135deg, #fde047 0%, #eab308 50%, #ca8a04 100%)',
        color: '#000000',
        textShadow: '0 1px 1px rgba(255,255,255,0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)'
      };
    }
    if (index === 1) {
      return {
        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
        color: '#000000',
        textShadow: '0 1px 1px rgba(255,255,255,0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)'
      };
    }
    if (index === 2) {
      return {
        background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        color: '#ffffff',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)'
      };
    }
    return {
      background: 'transparent',
      color: '#ffffff'
    };
  };

  return (
    <div className="flex-1 overflow-auto bg-[#07080a] relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="min-w-max w-full">
        
        {/* Table Header */}
        <div className="flex items-stretch bg-[#0c0d11] text-white/50 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-20 shadow-[0_4px_16px_rgba(0,0,0,0.4)] border-b border-white/[0.05]">
          <div className="w-12 py-4 text-center">#</div>
          <div className="flex-1 min-w-[220px] py-4 px-5">Contestant</div>
          <div className="w-16 py-4 text-center border-l border-white/[0.03]">Σ</div>
          <div className="w-20 py-4 text-center border-l border-white/[0.03]">Penalty</div>
          <div className="flex border-l border-white/[0.03]">
            {problems.map(p => (
              <div key={p.index} className="w-14 py-4 text-center relative group/tooltip cursor-help hover:text-white transition-colors">
                {p.index}
                {/* Custom Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-[#0e0f13] border border-white/[0.08] text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] whitespace-nowrap z-50 font-semibold tracking-wide normal-case">
                  {p.index}. {p.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="relative">
          <AnimatePresence>
            {scoreboard.map((row, index) => {
              const isEven = index % 2 === 0;
              const rowBg = isEven ? ROW_BG_LIGHT : ROW_BG_DARK;
              const mapped = userMap[row.handle.toLowerCase()];
              
              return (
                <motion.div
                  key={row.handle}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                  className="flex items-stretch absolute w-full border-b group"
                  style={{ top: index * 40, height: 40, backgroundColor: rowBg, borderColor: BORDER_COLOR }}
                >
                  {/* Rank Cell */}
                  <div 
                    className="w-12 flex items-center justify-center font-bold text-xs"
                    style={getRankBadgeStyle(index)}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Display Name */}
                  <div className="flex-1 min-w-[220px] flex items-center px-5 overflow-hidden transition-colors group-hover:bg-white/[0.01]">
                    <div className="text-[13px] truncate">
                      <CFHandle 
                        handle={row.displayName} 
                        rating={mapped?.rating} 
                        rank={mapped?.rank} 
                      />
                    </div>
                  </div>
                  
                  {/* Solved Count */}
                  <div className="w-16 flex items-center justify-center font-black text-white text-[14px] border-l border-white/[0.02] group-hover:bg-white/[0.01]">
                    {row.points}
                  </div>

                  {/* Penalty */}
                  <div className="w-20 flex items-center justify-center font-mono text-white/40 text-xs border-l border-white/[0.02] group-hover:bg-white/[0.01]">
                    {row.penalty}
                  </div>
                  
                  {/* Problem Results */}
                  <div className="flex border-l border-white/[0.02]">
                    {problems.map(p => {
                      const pr = row.problemResults[p.index];
                      
                      if (!pr) {
                        return <div key={p.index} className="w-14 border-l border-white/[0.02] group-hover:bg-white/[0.01]" />;
                      }
                      
                      if (pr.isAC) {
                        const isFirst = pr.timeSeconds === firstSolves[p.index];
                        return (
                          <div 
                            key={p.index} 
                            className="w-14 border-l border-white/[0.02] flex flex-col items-center justify-center text-white"
                            style={{ 
                              background: isFirst 
                                ? 'linear-gradient(135deg, #0f5132 0%, #003c00 100%)' 
                                : 'linear-gradient(135deg, #198754 0%, #146c43 100%)',
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                              border: isFirst ? '1px solid rgba(234,179,8,0.2)' : 'none'
                            }}
                          >
                            <div className="flex items-center gap-0.5">
                              <span className="font-extrabold text-[11px]">+{pr.attempts > 0 ? pr.attempts : ''}</span>
                              {isFirst && (
                                <svg className="w-2.5 h-2.5 text-yellow-400 fill-current shrink-0 animate-pulse" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[9px] text-white/75 font-semibold mt-0.5">{Math.floor((pr.timeSeconds || 0)/60)}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div 
                            key={p.index} 
                            className="w-14 border-l border-white/[0.02] flex flex-col items-center justify-center text-white"
                            style={{ 
                              background: 'linear-gradient(135deg, #a71d1d 0%, #821010 100%)',
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <span className="font-extrabold text-[11px] text-white/90">-{pr.attempts}</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Spacer for absolute positioned rows */}
        <div style={{ height: scoreboard.length * 40 }} />
      </div>
    </div>
  );
}
