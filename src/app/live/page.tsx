import LiveEngine from '@/components/live/LiveEngine';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Leaderboard | CodeIIEST Bootcamp',
  description: 'Interactive animated live leaderboard for CodeIIEST Bootcamp contests.',
};

export default function LiveLeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col">
      <LiveEngine />
    </div>
  );
}
