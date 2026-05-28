import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Live Codeforces-powered leaderboard for the CodeIIEST CP & DSA Summer Bootcamp 2026.',
};

export default function LeaderboardPage() {
  return (
    <MainLayout>
      {/* Page header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(to bottom, rgba(234,179,8,0.04), transparent)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 24px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(234,179,8,0.12)',
              border: '1px solid rgba(234,179,8,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              🏆
            </div>
            <div>
              <p style={{ color: '#eab308', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Live Rankings
              </p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                Leaderboard
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, marginLeft: 58 }}>
            Auto-updated from Codeforces after each weekly contest.{' '}
            <strong style={{ color: '#e2e8f0' }}>Best 6 of 8 rule.</strong>
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        <LeaderboardClient />
      </div>
    </MainLayout>
  );
}
