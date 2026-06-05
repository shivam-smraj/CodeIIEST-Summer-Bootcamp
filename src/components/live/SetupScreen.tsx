'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodeiiestLogo } from '@/components/ui/codeiiest-logo';
import type { ContestMode, FilterMode, ScoreboardTheme } from './types';
import { Play, Zap, Users, Clock, Trophy, Activity, ChevronRight, Globe, Radio, Check, Sun, Moon } from 'lucide-react';

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
  theme: ScoreboardTheme;
  setTheme: (v: ScoreboardTheme) => void;
  error: string | null;
  isLoading: boolean;
  onStart: () => void;
}

const FEATURES = [
  { icon: Activity, label: 'ICPC-Style Leaderboard', desc: 'Animated standings with real-time rank changes', color: '#ef4444' },
  { icon: Zap, label: 'Replay Engine', desc: 'Re-run any contest at 1× – 200× speed', color: '#f59e0b' },
  { icon: Clock, label: 'Timeline Control', desc: 'Scrub to any moment in the contest', color: '#a78bfa' },
  { icon: Users, label: 'Student Filter', desc: 'Isolate registered Bootcamp participants', color: '#34d399' },
  { icon: Trophy, label: 'First-to-Solve', desc: 'Gold star on every problem\'s first AC', color: '#60a5fa' },
  { icon: Globe, label: 'CF Rating Colors', desc: 'Authentic Codeforces rank colors per handle', color: '#22d3ee' },
];

// Mini scoreboard row preview for the theme cards
function ICPCPreview() {
  return (
    <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #dee2e6', fontSize: 10, lineHeight: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', background: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', color: '#666', fontWeight: 700 }}>#</div>
        <div style={{ flex: 1, color: '#666', fontWeight: 700, paddingLeft: 6 }}>Team</div>
        <div style={{ width: 24, textAlign: 'center', color: '#666', fontWeight: 700 }}>Σ</div>
        {['A', 'B', 'C'].map(l => (
          <div key={l} style={{ width: 20, textAlign: 'center' }}>
            <div style={{ background: l === 'A' ? '#9e9e9e' : l === 'B' ? '#4caf50' : '#2196f3', color: '#fff', borderRadius: 3, fontSize: 8, fontWeight: 800, padding: '1px 0' }}>{l}</div>
          </div>
        ))}
      </div>
      {/* Gold row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#EEC710', borderBottom: '1px solid #dee2e6', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 11 }}>🥇</div>
        <div style={{ flex: 1, paddingLeft: 6, fontWeight: 700, color: '#000' }}>Peking Univ</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900 }}>10</div>
        <div style={{ width: 20, background: '#1DAA1D', textAlign: 'center', color: '#fff', fontWeight: 700, padding: '4px 0' }}>★</div>
        <div style={{ width: 20, background: '#60E760', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✓</div>
        <div style={{ width: 20, background: '#E87272', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✗</div>
      </div>
      {/* Silver row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#AAAAAA', borderBottom: '1px solid #dee2e6', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 11 }}>🥈</div>
        <div style={{ flex: 1, paddingLeft: 6, fontWeight: 700, color: '#000' }}>MIT</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900 }}>9</div>
        <div style={{ width: 20, background: '#60E760', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✓</div>
        <div style={{ width: 20, background: '#60E760', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✓</div>
        <div style={{ width: 20, padding: '4px 0' }} />
      </div>
      {/* Bronze row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#C08E55', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 11 }}>🥉</div>
        <div style={{ flex: 1, paddingLeft: 6, fontWeight: 700, color: '#000' }}>Oxford</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900 }}>9</div>
        <div style={{ width: 20, background: '#60E760', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✓</div>
        <div style={{ width: 20, padding: '4px 0' }} />
        <div style={{ width: 20, background: '#60E760', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>✓</div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div style={{ background: '#07080a', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', fontSize: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', background: '#0c0d11', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4px 0', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
        <div style={{ width: 28, textAlign: 'center' }}>#</div>
        <div style={{ flex: 1, paddingLeft: 6 }}>Team</div>
        <div style={{ width: 24, textAlign: 'center' }}>Σ</div>
        {['A', 'B', 'C'].map(l => (
          <div key={l} style={{ width: 20, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>{l}</div>
        ))}
      </div>
      {/* Gold row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#0a0b0e', borderLeft: '3px solid #fde047', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontSize: 11 }}>🥇</div>
        <div style={{ flex: 1, paddingLeft: 4, fontWeight: 700, color: '#e2e8f0', fontSize: 10 }}>tourist</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900, color: '#fff' }}>10</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#064e3b,#022c22)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>★</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#14532d,#0d3b20)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✓</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#7f1d1d,#450a0a)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✗</div>
      </div>
      {/* Silver row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#0c0d11', borderLeft: '3px solid #94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontSize: 11 }}>🥈</div>
        <div style={{ flex: 1, paddingLeft: 4, fontWeight: 700, color: '#e2e8f0', fontSize: 10 }}>Radewoosh</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900, color: '#fff' }}>9</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#14532d,#0d3b20)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✓</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#14532d,#0d3b20)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✓</div>
        <div style={{ width: 20, padding: '3px 0' }} />
      </div>
      {/* Bronze row */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#0a0b0e', borderLeft: '3px solid #cd7c3f', padding: '4px 0' }}>
        <div style={{ width: 28, textAlign: 'center', fontSize: 11 }}>🥉</div>
        <div style={{ flex: 1, paddingLeft: 4, fontWeight: 700, color: '#e2e8f0', fontSize: 10 }}>Um_nik</div>
        <div style={{ width: 24, textAlign: 'center', fontWeight: 900, color: '#fff' }}>9</div>
        <div style={{ width: 20, background: 'linear-gradient(160deg,#14532d,#0d3b20)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✓</div>
        <div style={{ width: 20, padding: '3px 0' }} />
        <div style={{ width: 20, background: 'linear-gradient(160deg,#14532d,#0d3b20)', textAlign: 'center', color: '#fff', fontSize: 8, padding: '3px 0' }}>✓</div>
      </div>
    </div>
  );
}

export function SetupScreen({
  contestId, setContestId,
  groupId, setGroupId,
  mode, setMode,
  speed, setSpeed,
  filter, setFilter,
  theme, setTheme,
  error, isLoading,
  onStart,
}: SetupScreenProps) {

  const modeOptions = [
    { label: '⏪  Replay Mode', value: 'replay' },
    { label: '🔴  Live Mode', value: 'live' },
  ];
  const speedOptions = [
    { label: '1×  (Real-time)', value: 1 },
    { label: '5×', value: 5 },
    { label: '10×  (Recommended)', value: 10 },
    { label: '20×', value: 20 },
    { label: '60×  (Fast)', value: 60 },
    { label: '200×  (Ultra)', value: 200 },
  ];
  const filterOptions = [
    { label: '🎓  Bootcamp Students Only', value: 'bootcamp' },
    { label: '🌐  All Contestants', value: 'all' },
  ];

  const btnActive = !isLoading && !!contestId;

  return (
    <div className="flex-1 min-h-screen bg-[#07080a] flex items-stretch overflow-hidden font-sans">



      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 relative overflow-y-auto bg-[#07080a]">

        {/* Subtle corner glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(220,38,38,0.07) 0%, transparent 60%)' }} />

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10 self-start">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CodeiiestLogo size="sm" />
          </div>
          <div>
            <p style={{ color: '#ef4444', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>CodeIIEST</p>
            <span style={{ color: '#fff', fontSize: 17, fontWeight: 900 }}>Summer Bootcamp</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[480px]"
        >
          {/* ── Form card ── */}
          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 22,
            padding: '32px 32px 28px',
            boxShadow: '0 28px 70px -16px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top accent line */}
            <div className="absolute top-0 left-10 right-10 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)' }} />

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Radio style={{ width: 13, height: 13, color: '#ef4444' }} />
                </div>
                <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em' }}>Configure Session</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 5 }}>Session Parameters</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.65 }}>Enter your Codeforces contest details to get started.</p>
            </div>

            <div className="space-y-5">

              {/* Contest ID */}
              <div className="space-y-2">
                <Label htmlFor="contestId" className="text-[#94a3b8] text-[13px] font-semibold flex items-center gap-1.5">
                  Contest ID <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="contestId"
                    value={contestId}
                    onChange={e => setContestId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && contestId && onStart()}
                    placeholder="e.g. 2232"
                    style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 46, borderRadius: 12, fontSize: 15, fontFamily: 'ui-monospace, monospace', paddingRight: 52 }}
                    className="placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-500/50 transition-all"
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>#ID</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.24)', fontSize: 11 }}>
                  codeforces.com/group/<span style={{ color: '#a78bfa' }}>GROUP</span>/contest/<span style={{ color: '#60a5fa' }}>XXXX</span>
                </p>
              </div>

              {/* Group ID */}
              <div className="space-y-2">
                <Label htmlFor="groupId" className="text-[#94a3b8] text-[13px] font-semibold flex justify-between items-center">
                  <span>Group ID</span>
                  <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 500 }}>optional</span>
                </Label>
                <Input
                  id="groupId"
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                  placeholder="e.g. P1htAKU3hf"
                  style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 46, borderRadius: 12, fontSize: 15, fontFamily: 'ui-monospace, monospace' }}
                  className="placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-500/50 transition-all"
                />
              </div>

              {/* Divider: Playback */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em' }}>Playback</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Mode + Speed */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[#94a3b8] text-[13px] font-semibold block">Mode</Label>
                  <Select value={mode} onValueChange={v => setMode(v as ContestMode)}>
                    <SelectTrigger style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 46, borderRadius: 12 }} className="focus:ring-2 focus:ring-red-500/40 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111115] border-white/[0.1] text-white">
                      {modeOptions.map(o => <SelectItem key={o.value} value={o.value} className="hover:bg-white/5 cursor-pointer text-white">{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94a3b8] text-[13px] font-semibold block">Speed</Label>
                  <Select value={String(speed)} onValueChange={v => setSpeed(Number(v))} disabled={mode === 'live'}>
                    <SelectTrigger style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 46, borderRadius: 12, opacity: mode === 'live' ? 0.42 : 1 }} className="focus:ring-2 focus:ring-red-500/40 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111115] border-white/[0.1] text-white">
                      {speedOptions.map(o => <SelectItem key={o.value} value={String(o.value)} className="hover:bg-white/5 cursor-pointer text-white">{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter */}
              <div className="space-y-2">
                <Label className="text-[#94a3b8] text-[13px] font-semibold block">Participant Filter</Label>
                <Select value={filter} onValueChange={v => setFilter(v as FilterMode)}>
                  <SelectTrigger style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', height: 46, borderRadius: 12 }} className="focus:ring-2 focus:ring-red-500/40 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111115] border-white/[0.1] text-white">
                    {filterOptions.map(o => <SelectItem key={o.value} value={o.value} className="hover:bg-white/5 cursor-pointer text-white">{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* ── THEME SELECTOR ── */}
              <div>
                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em' }}>Scoreboard Theme</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* ICPC Light Theme Card */}
                  <motion.button
                    onClick={() => setTheme('icpc')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '10px 10px 12px',
                      borderRadius: 14,
                      border: theme === 'icpc' ? '2px solid #3b82f6' : '2px solid rgba(255,255,255,0.08)',
                      background: theme === 'icpc' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    {theme === 'icpc' && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check style={{ width: 10, height: 10, color: '#fff' }} />
                      </div>
                    )}
                    <div className="mb-2.5">
                      <ICPCPreview />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Sun style={{ width: 11, height: 11, color: '#f59e0b' }} />
                      <span style={{ color: theme === 'icpc' ? '#93c5fd' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>ICPC Light</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 }}>Official ICPC style</p>
                  </motion.button>

                  {/* Dark Theme Card */}
                  <motion.button
                    onClick={() => setTheme('dark')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '10px 10px 12px',
                      borderRadius: 14,
                      border: theme === 'dark' ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.08)',
                      background: theme === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    {theme === 'dark' && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check style={{ width: 10, height: 10, color: '#fff' }} />
                      </div>
                    )}
                    <div className="mb-2.5">
                      <DarkPreview />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Moon style={{ width: 11, height: 11, color: '#a78bfa' }} />
                      <span style={{ color: theme === 'dark' ? '#fca5a5' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>Dark Mode</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 }}>Premium cinematic look</p>
                  </motion.button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12 }}
                    className="px-4 py-3 text-red-400 text-[13px] font-medium flex items-start gap-2.5 overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Launch button */}
              <div className="pt-1">
                <motion.button
                  onClick={onStart}
                  disabled={!btnActive}
                  whileHover={btnActive ? { scale: 1.015 } : {}}
                  whileTap={btnActive ? { scale: 0.985 } : {}}
                  style={{
                    width: '100%', height: 52, borderRadius: 14,
                    background: btnActive ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 60%, #991b1b 100%)' : 'rgba(255,255,255,0.05)',
                    color: btnActive ? '#fff' : 'rgba(255,255,255,0.28)',
                    border: btnActive ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: btnActive ? '0 8px 28px -6px rgba(220,38,38,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontWeight: 800, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: btnActive ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {btnActive && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 55%)', pointerEvents: 'none' }} />}
                  {isLoading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <Play style={{ width: 16, height: 16, fill: 'currentColor' }} />
                      <span>Launch Live Scoreboard</span>
                      <ChevronRight style={{ width: 16, height: 16, opacity: 0.55 }} />
                    </>
                  )}
                </motion.button>
              </div>

            </div>
          </div>

          {/* Keyboard hint */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 14 }}>
            Press <kbd style={{ margin: '0 4px', padding: '1px 7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, fontFamily: 'monospace', fontSize: 11 }}>Enter</kbd>
            to launch · <kbd style={{ margin: '0 4px', padding: '1px 7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, fontFamily: 'monospace', fontSize: 11 }}>Space</kbd> to pause
          </p>
        </motion.div>
      </div>
    </div>
  );
}
