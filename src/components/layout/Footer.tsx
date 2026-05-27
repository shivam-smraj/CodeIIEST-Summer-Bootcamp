'use client';

import Link from 'next/link';

function CILogoFooter() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32 }}>
      <svg width="24" height="32" viewBox="0 0 475 495" fill="none">
        <rect width="425" height="40" fill="#F60000"/>
        <rect x="110" y="60" width="315" height="40" fill="#FF0000"/>
        <rect x="165" y="400" width="260" height="40" fill="#F60000"/>
        <rect x="55" y="455" width="370" height="40" fill="#671616"/>
        <rect x="55" y="60" width="40" height="435" fill="#671616"/>
        <rect x="110" y="60" width="40" height="380" fill="#FF0000"/>
        <rect width="40" height="495" fill="#F60000"/>
      </svg>
      <svg width="11" height="32" viewBox="0 0 151 495" fill="none">
        <rect width="37" height="495" fill="#A6A6A6"/>
        <rect x="57" width="37" height="495" fill="#D9D9D9"/>
        <rect x="114" width="37" height="495" fill="#D9D9D9"/>
      </svg>
    </div>
  );
}

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/codeiiest/',
    label: 'Instagram',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/codeiiest',
    label: 'YouTube',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/company/gdg-iiest/posts/?feedView=all',
    label: 'LinkedIn',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    href: 'https://www.codeiiest.in/',
    label: 'Website',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    href: 'https://github.com/dsc-iiest/',
    label: 'GitHub',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
];

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/team', label: 'Team' },
  { href: '/profile', label: 'My Profile' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#06060a', position: 'relative' }}>
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: -1, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.5) 30%, rgba(220,38,38,0.5) 70%, transparent)',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 24px' }}>

        {/* ── Main row ─────────────────────────────────────────────────────── */}
        {/*
          Desktop: brand | navigate | follow us  (flex row, space-between)
          Mobile:  brand centered on first row,
                   then navigate + follow us side-by-side in a second row.
          Achieved with a two-level flex layout and CSS media queries embedded.
        */}
        <div className="footer-main" style={{ marginBottom: 28 }}>

          {/* Brand — centered on mobile, left-aligned on desktop */}
          <div className="footer-brand">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
              <CILogoFooter />
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>CodeIIEST</div>
                <div style={{ color: '#dc2626', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', marginTop: 1 }}>CP BOOTCAMP &apos;26</div>
              </div>
            </Link>
            <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.65, maxWidth: 220 }}>
              8-week CP &amp; DSA bootcamp for IIEST Shibpur students. Jun 01 – Jul 24, 2026.
            </p>
          </div>

          {/* Nav + Social — side by side on mobile, separate on desktop */}
          <div className="footer-links-row">
            {/* Navigate */}
            <div>
              <p style={{ color: '#9ca3af', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Navigate</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href}
                    style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}
                    className="footer-link">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <p style={{ color: '#9ca3af', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Follow Us</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {SOCIAL_LINKS.map(({ href, label, icon }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s', fontWeight: 500 }}
                    className="footer-link">
                    {icon}
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
        <div className="footer-bottom-bar" style={{
          borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 18,
          display: 'flex', flexWrap: 'wrap', gap: 8,
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p className="footer-bottom-text" style={{ color: '#4b5563', fontSize: 11 }}>
            © {year} CodeIIEST · Built by the CodeIIEST Dev Team
          </p>
          <div className="footer-bottom-credits" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#4b5563', fontSize: 11 }}>Made with</span>
            <span style={{ color: '#dc2626', fontSize: 13 }}>♥</span>
            <span style={{ color: '#4b5563', fontSize: 11 }}>by{' '}</span>
            <a
              href="https://www.linkedin.com/in/smraj0198/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', fontSize: 11, fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid rgba(96,165,250,0.40)', paddingBottom: 1, transition: 'color 0.15s, border-color 0.15s' }}
              className="footer-shivam-link"
            >
              Shivam
            </a>
            <span style={{ color: '#374151', fontSize: 11 }}>·</span>
            <a href="https://codeforces.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#4b5563', fontSize: 11, textDecoration: 'none', transition: 'color 0.15s' }}
              className="footer-link">
              Powered by Codeforces API
            </a>
          </div>
        </div>
      </div>

      <style>{`
        /* Hover states */
        .footer-link:hover { color: #e2e8f0 !important; }
        .footer-shivam-link:hover { color: #93c5fd !important; border-color: rgba(147,197,253,0.6) !important; }

        /* ── Desktop layout ── */
        .footer-main {
          display: flex;
          flex-wrap: wrap;
          gap: 28px 48px;
          align-items: flex-start;
          justify-content: space-between;
        }
        .footer-brand {
          text-align: left;
        }
        .footer-links-row {
          display: flex;
          gap: 48px;
          align-items: flex-start;
        }

        /* ── Mobile layout (≤ 640px) ── */
        @media (max-width: 640px) {
          .footer-main {
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .footer-brand {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-brand p {
            text-align: center;
          }
          .footer-links-row {
            /* Navigate + Follow Us side by side */
            display: flex;
            flex-direction: row;
            gap: 40px;
            justify-content: center;
            width: 100%;
          }
          .footer-bottom-bar {
            flex-direction: column;
            align-items: center;
            text-align: center;
            justify-content: center !important;
          }
          .footer-bottom-text {
            text-align: center !important;
            width: 100%;
          }
          .footer-bottom-credits {
            justify-content: center !important;
            width: 100%;
          }
        }
      `}</style>
    </footer>
  );
}
