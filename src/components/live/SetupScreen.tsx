'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from './CustomSelect';
import type { ContestMode, FilterMode } from './types';
import { Play, Zap, Users, Clock, Trophy, Radio, ChevronRight, Globe } from 'lucide-react';

interface SetupScreenProps {
  contestId: string;
  setContestId: (v: string) => void;
  groupId: string;
  setGroupId: (v: string) => void;
  mode: ContestMode;
  setMode: (v: ContestMode) => void;
  speed: number;
  setSpeed: (v: number) => void;
  filter: FilterMode;
  setFilter: (v: FilterMode) => void;
  error: string | null;
  isLoading: boolean;
  onStart: () => void;
}

// --- CodeIIEST SVG Logo as a component ---
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

// --- Live pulse dot ---
function PulseDot({ color = '#ef4444' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

const FEATURES = [
  { icon: Radio, label: 'ICPC-Style Broadcast', desc: 'Animated live scoreboard with real-time rank updates' },
  { icon: Zap, label: 'Replay Engine', desc: 'Replay any finished contest at 1x–200x speed' },
  { icon: Clock, label: 'Timeline Control', desc: 'Jump to any point in the contest timeline' },
  { icon: Users, label: 'Student Filter', desc: 'Show only registered Bootcamp students' },
  { icon: Trophy, label: 'First-to-Solve', desc: 'Highlighted "First AC" cells on every problem' },
  { icon: Globe, label: 'CF Rating Colors', desc: 'Authentic Codeforces rank colors per user' },
];

const FEATURE_COLORS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-sky-600'
];

export function SetupScreen({
  contestId, setContestId,
  groupId, setGroupId,
  mode, setMode,
  speed, setSpeed,
  filter, setFilter,
  error, isLoading,
  onStart
}: SetupScreenProps) {

  const [tick, setTick] = useState(0);

  // Subtle animated ticker in the background
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1500);
    return () => clearInterval(t);
  }, []);

  const modeOptions = [
    { label: '⏪  Replay Mode', value: 'replay' },
    { label: '🔴  Live Mode', value: 'live' }
  ];

  const speedOptions = [
    { label: '1x  (Real-time)', value: 1 },
    { label: '5x', value: 5 },
    { label: '10x  (Recommended)', value: 10 },
    { label: '20x', value: 20 },
    { label: '60x  (Fast)', value: 60 },
    { label: '200x  (Ultra)', value: 200 }
  ];

  const filterOptions = [
    { label: '🎓  Bootcamp Students Only', value: 'bootcamp' },
    { label: '🌐  All Contestants', value: 'all' }
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#07080a] flex items-stretch overflow-hidden font-sans">

      {/* ─── LEFT PANEL: branding + feature list ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-[#0a0b0e] border-r border-white/[0.05] px-12 py-14 relative overflow-hidden shrink-0">

        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient glows */}
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-50px] w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo + wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.08] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <CodeIIESTLogo className="w-10 h-8" />
            </div>
            <div>
              <p className="text-[11px] text-white/40 tracking-[0.25em] uppercase font-bold">CodeIIEST</p>
              <p className="text-white font-extrabold text-xl leading-tight tracking-wide">Summer Bootcamp</p>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4 tracking-tight"
          >
            ICPC Live<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-500">
              Leaderboard
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-white/50 text-sm xl:text-base leading-relaxed max-w-sm"
          >
            Broadcast cinematic, animated standings for any Codeforces contest — live or replay.
          </motion.p>
        </div>

        {/* Feature Pills */}
        <div className="relative z-10 space-y-3.5 my-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 group cursor-default"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${FEATURE_COLORS[i % FEATURE_COLORS.length]} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-bold leading-tight group-hover:text-white transition-colors">{f.label}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <div className="relative z-10 flex items-center gap-2.5 mt-4">
          <PulseDot color="#22c55e" />
          <span className="text-white/40 text-xs font-semibold uppercase tracking-wider">Engine ready</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: config form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-14 py-14 relative overflow-y-auto">
        
        {/* Glow effect on the form side */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[150px] pointer-events-none" />

        {/* Mobile logo header */}
        <div className="lg:hidden flex items-center gap-3 mb-10 self-start">
          <div className="p-1.5 bg-white/[0.03] rounded-lg border border-white/[0.08]">
            <CodeIIESTLogo className="w-8 h-6.5" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-bold">CodeIIEST</p>
            <span className="text-white font-black tracking-wide text-md">Summer Bootcamp</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Card Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <PulseDot color="#ef4444" />
              <span className="text-red-400 text-[11px] font-extrabold tracking-[0.2em] uppercase">Broadcast Console</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Configure Session</h2>
            <p className="text-white/40 text-sm mt-2">Enter your Codeforces contest details below to launch the live leaderboard.</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#0c0d11]/60 border border-white/[0.05] rounded-2xl p-8 backdrop-blur-xl space-y-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Inner glowing top accent border */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0" />

            {/* Contest ID */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <span>Contest ID</span>
                <span className="text-red-500 text-[10px]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contestId}
                  onChange={e => setContestId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && contestId && onStart()}
                  placeholder="e.g. 2232"
                  className="w-full bg-[#07080a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-white font-mono text-[15px] transition-all duration-300 focus:outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5 placeholder-white/10 pr-10 hover:border-white/10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-mono font-bold">#ID</div>
              </div>
            </div>

            {/* Group ID */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center justify-between">
                <span>Group ID</span>
                <span className="text-white/20 text-[9px] normal-case font-normal">optional — for private group contests</span>
              </label>
              <input
                type="text"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                placeholder="e.g. P1htAKU3hf"
                className="w-full bg-[#07080a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-white font-mono text-[15px] transition-all duration-300 focus:outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5 placeholder-white/10 hover:border-white/10"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/[0.05]" />
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.25em]">Playback Control</span>
              <div className="h-[1px] flex-1 bg-white/[0.05]" />
            </div>

            {/* Mode + Speed */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block">Mode</label>
                <CustomSelect options={modeOptions} value={mode} onChange={v => setMode(v as ContestMode)} />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block">Speed</label>
                <CustomSelect options={speedOptions} value={speed} onChange={v => setSpeed(v as number)} disabled={mode === 'live'} />
              </div>
            </div>

            {/* Filter */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] block">Participant Filter</label>
              <CustomSelect options={filterOptions} value={filter} onChange={v => setFilter(v as FilterMode)} />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Start Button */}
            <motion.button
              onClick={onStart}
              disabled={isLoading || !contestId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group text-[13px] tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.35)] active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Fetching contest data...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>Launch Broadcast</span>
                  <ChevronRight className="w-4 h-4 absolute right-5 group-hover:translate-x-1.5 transition-transform text-white/70" />
                </>
              )}
            </motion.button>
          </div>

          {/* Tips as alerts */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3.5 p-3.5 bg-white/[0.01] border border-white/[0.03] rounded-xl text-xs text-white/35 backdrop-blur-sm">
              <span className="bg-white/[0.04] border border-white/10 text-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase">Tip</span>
              <span className="leading-relaxed">For public Codeforces contests, leave Group ID empty. For private group contests (Bootcamp), enter the Group ID too.</span>
            </div>
            <div className="flex items-start gap-3.5 p-3.5 bg-white/[0.01] border border-white/[0.03] rounded-xl text-xs text-white/35 backdrop-blur-sm">
              <span className="bg-white/[0.04] border border-white/10 text-white/50 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase">Tip</span>
              <span className="leading-relaxed">Use Replay + <span className="font-mono text-white/50">10x</span> for the best cinematic experience. Press <span className="font-mono text-white/50">Space</span> to pause mid-broadcast.</span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
