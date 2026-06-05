import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CFSubmission } from '@/types/codeforces';
import type { UserMapInfo, ScoreRow } from './types';

interface LiveQueueProps {
  recentEvents: CFSubmission[];
  userMap: Record<string, UserMapInfo>;
  scoreboard: ScoreRow[];
}

const ICPC_GREEN = '#26a65b';
const ICPC_RED = '#d91e18';
const ICPC_QUEUE_BG = '#5d8ec7';

export function LiveQueue({ recentEvents, userMap, scoreboard }: LiveQueueProps) {
  
  const getTeamStats = (handle: string) => {
    const idx = scoreboard.findIndex(r => r.handle === handle);
    if (idx === -1) return { rank: '-', points: '-' };
    return { rank: idx + 1, points: scoreboard[idx].points };
  };

  return (
    <div className="w-80 border-l border-[#333] flex flex-col z-20 shrink-0" style={{ backgroundColor: ICPC_QUEUE_BG }}>
      <div className="px-4 py-3 border-b border-black/10">
        <h3 className="font-bold text-xl text-white">Queue</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnimatePresence initial={false}>
          {recentEvents.map(event => {
            const handle = event.author.members[0].handle;
            const mapped = userMap[handle.toLowerCase()];
            const name = mapped ? mapped.firstName : handle;
            const isAC = event.verdict === 'OK';
            
            let bgColor = '#444';
            let verdictText = '??';
            
            if (isAC) {
              bgColor = ICPC_GREEN;
              verdictText = 'AC';
            } else if (event.verdict === 'WRONG_ANSWER') {
              bgColor = ICPC_RED;
              verdictText = 'WA';
            } else if (event.verdict === 'TIME_LIMIT_EXCEEDED') {
              bgColor = ICPC_RED;
              verdictText = 'TLE';
            } else if (event.verdict === 'RUNTIME_ERROR') {
              bgColor = ICPC_RED;
              verdictText = 'RE';
            } else if (event.verdict === 'MEMORY_LIMIT_EXCEEDED') {
              bgColor = ICPC_RED;
              verdictText = 'MLE';
            } else if (event.verdict === 'COMPILATION_ERROR') {
              bgColor = '#666';
              verdictText = 'CE';
            }

            const stats = getTeamStats(handle);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, border: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 text-white font-sans text-sm"
              >
                {/* Rank */}
                <div className="w-6 text-right opacity-80 text-xs shrink-0">{stats.rank}</div>
                
                {/* Name */}
                <div className="flex-1 truncate">{name}</div>
                
                {/* Solved Count */}
                <div className="w-4 text-right opacity-80 text-xs shrink-0 mr-1">{stats.points}</div>
                
                {/* Problem Block */}
                <div 
                  className="w-5 h-5 flex items-center justify-center text-[11px] font-bold rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: bgColor }}
                >
                  {event.problem.index}
                </div>
                
                {/* Verdict Block */}
                <div 
                  className="w-7 h-5 flex items-center justify-center text-[10px] font-bold rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: bgColor }}
                >
                  {verdictText}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {recentEvents.length === 0 && (
          <div className="text-center text-white/50 text-sm mt-10">
            Waiting for submissions...
          </div>
        )}
      </div>
    </div>
  );
}
