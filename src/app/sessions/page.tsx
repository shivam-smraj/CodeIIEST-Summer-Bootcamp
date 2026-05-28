import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { SessionsClient } from '@/components/sessions/SessionsClient';

export const metadata: Metadata = {
  title: 'Sessions — CodeIIEST CP Bootcamp 2026',
  description: 'Weekly CP & DSA session resources, recordings, editorials, and contest links for the CodeIIEST Bootcamp 2026.',
};

export default function SessionsPage() {
  return (
    <MainLayout>
      {/* Page header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(to bottom, rgba(139,92,246,0.06), transparent)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              📅
            </div>
            <div>
              <p style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Weekly Sessions
              </p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                Session Hub
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, paddingLeft: 64, lineHeight: 1.6 }}>
            Resources, recordings, editorials, and contest links —{' '}
            <strong style={{ color: '#e2e8f0' }}>all in one place.</strong>
            <span style={{ color: '#374151', fontSize: 12, display: 'block', marginTop: 4 }}>
              Sessions: Mon evenings · Contests: Fri evenings · Jun 01 – Jul 24, 2026
            </span>
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        <SessionsClient />
      </div>
    </MainLayout>
  );
}
