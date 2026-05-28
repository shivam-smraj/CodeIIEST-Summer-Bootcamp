'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Trophy, Users, CalendarDays,
  TerminalSquare, LogOut, ChevronRight, Shield, Menu, X, SlidersHorizontal,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin',          label: 'Dashboard',      icon: LayoutDashboard, exact: true },
  { href: '/admin/sync',     label: 'Sync Contest',   icon: TerminalSquare },
  { href: '/admin/scores',   label: 'Score Manager',  icon: SlidersHorizontal },
  { href: '/admin/contests', label: 'Contest Log',    icon: Trophy },
  { href: '/admin/sessions', label: 'Sessions CMS',  icon: CalendarDays },
  { href: '/admin/users',    label: 'Users',          icon: Users },
];

function CILogoSm() {
  return (
    <svg width="35" height="28" viewBox="0 0 621 495" fill="none" style={{ flexShrink: 0 }}>
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
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <Link href="/" onClick={() => setSidebarOpen(false)}
          style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <CILogoSm />
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>CodeIIEST</div>
            <div style={{ color:'#6b7280', fontSize:11, display:'flex', alignItems:'center', gap:4, marginTop:1 }}>
              <Shield style={{ width:10, height:10, color:'#a78bfa' }} />
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 12px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 12px',
                borderRadius:10,
                fontSize:13, fontWeight:500,
                textDecoration:'none',
                position:'relative',
                color: active ? '#c4b5fd' : '#94a3b8',
                background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                border: active ? '1px solid rgba(139,92,246,0.20)' : '1px solid transparent',
                transition:'all 0.15s ease',
              }}
            >
              {active && (
                <span style={{
                  position:'absolute', left:0, top:'50%',
                  transform:'translateY(-50%)',
                  width:2, height:20,
                  borderRadius:'0 2px 2px 0',
                  background:'#a78bfa',
                }} />
              )}
              <Icon style={{ width:15, height:15, flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
              {active && <ChevronRight style={{ width:12, height:12, opacity:0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px',
          background:'rgba(255,255,255,0.04)',
          borderRadius:10,
          marginBottom:8,
        }}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg,rgba(139,92,246,0.4),rgba(109,40,217,0.4))',
            border:'1px solid rgba(139,92,246,0.30)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#c4b5fd', fontSize:13, fontWeight:700, flexShrink:0,
          }}>
            {session?.user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ color:'#fff', fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {session?.user?.name}
            </p>
            <p style={{ color:'#6b7280', fontSize:11, textTransform:'capitalize' }}>
              {session?.user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:8,
            padding:'9px 12px', borderRadius:10, fontSize:13,
            color:'rgba(248,113,113,0.7)',
            background:'transparent', border:'1px solid transparent',
            cursor:'pointer', transition:'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.7)'; }}
        >
          <LogOut style={{ width:14, height:14 }} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#08080b', display:'flex' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width:240, flexShrink:0,
        borderRight:'1px solid rgba(255,255,255,0.07)',
        background:'#0a0a0d',
        position:'fixed', left:0, top:0, bottom:0,
        zIndex:40,
        display:'flex', flexDirection:'column',
      }}
        className="admin-sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:40,
            background:'rgba(0,0,0,0.65)',
            backdropFilter:'blur(4px)',
          }}
          className="admin-sidebar-overlay"
        />
      )}

      {/* Mobile sidebar */}
      <div
        className="admin-sidebar-mobile"
        style={{
          position:'fixed', left:0, top:0, bottom:0,
          width:256, zIndex:50,
          background:'#0a0a0d',
          borderRight:'1px solid rgba(255,255,255,0.08)',
          transition:'transform 0.3s ease',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          display:'flex', flexDirection:'column',
        }}
      >
        <SidebarContent />
      </div>

      {/* Main */}
      <main style={{ flex:1, minHeight:'100vh', display:'flex', flexDirection:'column' }} className="admin-main">
        {/* Mobile topbar */}
        <div
          className="admin-topbar"
          style={{
            display:'none',
            alignItems:'center', gap:12,
            padding:'0 16px', height:56,
            borderBottom:'1px solid rgba(255,255,255,0.07)',
            background:'rgba(10,10,13,0.96)',
            position:'sticky', top:0, zIndex:30,
            backdropFilter:'blur(12px)',
          }}
        >
          <button onClick={() => setSidebarOpen(true)}
            style={{ padding:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:8, cursor:'pointer', color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Menu style={{ width:18, height:18 }} />
          </button>
          <CILogoSm />
          <span style={{ color:'#fff', fontWeight:600, fontSize:14 }}>Admin</span>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ marginLeft:'auto', padding:6, background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}>
              <X style={{ width:18, height:18 }} />
            </button>
          )}
        </div>

        <div style={{ flex:1, padding:'32px' }} className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-sidebar-mobile  { display: none !important; }
          .admin-sidebar-overlay { display: none !important; }
          .admin-topbar          { display: none !important; }
          .admin-main            { margin-left: 240px; }
          .admin-content         { padding: 32px; }
        }
        @media (max-width: 1023px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-topbar          { display: flex !important; }
          .admin-main            { margin-left: 0; }
          .admin-content         { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}
