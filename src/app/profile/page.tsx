import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your bootcamp profile, CF handle, scores, and season progress.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>
        <ProfileClient />
      </div>
    </MainLayout>
  );
}
