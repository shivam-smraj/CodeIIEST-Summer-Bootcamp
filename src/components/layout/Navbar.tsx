'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Menu, X, LogIn, LogOut, User, Shield, LayoutDashboard } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/sessions',    label: 'Sessions' },
  { href: '/team',        label: 'Team' },
];

/* Inline CodeIIEST mark — tiny version for navbar */
function CILogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 30, flexShrink: 0 }}>
      {/* Red CI */}
      <svg width="22" height="30" viewBox="0 0 475 495" fill="none">
        <rect width="425" height="40" fill="#F60000"/>
        <rect x="110" y="60" width="315" height="40" fill="#FF0000"/>
        <rect x="165" y="400" width="260" height="40" fill="#F60000"/>
        <rect x="55" y="455" width="370" height="40" fill="#671616"/>
        <rect x="55" y="60" width="40" height="435" fill="#671616"/>
        <rect x="110" y="60" width="40" height="380" fill="#FF0000"/>
        <rect width="40" height="495" fill="#F60000"/>
      </svg>
      {/* Grey II */}
      <svg width="10" height="30" viewBox="0 0 151 495" fill="none">
        <rect width="37" height="495" fill="#A6A6A6"/>
        <rect x="57" width="37" height="495" fill="#D9D9D9"/>
        <rect x="114" width="37" height="495" fill="#D9D9D9"/>
      </svg>
    </div>
  );
}

export function Navbar() {
  const pathname  = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const user    = session?.user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Main bar ──────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          height: 64,
          background: scrolled || mobileOpen
            ? 'rgba(9,9,11,0.96)'
            : 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          transition: 'background 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <CILogo />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
                CodeIIEST
              </span>
              <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 500, marginTop: 2 }}>
                CP Bootcamp&apos;26
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────────── */}
          <div
            className="nav-desktop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  color: isActive(href) ? '#fff' : '#94a3b8',
                  background: isActive(href) ? 'rgba(255,255,255,0.08)' : 'transparent',
                  position: 'relative',
                }}
              >
                {label}
                {isActive(href) && (
                  <span
                    style={{
                      position: 'absolute', bottom: 4, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#dc2626',
                      display: 'block',
                    }}
                  />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname.startsWith('/admin') ? '#c4b5fd' : '#94a3b8',
                  background: pathname.startsWith('/admin') ? 'rgba(139,92,246,0.12)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Shield style={{ width: 14, height: 14 }} />
                Admin
              </Link>
            )}
          </div>

          {/* ── Right: auth + hamburger ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {status === 'loading' ? (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 12,
                      padding: '6px 12px 6px 6px',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <Avatar style={{ width: 28, height: 28 }}>
                      <AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
                      <AvatarFallback style={{ background: 'linear-gradient(135deg,#dc2626,#9f1239)', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                        {user.name?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      className="hidden-mobile">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  style={{
                    width: 240,
                    background: '#111113',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 14,
                    padding: 6,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  <DropdownMenuLabel style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar style={{ width: 40, height: 40 }}>
                        <AvatarImage src={user.image ?? ''} />
                        <AvatarFallback style={{ background: 'linear-gradient(135deg,#dc2626,#9f1239)', color: '#fff', fontWeight: 700 }}>
                          {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        {user.role !== 'user' && (
                          <span style={{ display: 'inline-block', marginTop: 4, padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="dropdown-item">
                      <User style={{ width: 15, height: 15 }} /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="dropdown-item" style={{ color: '#a78bfa' }}>
                        <LayoutDashboard style={{ width: 15, height: 15 }} /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="dropdown-item"
                    style={{ color: '#f87171', cursor: 'pointer' }}
                  >
                    <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => signIn('google')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <LogIn style={{ width: 14, height: 14 }} />
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="hamburger-btn"
              aria-label="Toggle menu"
              style={{
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 9,
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64, left: 0, right: 0,
            zIndex: 49,
            background: 'rgba(9,9,11,0.98)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px 16px',
          }}
          className="mobile-menu"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                marginBottom: 4,
                color: isActive(href) ? '#fff' : '#94a3b8',
                background: isActive(href) ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderLeft: isActive(href) ? '2px solid #dc2626' : '2px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 12,
              fontSize: 15, fontWeight: 500,
              textDecoration: 'none', marginBottom: 4,
              color: '#a78bfa',
              background: 'rgba(139,92,246,0.08)',
              borderLeft: '2px solid rgba(139,92,246,0.4)',
            }}>
              <Shield style={{ width: 16, height: 16 }} />
              Admin Panel
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .hidden-mobile { display: none !important; }
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          color: #cbd5e1;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          width: 100%;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
      `}</style>
    </>
  );
}
