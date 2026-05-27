import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { WeeksTimeline } from '@/components/home/WeeksTimeline';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';

export const metadata: Metadata = {
  title: 'CodeIIEST CP & DSA Summer Bootcamp 2026',
  description:
    'An 8-week structured competitive programming and DSA bootcamp for IIEST Shibpur students. Weekly expert sessions, automated Codeforces leaderboard, and a clear path to Expert rating.',
};

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <StatsSection />
      <WeeksTimeline />
      <FeaturesGrid />
    </MainLayout>
  );
}
