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

const ICPC_BG_DARK = '#242424';
const ICPC_BG_LIGHT = '#2c2c2c';
const ICPC_GREEN = '#26a65b';
const ICPC_DARK_GREEN = '#004d00';
const ICPC_GOLD = '#FAD000';
const ICPC_SILVER = '#D3D3D3';
const ICPC_BRONZE = '#CD7F32';

export function LiveTable({ scoreboard, problems, firstSolves, userMap }: LiveTableProps) {
  
  const getRankColor = (index: number) => {
    if (index === 0) return ICPC_GOLD;
    if (index === 1) return ICPC_SILVER;
    if (index === 2) return ICPC_BRONZE;
    return 'transparent';
  };
  
  const getRankTextColor = (index: number) => {
    if (index <= 2) return '#000000';
    return '#ffffff';
  };

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] relative">
      <div className="min-w-max w-full">
        
        {/* Table Header */}
        <div className="flex items-stretch bg-[#222] text-white text-xs font-bold uppercase sticky top-0 z-20 shadow-md">
          <div className="w-12 py-3 text-center">#</div>
          <div className="flex-1 min-w-[200px] py-3 px-4">Name</div>
          <div className="w-16 py-3 text-center">Σ</div>
          <div className="w-20 py-3 text-center">Penalty</div>
          <div className="flex">
            {problems.map(p => (
              <div key={p.index} className="w-14 py-3 text-center">
                {p.index}
              </div>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="relative">
          <AnimatePresence>
            {scoreboard.map((row, index) => {
              const isEven = index % 2 === 0;
              const rowBg = isEven ? ICPC_BG_LIGHT : ICPC_BG_DARK;
              const mapped = userMap[row.handle.toLowerCase()];
              
              return (
                <motion.div
                  key={row.handle}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="flex items-stretch absolute w-full border-b border-[#1a1a1a]"
                  style={{ top: index * 40, height: 40, backgroundColor: rowBg }}
                >
                  <div 
                    className="w-12 flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: getRankColor(index), color: getRankTextColor(index) }}
                  >
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-[200px] flex items-center px-4 overflow-hidden">
                    <div className="text-[14px] truncate">
                      <CFHandle 
                        handle={row.displayName} 
                        rating={mapped?.rating} 
                        rank={mapped?.rank} 
                      />
                    </div>
                  </div>
                  
                  <div className="w-16 flex items-center justify-center font-bold text-white text-[15px]">
                    {row.points}
                  </div>
                  <div className="w-20 flex items-center justify-center font-mono text-[#aaa] text-sm">
                    {row.penalty}
                  </div>
                  
                  <div className="flex">
                    {problems.map(p => {
                      const pr = row.problemResults[p.index];
                      
                      if (!pr) {
                        return <div key={p.index} className="w-14 border-l border-[#1a1a1a]" />;
                      }
                      
                      if (pr.isAC) {
                        const isFirst = pr.timeSeconds === firstSolves[p.index];
                        return (
                          <div 
                            key={p.index} 
                            className="w-14 border-l border-[#1a1a1a] flex flex-col items-center justify-center text-white"
                            style={{ backgroundColor: isFirst ? ICPC_DARK_GREEN : ICPC_GREEN }}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs">+{pr.attempts > 0 ? pr.attempts : ''}</span>
                            </div>
                            <span className="text-[10px] opacity-90">{Math.floor((pr.timeSeconds || 0)/60)}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div key={p.index} className="w-14 border-l border-[#1a1a1a] flex flex-col items-center justify-center bg-[#d91e18] text-white">
                            <span className="font-bold text-xs">-{pr.attempts}</span>
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
