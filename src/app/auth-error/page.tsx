'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  DomainRestricted:
    'Only IIEST Shibpur student emails (@students.iiests.ac.in) are allowed. Please sign in with your institutional G-Suite account.',
  DatabaseError:
    'We had trouble connecting to our servers. Please try again in a moment.',
  OAuthSignin: 'There was a problem connecting to Google. Please try again.',
  OAuthCallback: 'Google authentication failed. Please try again.',
  OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
  default: 'An unexpected error occurred during sign-in. Please try again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? 'default';
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-red-500/20">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <span className="text-3xl">⚠️</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Sign-in Error</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Domain hint */}
        {error === 'DomainRestricted' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-left">
            <p className="text-blue-400 text-xs font-mono">
              ✓ Correct format: <br />
              <span className="text-white">2024eeb109.shivam@students.iiests.ac.in</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            ← Back to Home
          </Link>
          <a
            href="/api/auth/signin"
            className="block w-full py-3 glass border border-white/10 hover:border-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </a>
        </div>

        {/* Error code */}
        <p className="text-slate-600 text-xs font-mono">Error code: {error}</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AuthErrorContent />
    </Suspense>
  );
}
