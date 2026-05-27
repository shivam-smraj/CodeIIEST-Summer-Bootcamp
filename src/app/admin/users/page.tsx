import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import type { Metadata } from 'next';
import { auth } from '@root/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Users — Admin', robots: { index: false } };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) redirect('/');
  return (
    <AdminLayout>
      <div>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              👥
            </div>
            <div>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                User Management
              </p>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em' }}>
                Registrations
              </h1>
            </div>
          </div>
          <p style={{ color: '#4b5563', fontSize: 13, marginLeft: 54 }}>
            View all registered students, manage admin roles, and track CF verification status.
          </p>
        </div>

        <AdminUsersClient isSuperAdmin={session.user.role === 'superadmin'} />
      </div>
    </AdminLayout>
  );
}
