'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Lock, Unlock, Video, Trophy, Save, ChevronDown, ChevronUp,
  Loader2, BookOpen, GitBranch, User, Check, AlertCircle, Edit3, RotateCcw,
} from 'lucide-react';
import type { SessionData } from '@/types';
import { WEEK_DATES } from '@/lib/constants';
const DATES = [...WEEK_DATES];

const WEEK_ACCENTS = [
  { bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.25)',  text: '#60a5fa' },
  { bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa' },
  { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#34d399' },
  { bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.25)',  text: '#fb923c' },
  { bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.25)', text: '#f472b6' },
  { bg: 'rgba(34,211,238,0.10)',  border: 'rgba(34,211,238,0.25)',  text: '#22d3ee' },
  { bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.25)',  text: '#facc15' },
  { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', text: '#f87171' },
];

export function AdminSessionsClient() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<SessionData>>>({});

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setIsLoading(false));
  }, []);

  const getEdit = (id: string) => edits[id] ?? {};
  const setEdit = (id: string, patch: Partial<SessionData>) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const discardEdit = (id: string) =>
    setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });

  const handleSave = async (session: SessionData) => {
    const patch = edits[session._id];
    if (!patch || !Object.keys(patch).length) { toast.info('No changes to save'); return; }
    setSaving(session._id);
    try {
      const res = await fetch(`/api/sessions/${session.weekNumber}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setSessions(prev => prev.map(s => s._id === session._id ? { ...s, ...patch } : s));
      discardEdit(session._id);
      toast.success(`Week ${session.weekNumber} saved!`);
    } catch { toast.error('Failed to save.'); }
    finally { setSaving(null); }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shimmer" style={{ height: 76, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  const totalUnlocked = sessions.filter(s => s.isUnlocked).length;
  const totalContests = sessions.filter(s => s.isContestPosted).length;

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total',        value: sessions.length,      icon: '📅', color: '#60a5fa' },
          { label: 'Unlocked',     value: totalUnlocked,        icon: '🔓', color: '#34d399' },
          { label: 'Locked',       value: 8 - totalUnlocked,    icon: '🔒', color: '#f87171' },
          { label: 'Contests Done',value: totalContests,         icon: '🏆', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Session rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map(session => {
          const edit = getEdit(session._id);
          const isExp = expandedId === session._id;
          const changed = Object.keys(edit).length > 0;
          const isSaving = saving === session._id;

          const isUnlocked = edit.isUnlocked ?? session.isUnlocked;
          const isContestPosted = edit.isContestPosted ?? session.isContestPosted;
          const isRecordingAvailable = edit.isRecordingAvailable ?? session.isRecordingAvailable;
          const meetLink          = edit.meetLink ?? session.meetLink ?? '';
          const recordingLink     = edit.recordingLink ?? session.recordingLink ?? '';
          const mentorName        = edit.mentorName ?? session.mentorName ?? '';
          const cfContestLink     = edit.postContestData?.cfContestLink ?? session.postContestData?.cfContestLink ?? '';
          const editorialLink     = edit.postContestData?.editorialLink ?? session.postContestData?.editorialLink ?? '';
          const solutionsRepoLink = edit.postContestData?.solutionsRepoLink ?? session.postContestData?.solutionsRepoLink ?? '';
          const accent = WEEK_ACCENTS[(session.weekNumber - 1) % 8];

          return (
            <div key={session._id} style={{
              borderRadius: 14,
              border: `1px solid ${changed ? 'rgba(250,204,21,0.35)' : isUnlocked ? accent.border : 'rgba(255,255,255,0.07)'}`,
              background: changed ? 'rgba(250,204,21,0.02)' : 'rgba(255,255,255,0.02)',
              overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', flexWrap: 'wrap' }}>
                {/* Week badge */}
                <div style={{
                  width: 46, height: 46, borderRadius: 11, flexShrink: 0,
                  background: isUnlocked ? accent.bg : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isUnlocked ? accent.border : 'rgba(255,255,255,0.07)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isUnlocked ? accent.text : '#374151' }}>Wk</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: isUnlocked ? accent.text : '#374151' }}>{session.weekNumber}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.topic}
                    </span>
                    {changed && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.30)',
                        borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700, color: '#fbbf24',
                      }}>
                        <Edit3 style={{ width: 8, height: 8 }} /> unsaved
                      </span>
                    )}
                  </div>
                  {/* Date row */}
                  {(() => { const d = DATES[session.weekNumber - 1]; return d ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 5 }}>
                      <span style={{ color: '#374151', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        📅 Session: <strong style={{ color: '#4b5563' }}>{d.session}</strong>
                      </span>
                      <span style={{ color: '#374151', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        🏆 Contest: <strong style={{ color: accent.text, opacity: 0.8 }}>{d.contest}</strong>
                      </span>
                    </div>
                  ) : null; })()} 
                  {/* Toggles */}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {[
                      { id: `u-${session._id}`, checked: isUnlocked, onChange: (v: boolean) => setEdit(session._id, { isUnlocked: v }), label: isUnlocked ? 'Unlocked' : 'Locked', color: isUnlocked ? '#34d399' : '#6b7280', icon: isUnlocked ? '🔓' : '🔒' },
                      { id: `r-${session._id}`, checked: isRecordingAvailable, onChange: (v: boolean) => setEdit(session._id, { isRecordingAvailable: v }), label: 'Recording', color: '#f87171', icon: '📹' },
                      { id: `c-${session._id}`, checked: isContestPosted, onChange: (v: boolean) => setEdit(session._id, { isContestPosted: v }), label: 'Contest Done', color: '#fbbf24', icon: '🏆' },
                    ].map(t => (
                      <label key={t.id} htmlFor={t.id} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <Switch id={t.id} checked={t.checked} onCheckedChange={t.onChange} style={{ transform: 'scale(0.75)', transformOrigin: 'left center' }} />
                        <span style={{ fontSize: 11, color: t.checked ? t.color : '#374151' }}>{t.icon} {t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {changed && (
                    <>
                      <button onClick={() => discardEdit(session._id)} title="Discard"
                        style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#6b7280', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <RotateCcw style={{ width: 12, height: 12 }} />
                      </button>
                      <button onClick={() => handleSave(session)} disabled={isSaving}
                        style={{ padding: '7px 13px', borderRadius: 8, background: 'rgba(250,204,21,0.18)', border: '1px solid rgba(250,204,21,0.35)', color: '#fbbf24', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isSaving ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Save style={{ width: 12, height: 12 }} />}
                        {isSaving ? '…' : 'Save'}
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpandedId(isExp ? null : session._id)}
                    style={{ padding: '7px 12px', borderRadius: 8, background: isExp ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {isExp ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                    {isExp ? 'Close' : 'Edit'}
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {isExp && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)', padding: '20px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: User,     label: 'Mentor Name',      value: mentorName,      key: 'mentor',    accent: '#60a5fa', ph: 'e.g. Aryan Gupta',                    mono: false,
                        change: (v: string) => setEdit(session._id, { mentorName: v }) },
                      { icon: Video,    label: 'Google Meet Link',  value: meetLink,        key: 'meet',      accent: '#34d399', ph: 'https://meet.google.com/...',          mono: true,
                        change: (v: string) => setEdit(session._id, { meetLink: v }) },
                      { icon: Video,    label: 'Recording Link',    value: recordingLink,   key: 'rec',       accent: '#f87171', ph: 'https://youtube.com/...',              mono: true,
                        change: (v: string) => setEdit(session._id, { recordingLink: v }) },
                      { icon: Trophy,   label: 'CF Contest Link',   value: cfContestLink,   key: 'cf',        accent: '#fbbf24', ph: 'https://codeforces.com/contest/...',  mono: true,
                        change: (v: string) => setEdit(session._id, { postContestData: { cfContestLink: v, editorialLink, solutionsRepoLink } }) },
                      { icon: BookOpen, label: 'Editorial Link',    value: editorialLink,   key: 'editorial', accent: '#a78bfa', ph: 'https://codeforces.com/blog/...',     mono: true,
                        change: (v: string) => setEdit(session._id, { postContestData: { cfContestLink, editorialLink: v, solutionsRepoLink } }) },
                      { icon: GitBranch,label: 'Solutions Repo',    value: solutionsRepoLink, key: 'repo',   accent: '#94a3b8', ph: 'https://github.com/codeiiest/...',    mono: true,
                        change: (v: string) => setEdit(session._id, { postContestData: { cfContestLink, editorialLink, solutionsRepoLink: v } }) },
                    ].map(field => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, color: field.accent, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>
                            <Icon style={{ width: 12, height: 12 }} /> {field.label}
                          </label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={e => field.change(e.target.value)}
                            placeholder={field.ph}
                            style={{
                              width: '100%', padding: '10px 13px', boxSizing: 'border-box',
                              background: field.value ? `${field.accent}08` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${field.value ? `${field.accent}30` : 'rgba(255,255,255,0.09)'}`,
                              borderRadius: 9, color: '#fff', fontSize: 12,
                              fontFamily: field.mono ? 'monospace' : 'inherit',
                              outline: 'none', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => { e.target.style.borderColor = field.accent; e.target.style.boxShadow = `0 0 0 3px ${field.accent}18`; }}
                            onBlur={e => { e.target.style.borderColor = field.value ? `${field.accent}30` : 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Save bar */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: changed ? '#fbbf24' : '#34d399' }}>
                      {changed ? <AlertCircle style={{ width: 13, height: 13 }} /> : <Check style={{ width: 13, height: 13 }} />}
                      {changed ? 'Unsaved changes' : 'All saved'}
                    </span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {changed && (
                        <button onClick={() => discardEdit(session._id)}
                          style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <RotateCcw style={{ width: 13, height: 13 }} /> Discard
                        </button>
                      )}
                      <button onClick={() => handleSave(session)} disabled={isSaving || !changed}
                        style={{
                          padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: changed ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                          background: changed ? '#2563eb' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${changed ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                          color: changed ? '#fff' : '#374151',
                          boxShadow: changed ? '0 0 16px rgba(37,99,235,0.25)' : 'none',
                          opacity: isSaving ? 0.7 : 1,
                        }}>
                        {isSaving ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Save style={{ width: 13, height: 13 }} />}
                        {isSaving ? 'Saving…' : `Save Week ${session.weekNumber}`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .animate-spin{animation:spin 1s linear infinite}`}</style>
    </div>
  );
}
