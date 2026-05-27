'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  User,
  Zap,
  CheckCircle2,
  ChevronRight,
  Loader2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Your Profile', icon: User },
  { id: 2, label: 'CF Verification', icon: Zap },
  { id: 3, label: 'All Done!', icon: CheckCircle2 },
];

// ── Schemas ───────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay']),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// ── Component ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cfStatus, setCfStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [cfHandle, setCfHandle] = useState('');
  const [cfError, setCfError] = useState('');

  // Read CF OAuth callback params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // CF verification success
    if (params.get('cf_success') === 'true') {
      const handle = params.get('handle') ?? '';
      const rating = params.get('rating') ?? '0';
      setCfHandle(handle);
      setCfStatus('success');
      setStep(2); // Go to CF step to show success
      toast.success(`✅ CF handle @${handle} verified! Rating: ${rating}`);
      // Clean the URL
      window.history.replaceState({}, '', '/onboarding');
    }

    // CF verification error
    const cfErr = params.get('cf_error');
    if (cfErr) {
      const messages: Record<string, string> = {
        denied: 'You denied Codeforces authorization.',
        handle_taken: `Handle @${params.get('handle')} is already linked to another account.`,
        nonce_missing: 'Session expired. Please try again.',
        nonce_mismatch: 'Security check failed. Please try again.',
        token_exchange: 'Failed to exchange token with Codeforces. Please retry.',
        server_error: 'An unexpected error occurred.',
      };
      setCfError(messages[cfErr] ?? 'CF verification failed. Please try again.');
      setCfStatus('error');
      toast.error(messages[cfErr] ?? 'CF verification failed');
      window.history.replaceState({}, '', '/onboarding');
    }
  }, []);

  // ── Profile Form ──────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: session?.user?.name ?? '',
      gender: undefined,
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      toast.success('Profile saved!');
      setStep(2);
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Finish Onboarding ─────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnboardingComplete: true }),
      });

      // Update the session so middleware doesn't redirect again
      await update({ isOnboardingComplete: true });

      toast.success('Welcome to the bootcamp! 🚀');
      router.push('/');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm mb-4">
            <Zap className="w-4 h-4" />
            Let&apos;s get you set up
          </div>
          <h1 className="text-3xl font-bold text-white">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              CodeIIEST
            </span>
          </h1>
          <p className="text-slate-400 mt-2">Complete your profile to join the bootcamp</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {STEPS.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  step > id
                    ? 'bg-green-500 border-green-500 text-white'
                    : step === id
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-white/5 border-white/20 text-slate-600'
                )}
              >
                {step > id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  step === id ? 'text-white' : 'text-slate-600'
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <Progress value={progressValue} className="mb-8 h-1 bg-white/10" />

        {/* Step card */}
        <div className="glass rounded-2xl p-8 border border-white/10">

          {/* ── STEP 1: Profile ────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Your Profile</h2>
                <p className="text-slate-400 text-sm">
                  This is how you&apos;ll appear on the leaderboard.
                </p>
              </div>

              {/* Email (read-only, from Google) */}
              <div className="space-y-2">
                <Label className="text-slate-300">Institute Email</Label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-400 text-sm">
                  <span className="flex-1 truncate">{session?.user?.email}</span>
                  <span className="text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="displayName"
                  {...register('displayName')}
                  placeholder="How you appear on leaderboard"
                  className="bg-white/5 border-white/20 text-white placeholder:text-slate-600 focus:border-blue-500"
                />
                {errors.displayName && (
                  <p className="text-red-400 text-xs">{errors.displayName.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-slate-300">
                  Gender <span className="text-red-400">*</span>
                </Label>
                <Select onValueChange={(v) => setValue('gender', v as any)}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161616] border-white/10 text-white">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="PreferNotToSay">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-400 text-xs">{errors.gender.message}</p>
                )}
              </div>

              {/* Parsed IIEST data (display only) */}
              {session?.user?.email && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-1">
                  <p className="text-blue-400 text-xs font-medium mb-2">
                    Parsed from your email:
                  </p>
                  <div className="text-sm text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between">
                      <span>Roll ID</span>
                      <span className="text-white">
                        {session.user.email.split('@')[0].split('.')[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 h-11"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ── STEP 2: CF Verification ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  Codeforces Verification
                </h2>
                <p className="text-slate-400 text-sm">
                  Link your CF account for leaderboard scoring. Takes under 3 seconds.
                </p>
              </div>

              {/* Success state */}
              {cfStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold">Verified!</p>
                    <p className="text-slate-400 text-sm mt-1">
                      @{cfHandle} is now linked to your account permanently.
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {cfStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium">Verification Failed</p>
                    <p className="text-slate-400 text-xs mt-1">{cfError}</p>
                  </div>
                </div>
              )}

              {/* Idle / retry state */}
              {cfStatus !== 'success' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
                        1
                      </div>
                      <p className="text-slate-300 text-sm">Click the button below</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
                        2
                      </div>
                      <p className="text-slate-300 text-sm">
                        Authorize on codeforces.com
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
                        3
                      </div>
                      <p className="text-slate-300 text-sm">
                        You&apos;re automatically redirected back ✓
                      </p>
                    </div>
                  </div>

                  <a
                    href="/api/cf/start"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 text-orange-300 rounded-xl font-medium transition-all duration-200 group"
                  >
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Verify on Codeforces
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {cfStatus === 'success' ? (
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium gap-2 h-11"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="flex-1 border-white/20 text-slate-400 hover:text-white h-11"
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Done! ───────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              {/* Celebration */}
              <div className="py-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🚀</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Welcome to the CodeIIEST CP & DSA Summer Bootcamp 2026.
                  <br />
                  Sessions start on{' '}
                  <span className="text-blue-400 font-medium">June 1st, 2026</span>.
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Duration</p>
                  <p className="text-white font-semibold">8 Weeks</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Formula</p>
                  <p className="text-white font-semibold">Best 6 of 8</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Sessions</p>
                  <p className="text-white font-semibold">Every Sunday</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">Goal</p>
                  <p className="text-white font-semibold">Expert Rating</p>
                </div>
              </div>

              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium gap-2 h-12 text-base"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Enter the Bootcamp 🎯</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Only IIEST Shibpur students (@students.iiests.ac.in) can participate.
        </p>
      </div>
    </div>
  );
}
