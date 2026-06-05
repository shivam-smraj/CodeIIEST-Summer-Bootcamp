'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { CFContest, CFProblem, CFSubmission } from '@/types/codeforces';
import type { AppMode, ContestMode, FilterMode, UserMapInfo, ScoreRow } from './types';
import { SetupScreen } from './SetupScreen';
import { LiveHeader } from './LiveHeader';
import { LiveTable } from './LiveTable';
import { LiveQueue } from './LiveQueue';

export default function LiveEngine() {
  const [appMode, setAppMode] = useState<AppMode>('setup');
  const [contestId, setContestId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [mode, setMode] = useState<ContestMode>('replay');
  const [speed, setSpeed] = useState<number>(10);
  const [filter, setFilter] = useState<FilterMode>('bootcamp');
  
  const [contest, setContest] = useState<CFContest | null>(null);
  const [problems, setProblems] = useState<CFProblem[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserMapInfo>>({});
  const [submissions, setSubmissions] = useState<CFSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/live/init?contestId=${contestId}`;
      if (groupId) url += `&groupId=${groupId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setContest(data.contest);
      setProblems(data.problems);
      setUserMap(data.userMap);

      let sUrl = `/api/live/status?contestId=${contestId}`;
      if (groupId) sUrl += `&groupId=${groupId}`;
      const sRes = await fetch(sUrl);
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData.error);
      
      setSubmissions(sData.submissions);
      setCurrentTime(0);
      setAppMode('playing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (appMode !== 'playing' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (mode === 'replay') {
      const TICK_MS = 100;
      const increment = speed * (TICK_MS / 1000); 
      
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + increment;
          if (contest?.durationSeconds && next >= contest.durationSeconds) {
            setAppMode('finished');
            return contest.durationSeconds;
          }
          return next;
        });
      }, TICK_MS);
    } else {
      timerRef.current = setInterval(() => {
        setCurrentTime(Math.floor(Date.now() / 1000) - (contest?.startTimeSeconds || 0));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appMode, isPaused, mode, speed, contest]);

  const { scoreboard, recentEvents, firstSolves } = useMemo(() => {
    if (!contest) return { scoreboard: [], recentEvents: [], firstSolves: {} as Record<string, number> };
    
    const validSubs = submissions.filter(s => s.relativeTimeSeconds <= currentTime);
    
    // Sort chronologically for processing
    const chronoSubs = [...validSubs].sort((a, b) => a.relativeTimeSeconds - b.relativeTimeSeconds);

    const rows = new Map<string, ScoreRow>();
    const firstAcTime: Record<string, number> = {};

    for (const sub of chronoSubs) {
      if (sub.verdict === 'COMPILATION_ERROR' || sub.verdict === 'TESTING' || !sub.verdict) continue;
      
      const handle = sub.author.members[0].handle;
      const lowerHandle = handle.toLowerCase();
      
      const mapped = userMap[lowerHandle];
      if (filter === 'bootcamp' && !mapped) continue;

      if (!rows.has(handle)) {
        rows.set(handle, {
          handle,
          displayName: mapped ? mapped.firstName : handle,
          isBootcamp: !!mapped,
          points: 0,
          penalty: 0,
          problemResults: {}
        });
      }
      
      const row = rows.get(handle)!;
      const pIdx = sub.problem.index;
      
      if (!row.problemResults[pIdx]) {
        row.problemResults[pIdx] = { isAC: false, attempts: 0, timeSeconds: null, penalty: 0 };
      }
      
      const pr = row.problemResults[pIdx];
      
      if (pr.isAC) continue; // already solved
      
      if (sub.verdict === 'OK') {
        pr.isAC = true;
        pr.timeSeconds = sub.relativeTimeSeconds;
        pr.penalty = pr.attempts * 20; 
        
        row.points += 1;
        row.penalty += Math.floor(pr.timeSeconds / 60) + pr.penalty;

        if (!(pIdx in firstAcTime)) {
          firstAcTime[pIdx] = pr.timeSeconds;
        }
      } else {
        pr.attempts += 1;
      }
    }

    const sorted = Array.from(rows.values()).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      return a.penalty - b.penalty; 
    });

    const visibleFeed = validSubs
      .filter(s => s.verdict !== 'TESTING' && s.verdict !== undefined)
      .filter(s => {
        if (filter === 'all') return true;
        const handle = s.author.members[0].handle.toLowerCase();
        return !!userMap[handle];
      })
      .slice(-18)
      .reverse();

    return { scoreboard: sorted, recentEvents: visibleFeed, firstSolves: firstAcTime };
  }, [submissions, currentTime, userMap, filter, contest]);


  if (appMode === 'setup') {
    return (
      <SetupScreen
        contestId={contestId} setContestId={setContestId}
        groupId={groupId} setGroupId={setGroupId}
        mode={mode} setMode={setMode}
        speed={speed} setSpeed={setSpeed}
        filter={filter} setFilter={setFilter}
        error={error} isLoading={isLoading}
        onStart={fetchInit}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0d0d0d] font-sans selection:bg-white/20">
      <LiveHeader 
        contest={contest}
        mode={mode}
        speed={speed}
        setSpeed={setSpeed}
        currentTime={currentTime}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        onSetup={() => { setAppMode('setup'); setSubmissions([]); }}
      />

      {mode === 'replay' && contest?.durationSeconds && (
        <div className="h-1 w-full bg-[#111] relative cursor-pointer group shrink-0">
          <input 
            type="range"
            min={0}
            max={contest.durationSeconds}
            value={currentTime}
            onChange={e => setCurrentTime(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="h-full bg-white transition-all"
            style={{ width: `${(currentTime / contest.durationSeconds) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <LiveTable 
          scoreboard={scoreboard} 
          problems={problems} 
          firstSolves={firstSolves} 
          userMap={userMap} 
        />
        <LiveQueue 
          recentEvents={recentEvents} 
          userMap={userMap} 
          scoreboard={scoreboard} 
        />
      </div>
    </div>
  );
}
