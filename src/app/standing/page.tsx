import { StandingDashboard } from '@/components/standing/StandingDashboard';
import { connectToDatabase } from '@/lib/mongoose';
import { Contest } from '@/models/Contest';
import { CF_API_BASE } from '@/lib/constants';

export const metadata = {
  title: 'Live Contests | CodeIIEST Bootcamp',
  description: 'Live scoreboard dashboard for CodeIIEST weekly contests and global Codeforces contests.',
};

async function getCodeIIESTContests() {
  await connectToDatabase();
  const contests = await Contest.find({}, {
    cfContestId: 1, contestName: 1, weekNumber: 1, groupId: 1, status: 1, startTimeSeconds: 1, participantCount: 1, syncedAt: 1
  }).sort({ weekNumber: -1, syncedAt: -1 }).lean();
  
  return contests.map(c => ({
    ...c,
    _id: c._id.toString(),
    syncedAt: c.syncedAt?.toISOString(),
  }));
}

async function getGlobalContests() {
  try {
    const res = await fetch(`${CF_API_BASE}/contest.list?gym=false`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data.status !== 'OK') return [];
    
    const contests = data.result;
    // Extract: 3 Upcoming (reverse to get soonest first), all Coding, and 10 Finished
    const before = contests.filter((c: any) => c.phase === 'BEFORE').reverse().slice(0, 3);
    const coding = contests.filter((c: any) => c.phase === 'CODING');
    const finished = contests.filter((c: any) => c.phase === 'FINISHED').slice(0, 10);
    
    return [...before, ...coding, ...finished];
  } catch {
    return [];
  }
}

export default async function StandingPage() {
  const codeIIESTContests = await getCodeIIESTContests();
  const globalContests = await getGlobalContests();
  
  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans">
      <StandingDashboard codeIIESTContests={codeIIESTContests} globalContests={globalContests} />
    </div>
  );
}
