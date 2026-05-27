'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  User, Zap, CheckCircle2, ChevronRight, Loader2,
  ExternalLink, AlertCircle, Shield, Trophy, Calendar,
  Star, ArrowRight,
} from 'lucide-react';

// ── Schemas ───────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(50).trim(),
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// ── CodeIIEST SVG Logo ─────────────────────────────────────────────────────
function CILogo({ size = 48 }: { size?: number }) {
  const s = size / 48;
  return (
    <svg width={size} height={Math.round(size * 1.167)} viewBox="0 0 48 56" fill="none">
      {/* CI red mark */}
      <rect x="0"   y="0"  width="48" height="4.5"  fill="#F60000" />
      <rect x="12"  y="7"  width="36" height="4.5"  fill="#FF2200" />
      <rect x="19"  y="45" width="29" height="4.5"  fill="#F60000" />
      <rect x="6"   y="51" width="42" height="4.5"  fill="#671616" />
      <rect x="6"   y="7"  width="4.5" height="49"  fill="#671616" />
      <rect x="12"  y="7"  width="4.5" height="43"  fill="#FF2200" />
      <rect x="0"   y="0"  width="4.5" height="56"  fill="#F60000" />
      {/* II grey mark */}
      <rect x="28"  y="0"  width="4"  height="56"   fill="#A6A6A6" />
      <rect x="35"  y="0"  width="4"  height="56"   fill="#D9D9D9" />
      <rect x="42"  y="0"  width="4"  height="56"   fill="#D9D9D9" />
    </svg>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Your Profile',       icon: User          },
  { id: 2, label: 'CF Verification',    icon: Zap           },
  { id: 3, label: 'All Done!',          icon: CheckCircle2  },
];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router  = useRouter();
  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cfStatus, setCfStatus]   = useState<'idle' | 'success' | 'error'>('idle');
  const [cfHandle, setCfHandle]   = useState('');
  const [cfRating, setCfRating]   = useState('');
  const [cfError,  setCfError]    = useState('');

  // Parse CF OAuth callback params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('cf_success') === 'true') {
      const h = p.get('handle') ?? '';
      const r = p.get('rating') ?? '0';
      setCfHandle(h); setCfRating(r); setCfStatus('success');
      setStep(2);
      toast.success(`@${h} verified! Rating: ${r}`);
      window.history.replaceState({}, '', '/onboarding');
    }
    const err = p.get('cf_error');
    if (err) {
      const msgs: Record<string, string> = {
        denied:        'You denied Codeforces authorization.',
        handle_taken:  `@${p.get('handle')} is already linked to another account.`,
        nonce_missing: 'Session expired. Please try again.',
        nonce_mismatch:'Security check failed. Please try again.',
        token_exchange:'Failed to exchange token. Please retry.',
        server_error:  'An unexpected error occurred.',
      };
      setCfError(msgs[err] ?? 'CF verification failed.');
      setCfStatus('error'); setStep(2);
      toast.error(msgs[err] ?? 'CF verification failed');
      window.history.replaceState({}, '', '/onboarding');
    }
  }, []);

  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: session?.user?.name ?? '', gender: undefined },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success('Profile saved!');
      setStep(2);
    } catch { toast.error('Failed to save profile. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnboardingComplete: true }),
      });
      await update({ isOnboardingComplete: true });
      toast.success('Welcome to the bootcamp! 🚀');
      router.push('/');
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const email   = session?.user?.email ?? '';
  const rollId  = email.split('@')[0].split('.')[0].toUpperCase();

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#09090b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Animated background ──────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Red glow — top left (CodeIIEST brand) */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(220,38,38,0.12), transparent 70%)',
          borderRadius: '50%',
        }} />
        {/* Blue glow — bottom right */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)',
          borderRadius: '50%',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        {/* ── Logo + heading ──────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center' }}>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 14, marginBottom: 20,
          }}>
            <CILogo size={44} />
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: 9, fontWeight: 800, color: '#ef4444',
                textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 1,
              }}>
                IIEST Shibpur
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                Code<span style={{ color: '#ef4444' }}>IIEST</span>
              </div>
            </div>
          </div>

          {/* Setup badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.20)',
            borderRadius: 30, padding: '5px 14px', marginBottom: 14,
          }}>
            <span style={{ fontSize: 11, color: '#ef4444' }}>⚡</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
              Let&apos;s get you set up
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>
            Welcome to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #dc2626 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              CodeIIEST
            </span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            CP &amp; DSA Bootcamp 2026 · Complete your profile to join
          </p>
        </div>

        {/* ── Step indicators ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
        }}>
          {STEPS.map(({ id, label, icon: Icon }, i) => {
            const done    = step > id;
            const active  = step === id;
            const color   = done ? '#22c55e' : active ? '#ef4444' : '#374151';
            const bg      = done ? 'rgba(34,197,94,0.12)' : active ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)';
            const border  = done ? 'rgba(34,197,94,0.35)' : active ? 'rgba(220,38,38,0.40)' : 'rgba(255,255,255,0.08)';
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: bg, border: `2px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: active ? `0 0 16px ${color}40` : 'none',
                  }}>
                    {done
                      ? <CheckCircle2 style={{ width: 18, height: 18, color: '#22c55e' }} />
                      : <Icon style={{ width: 16, height: 16, color }} />
                    }
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: active ? 700 : 500,
                    color: active ? '#fff' : done ? '#64748b' : '#374151',
                    whiteSpace: 'nowrap',
                  }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 64, height: 2, margin: '0 4px', marginBottom: 22,
                    background: step > id
                      ? 'linear-gradient(90deg, #22c55e, rgba(34,197,94,0.3))'
                      : 'rgba(255,255,255,0.06)',
                    borderRadius: 2, transition: 'background 0.4s ease',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Main card ───────────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20,
          overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          {/* Card top accent bar */}
          <div style={{
            height: 3,
            background: step === 1
              ? 'linear-gradient(90deg, #dc2626, #f97316)'
              : step === 2
                ? cfStatus === 'success'
                  ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                  : 'linear-gradient(90deg, #2563eb, #7c3aed)'
                : 'linear-gradient(90deg, #16a34a, #22c55e)',
          }} />

          <div style={{ padding: '28px 28px 24px' }}>

            {/* ══ STEP 1 — Profile ══════════════════════════════════════════ */}
            {step === 1 && (
              <form onSubmit={handleSubmit(onProfileSubmit)}>
                {/* Step header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User style={{ width: 18, height: 18, color: '#ef4444' }} />
                  </div>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Your Profile</h2>
                    <p style={{ color: '#64748b', fontSize: 12 }}>This is how you&apos;ll appear on the leaderboard.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Email (read-only) */}
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                      Institute Email
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '11px 14px',
                    }}>
                      <Shield style={{ width: 14, height: 14, color: '#22c55e', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: '#94a3b8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {email}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#22c55e',
                        background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)',
                        borderRadius: 20, padding: '2px 9px',
                      }}>
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label htmlFor="displayName" style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                      Display Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="displayName"
                      {...register('displayName')}
                      placeholder="How you appear on the leaderboard"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '11px 14px', borderRadius: 10, fontSize: 14,
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.displayName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)'}`,
                        color: '#fff', outline: 'none', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.10)'; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = errors.displayName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    {errors.displayName && (
                      <p style={{ color: '#f87171', fontSize: 11, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle style={{ width: 11, height: 11 }} /> {errors.displayName.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                      Gender <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Select onValueChange={(v) => setValue('gender', v as ProfileFormValues['gender'])}>
                      <SelectTrigger style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.gender ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.10)'}`,
                        borderRadius: 10, color: '#94a3b8', height: 44, fontSize: 14,
                      }}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.10)', color: '#fff', borderRadius: 10 }}>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p style={{ color: '#f87171', fontSize: 11, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle style={{ width: 11, height: 11 }} /> Please select a gender
                      </p>
                    )}
                  </div>

                  {/* Parsed data chip */}
                  {rollId && (
                    <div style={{
                      background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)',
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <p style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>
                        📧 Parsed from your email
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Roll ID</span>
                        <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{rollId}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '13px 20px', borderRadius: 12,
                      background: submitting ? 'rgba(220,38,38,0.4)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 4px 20px rgba(220,38,38,0.30)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {submitting
                      ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                      : <><span>Continue</span><ChevronRight style={{ width: 18, height: 18 }} /></>
                    }
                  </button>
                </div>
              </form>
            )}

            {/* ══ STEP 2 — CF Verification ══════════════════════════════════ */}
            {step === 2 && (
              <div>
                {/* Step header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap style={{ width: 18, height: 18, color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Codeforces Verification</h2>
                    <p style={{ color: '#64748b', fontSize: 12 }}>Link your CF account — takes under 3 seconds.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Success */}
                  {cfStatus === 'success' && (
                    <div style={{
                      background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                      borderRadius: 14, padding: '20px 18px', textAlign: 'center',
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'rgba(22,163,74,0.15)', border: '2px solid rgba(34,197,94,0.30)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                        boxShadow: '0 0 20px rgba(34,197,94,0.25)',
                      }}>
                        <CheckCircle2 style={{ width: 24, height: 24, color: '#22c55e' }} />
                      </div>
                      <p style={{ color: '#22c55e', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Verified! ✓</p>
                      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
                        <strong style={{ color: '#94a3b8' }}>@{cfHandle}</strong> is now permanently linked.
                      </p>
                      {cfRating && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.20)',
                          borderRadius: 20, padding: '4px 12px',
                        }}>
                          <Star style={{ width: 12, height: 12, color: '#fbbf24' }} />
                          <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>Rating: {cfRating}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {cfStatus === 'error' && (
                    <div style={{
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)',
                      borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12,
                    }}>
                      <AlertCircle style={{ width: 18, height: 18, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ color: '#f87171', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Verification Failed</p>
                        <p style={{ color: '#64748b', fontSize: 12 }}>{cfError}</p>
                      </div>
                    </div>
                  )}

                  {/* Idle / retry — show steps */}
                  {cfStatus !== 'success' && (
                    <div style={{
                      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                      {[
                        { n: 1, text: 'Click the button below' },
                        { n: 2, text: 'Authorize on codeforces.com' },
                        { n: 3, text: "You're redirected back automatically ✓" },
                      ].map(({ n, text }) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace',
                          }}>{n}</div>
                          <p style={{ color: '#cbd5e1', fontSize: 13 }}>{text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verify button */}
                  {cfStatus !== 'success' && (
                    <a href="/api/cf/start" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '13px 20px', borderRadius: 12, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                      border: '1px solid rgba(59,130,246,0.35)',
                      color: '#fff', fontSize: 15, fontWeight: 700,
                      boxShadow: '0 4px 20px rgba(37,99,235,0.30)',
                      transition: 'all 0.15s ease',
                    }}>
                      <Zap style={{ width: 17, height: 17 }} />
                      Verify on Codeforces
                      <ExternalLink style={{ width: 14, height: 14, opacity: 0.7 }} />
                    </a>
                  )}

                  {/* Continue / Skip */}
                  {cfStatus === 'success' ? (
                    <button
                      onClick={() => setStep(3)}
                      style={{
                        width: '100%', padding: '13px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 16px rgba(22,163,74,0.30)',
                      }}
                    >
                      Continue <ArrowRight style={{ width: 17, height: 17 }} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep(3)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                        color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      Skip for now
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 3 — All Done! ════════════════════════════════════════ */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                {/* Rocket */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(37,99,235,0.15))',
                  border: '2px solid rgba(220,38,38,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(220,38,38,0.20)',
                }}>
                  <span style={{ fontSize: 36 }}>🚀</span>
                </div>

                <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
                  You&apos;re all set!
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                  Welcome to the <strong style={{ color: '#e2e8f0' }}>CodeIIEST CP &amp; DSA Summer Bootcamp 2026</strong>.<br />
                  Sessions start on{' '}
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>June 1st, 2026</span>.
                </p>

                {/* Info cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, textAlign: 'left' }}>
                  {[
                    { icon: Calendar, label: 'Duration',  value: '8 Weeks',        color: '#60a5fa' },
                    { icon: Trophy,   label: 'Formula',   value: 'Best 6 of 8',    color: '#fbbf24' },
                    { icon: Zap,      label: 'Sessions',  value: 'Mon evenings',   color: '#a78bfa' },
                    { icon: Star,     label: 'Goal',      value: 'Expert Rating',  color: '#34d399' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <Icon style={{ width: 12, height: 12, color }} />
                        <span style={{ color: '#374151', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Enter button */}
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '14px 20px', borderRadius: 12,
                    background: submitting
                      ? 'rgba(220,38,38,0.4)'
                      : 'linear-gradient(135deg, #dc2626 0%, #9333ea 100%)',
                    border: 'none', color: '#fff', fontSize: 16, fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 6px 24px rgba(220,38,38,0.35)',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {submitting
                    ? <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                    : <><span>Enter the Bootcamp</span><span>🎯</span></>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <p style={{ textAlign: 'center', color: '#374151', fontSize: 11 }}>
          Only IIEST Shibpur students (@students.iiests.ac.in) can participate.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
