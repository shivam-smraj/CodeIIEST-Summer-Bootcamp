import LiveEngine from '@/components/live/LiveEngine';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Live Leaderboard | CodeIIEST Bootcamp',
  description: 'Interactive animated live leaderboard for CodeIIEST Bootcamp contests.',
};

export default function LiveLeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col">
      <Suspense fallback={<div className="p-8 text-white">Loading Scoreboard Engine...</div>}>
        <LiveEngine />
      </Suspense>
    </div>
  );
}
