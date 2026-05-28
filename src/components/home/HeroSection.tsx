'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

export function HeroSection() {
  const { data: session } = useSession();
  const user = session?.user;
  const isOnboarded = user?.isOnboardingComplete;

  useEffect(() => {
    fetch('/api/analytics', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.8 }} />

      {/* Glow blobs */}
      <div
        className="animate-pulse-slow"
        style={{
          position: 'absolute',
          top: -160, left: -160,
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'rgba(220,38,38,0.12)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="animate-pulse-slow"
        style={{
          position: 'absolute',
          bottom: -160, right: -160,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.08)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          animationDelay: '2s',
        }}
      />
      {/* Fade to dark at bottom */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, #09090b)', pointerEvents: 'none' }} />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: 100,
          paddingBottom: 80,
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 40,
              padding: '8px 20px',
              fontSize: 13,
              color: '#94a3b8',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
            8-Week Program · Starting June 1, 2026
          </span>
        </div>

        {/* CI+II logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="75" height="60" viewBox="0 0 621 495" fill="none">
            {/* Red "CI" mark */}
            <rect width="425" height="40" fill="#F60000"/>
            <rect x="110" y="60" width="315" height="40" fill="#FF0000"/>
            <rect x="165" y="400" width="260" height="40" fill="#F60000"/>
            <rect x="55" y="455" width="370" height="40" fill="#671616"/>
            <rect x="55" y="60" width="40" height="435" fill="#671616"/>
            <rect x="110" y="60" width="40" height="380" fill="#FF0000"/>
            <rect width="40" height="495" fill="#F60000"/>

            {/* Grey "II" mark */}
            <rect x="470" width="37" height="495" fill="#A6A6A6"/>
            <rect x="527" width="37" height="495" fill="#D9D9D9"/>
            <rect x="584" width="37" height="495" fill="#D9D9D9"/>
          </svg>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: 16,
          }}
        >
          CP &amp; DSA
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #f87171 0%, #dc2626 50%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Summer Bootcamp
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(15px, 2.5vw, 19px)',
            color: '#94a3b8',
            lineHeight: 1.7,
            maxWidth: 520,
            margin: '0 auto 36px',
          }}
        >
          A carefully structured 8-week journey from basics to advanced CP topics, designed
          to take you from newbie to expert. Only for{' '}
          <strong style={{ color: '#fff', fontWeight: 600 }}>IIEST Shibpur</strong> students.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: 12,
            marginBottom: 60,
          }}
        >
          {!user ? (
            <>
              <button
                onClick={() => signIn('google')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(220,38,38,0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                Sign in with Google →
              </button>
              <Link
                href="/leaderboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                🏆 View Leaderboard
              </Link>
            </>
          ) : !isOnboarded ? (
            <>
              <Link
                href="/onboarding"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(220,38,38,0.35)',
                }}
              >
                Complete Registration →
              </Link>
              <Link
                href="/leaderboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                🏆 Leaderboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/leaderboard"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(220,38,38,0.35)',
                }}
              >
                🏆 View Leaderboard →
              </Link>
              <Link
                href="/sessions"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                📅 Session Hub
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 28, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        animation: 'float 3s ease-in-out infinite',
      }}>
        <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }} />
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </div>
    </section>
  );
}
