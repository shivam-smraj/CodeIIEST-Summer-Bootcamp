'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, CheckCircle2, XCircle, Shield, Users, ChevronLeft, ChevronRight, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEPARTMENT_MAP } from '@/lib/constants';

interface AdminUser {
  _id: string;
  displayName: string;
  email: string;
  rollId: string;
  batch: number;
  department: string;
  cfHandle?: string;
  cfRating?: number;
  cfRank?: string;
  isCfVerified: boolean;
  role: string;
  totalPoints: number;
  isOnboardingComplete: boolean;
  image?: string;
}

const ROLE_CONFIG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  superadmin: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', text: '#c4b5fd', label: 'Superadmin' },
  admin:      { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#93c5fd', label: 'Admin'      },
  user:       { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', text: '#64748b', label: 'User'     },
};

const CF_RANK_COLORS: Record<string, string> = {
  newbie: '#9e9e9e', pupil: '#4caf50', specialist: '#03a9f4',
  expert: '#1e88e5', 'candidate master': '#aa00ff',
  master: '#ff6d00', 'international master': '#ff3d00',
  grandmaster: '#f44336', 'legendary grandmaster': '#f44336',
};

interface AdminStats {
  total: number;
  verified: number;
  onboarded: number;
  admins: number;
  branchCounts: Record<string, number>;
}

export function AdminUsersClient({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [stats, setStats]         = useState<AdminStats>({
    total: 0,
    verified: 0,
    onboarded: 0,
    admins: 0,
    branchCounts: {},
  });
  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '20',
        role: selectedRole,
        branch: selectedBranch,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch { toast.error('Failed to load users'); }
    finally { setIsLoading(false); }
  }, [page, debouncedSearch, selectedRole, selectedBranch]);

  useEffect(() => { setPage(1); }, [debouncedSearch, selectedRole, selectedBranch]);
  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setChangingRole(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });
      if (!res.ok) throw new Error();
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
      void fetchUsers();
    } catch { toast.error('Failed to update role'); }
    finally { setChangingRole(null); }
  };

  const filtered = users;
  const verifiedCount  = stats.verified;
  const onboardedCount = stats.onboarded;

  return (
    <div>
      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total Users',   value: stats.total,     icon: '👥', color: '#60a5fa' },
          { label: 'CF Verified',   value: stats.verified,  icon: '✅', color: '#34d399' },
          { label: 'Onboarded',     value: stats.onboarded, icon: '🎓', color: '#a78bfa' },
          { label: 'Admins',        value: stats.admins,    icon: '🛡️', color: '#fbbf24' },
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

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#374151' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, roll ID or CF handle…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 12px 10px 36px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(96,165,250,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: 'all',        label: 'All',        color: '#94a3b8' },
            { value: 'user',       label: 'Users',      color: '#64748b' },
            { value: 'admin',      label: 'Admins',     color: '#93c5fd' },
            { value: 'superadmin', label: 'Superadmin', color: '#c4b5fd' },
          ].map(f => (
            <button key={f.value} onClick={() => setSelectedRole(f.value)}
              style={{
                padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: selectedRole === f.value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedRole === f.value ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.07)'}`,
                color: selectedRole === f.value ? f.color : '#374151',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button onClick={() => fetchUsers()}
          style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <RefreshCw style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* ── Branch Ribbon ────────────────────────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        overflowX: 'auto', 
        paddingBottom: 10, 
        marginBottom: 16,
        scrollbarWidth: 'thin',
      }} className="custom-scrollbar">
        <button
          onClick={() => setSelectedBranch('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            background: selectedBranch === 'all' ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${selectedBranch === 'all' ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: selectedBranch === 'all' ? '#60a5fa' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
        >
          All Branches <span style={{ fontSize: 10, background: selectedBranch === 'all' ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 10, color: selectedBranch === 'all' ? '#60a5fa' : '#4b5563' }}>{stats.total}</span>
        </button>
        {Object.entries(DEPARTMENT_MAP)
          .sort((a, b) => {
            const countA = stats.branchCounts[a[0].toUpperCase()] ?? 0;
            const countB = stats.branchCounts[b[0].toUpperCase()] ?? 0;
            return countB - countA;
          })
          .map(([code, name]) => {
            const count = stats.branchCounts[code.toUpperCase()] ?? 0;
            const isSelected = selectedBranch === code.toLowerCase();
          return (
            <button
              key={code}
              onClick={() => setSelectedBranch(isSelected ? 'all' : code.toLowerCase())}
              title={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: isSelected ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
                color: isSelected ? '#60a5fa' : '#64748b',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              {code} 
              <span style={{ 
                fontSize: 10, 
                background: isSelected ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.06)', 
                padding: '2px 6px', 
                borderRadius: 10,
                color: isSelected ? '#60a5fa' : '#4b5563',
                fontFamily: 'monospace',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p style={{ color: '#4b5563', fontSize: 12, marginBottom: 12 }}>
        Showing <strong style={{ color: '#fff' }}>{filtered.length}</strong> of <strong style={{ color: '#fff' }}>{total}</strong> users
      </p>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Desktop header */}
        <div className="users-desktop-header" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 130px 120px 80px 80px 100px',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {['User', 'Roll / Dept', 'CF Handle', 'Verified', 'Points', 'Role'].map((h, i) => (
            <div key={h} style={{ fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 58, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Users style={{ width: 36, height: 36, color: '#1f2937', margin: '0 auto 12px' }} />
            <p style={{ color: '#374151', fontWeight: 500 }}>No users found</p>
            <p style={{ color: '#1f2937', fontSize: 13, marginTop: 4 }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div>
            {filtered.map((user, idx) => {
              const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.user;
              const cfColor = CF_RANK_COLORS[(user.cfRank ?? '').toLowerCase()] ?? '#94a3b8';
              const isLast = idx === filtered.length - 1;

              return (
                <div key={user._id}>
                  {/* Desktop row */}
                  <div className="users-desktop-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 130px 120px 80px 80px 100px',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    {/* User info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                        <AvatarImage src={user.image ?? ''} referrerPolicy="no-referrer" />
                        <AvatarFallback style={{ background: 'linear-gradient(135deg,rgba(96,165,250,0.3),rgba(139,92,246,0.3))', color: '#c4b5fd', fontWeight: 700, fontSize: 13 }}>
                          {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.displayName}
                          </p>
                          {!user.isOnboardingComplete && (
                            <span style={{ fontSize: 10, color: '#fbbf24', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.20)', borderRadius: 10, padding: '1px 6px', flexShrink: 0 }}>
                              pending
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Roll / Dept */}
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginBottom: 2 }}>{user.rollId || '—'}</p>
                      <p style={{ color: '#374151', fontSize: 11 }}>{user.department || '—'}</p>
                    </div>

                    {/* CF Handle */}
                    <div>
                      {user.cfHandle ? (
                        <a href={`https://codeforces.com/profile/${user.cfHandle}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: cfColor, fontSize: 12, fontFamily: 'monospace', textDecoration: 'none' }}>
                          @{user.cfHandle}
                          <ExternalLink style={{ width: 10, height: 10, opacity: 0.5 }} />
                        </a>
                      ) : (
                        <span style={{ color: '#1f2937', fontSize: 12 }}>—</span>
                      )}
                      {user.cfRating && (
                        <p style={{ color: '#374151', fontSize: 10, marginTop: 2 }}>{user.cfRating} · {user.cfRank}</p>
                      )}
                    </div>

                    {/* Verified */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {user.isCfVerified
                        ? <CheckCircle2 style={{ width: 18, height: 18, color: '#34d399' }} />
                        : <XCircle style={{ width: 18, height: 18, color: 'rgba(239,68,68,0.4)' }} />}
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ color: user.totalPoints > 0 ? '#fff' : '#374151', fontWeight: 700, fontSize: 15, fontFamily: 'monospace' }}>
                        {user.totalPoints}
                      </span>
                    </div>

                    {/* Role */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {isSuperAdmin && user.role !== 'superadmin' ? (
                        <button
                          onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                          disabled={changingRole === user._id}
                          title={`Click to make ${user.role === 'admin' ? 'user' : 'admin'}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text,
                            opacity: changingRole === user._id ? 0.5 : 1, transition: 'all 0.15s',
                          }}
                        >
                          {(user.role === 'admin' || user.role === 'superadmin') && <Shield style={{ width: 10, height: 10 }} />}
                          {rc.label}
                        </button>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text }}>
                          {(user.role === 'admin' || user.role === 'superadmin') && <Shield style={{ width: 10, height: 10 }} />}
                          {rc.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="users-mobile-card"
                    style={{
                      display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <Avatar style={{ width: 44, height: 44, flexShrink: 0 }}>
                      <AvatarImage src={user.image ?? ''} referrerPolicy="no-referrer" />
                      <AvatarFallback style={{ background: 'linear-gradient(135deg,rgba(96,165,250,0.3),rgba(139,92,246,0.3))', color: '#c4b5fd', fontWeight: 700 }}>
                        {user.displayName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text, flexShrink: 0 }}>
                          {rc.label}
                        </span>
                      </div>
                      <p style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace' }}>{user.rollId || user.email}</p>
                      {user.cfHandle && (
                        <p style={{ color: cfColor, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>@{user.cfHandle} {user.cfRating ? `· ${user.cfRating}` : ''}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{user.totalPoints}</p>
                      <p style={{ color: '#374151', fontSize: 10 }}>pts</p>
                      <div style={{ marginTop: 4 }}>
                        {user.isCfVerified
                          ? <CheckCircle2 style={{ width: 14, height: 14, color: '#34d399' }} />
                          : <XCircle style={{ width: 14, height: 14, color: 'rgba(239,68,68,0.35)' }} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, opacity: page === 1 ? 0.3 : 1 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} /> Prev
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === p ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.07)'}`, background: page === p ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)', color: page === p ? '#60a5fa' : '#64748b', fontSize: 13, fontWeight: page === p ? 700 : 400, cursor: 'pointer' }}>
                  {p}
                </button>
              );
            })}
          </div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, opacity: page === totalPages ? 0.3 : 1 }}>
            Next <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .users-desktop-header { display: grid !important; }
          .users-desktop-row { display: grid !important; }
          .users-mobile-card { display: none !important; }
        }
        @media (max-width: 1023px) {
          .users-desktop-header { display: none !important; }
          .users-desktop-row { display: none !important; }
          .users-mobile-card { display: flex !important; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.12);
        }
      `}</style>
    </div>
  );
}
