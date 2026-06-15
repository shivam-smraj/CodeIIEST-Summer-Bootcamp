'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2, List } from 'lucide-react';
import Link from 'next/link';

interface ContestCardProps {
  id: string;
  name: string;
  phase: string;
  isCodeIIEST: boolean;
  weekNumber?: number;
  durationSeconds?: number;
  startTimeSeconds?: number;
  onClick: () => void;
  onExternalClick: () => void;
  index?: number;
}

// Format duration from seconds to HH:MM
function formatDuration(seconds: number = 0) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Format date to Codeforces style: Jun/18/2026 20:05
function formatCFDate(seconds: number = 0) {
  if (!seconds) return 'N/A';
  const d = new Date(seconds * 1000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  
  // Calculate timezone offset (e.g. UTC+5.5)
  const offsetMinutes = -d.getTimezoneOffset();
  const offsetHours = Math.floor(offsetMinutes / 60);
  const offsetMinsRemainder = offsetMinutes % 60;
  
  let tzString = `UTC`;
  if (offsetHours > 0 || offsetMinsRemainder > 0) {
    tzString += `+${offsetHours}`;
    if (offsetMinsRemainder > 0) tzString += `.${(offsetMinsRemainder / 60) * 10}`;
  } else if (offsetHours < 0) {
    tzString += `${offsetHours}`;
  }

  return (
    <div className="text-center text-xs text-[#0000ee]">
      <div>{month}/{day}/{year}</div>
      <div>{hours}:{mins}<sup className="text-[9px] text-[#888] ml-0.5">{tzString}</sup></div>
    </div>
  );
}

function ContestTableRow({ id, name, phase, isCodeIIEST, weekNumber, durationSeconds, startTimeSeconds, onClick, onExternalClick, index = 0 }: ContestCardProps) {
  const isBeginner = !isCodeIIEST && (name.includes('Div. 4') || name.includes('Div. 3') || name.includes('Educational'));
  const isLive = phase === 'CODING';
  
  const bgColor = isLive ? 'bg-[#eaffea]' : (index % 2 === 1 ? 'bg-[#f8f8f8]' : 'bg-white');

  return (
    <tr className={`border-b border-[#e1e1e1] hover:bg-[#f8f8f8] transition-colors ${bgColor}`}>
      <td className="p-2 text-center flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-0.5">
          <button onClick={onExternalClick} className="text-center font-bold text-[#1a5eb9] hover:text-[#0000ee] hover:underline text-[13px]">
            {name}
          </button>
          
          <div className="flex items-center justify-center gap-2">
            <button onClick={onClick} className="text-[#1a5eb9] hover:text-[#0000ee] hover:underline text-[11px] flex items-center gap-1">
              Enter »
            </button>
            {isCodeIIEST && (
              <span className="text-[10px] text-[#888]">Week {weekNumber}</span>
            )}
            {isBeginner && (
              <span className="text-[10px] text-[#00a900] font-bold">Beginner</span>
            )}
          </div>
        </div>
      </td>
      <td className="p-2 text-center align-middle whitespace-nowrap">
        {formatCFDate(startTimeSeconds)}
      </td>
      <td className="p-2 text-center align-middle border-l border-[#e1e1e1] text-[13px] text-black">
        {formatDuration(durationSeconds)}
      </td>
      <td className="p-2 text-center align-middle border-l border-[#e1e1e1] bg-[#f0f4fc]">
        <div className="flex flex-col items-center justify-center h-full">
           <button onClick={onClick} className="text-[#1a5eb9] hover:text-[#0000ee] hover:underline text-[12px]">
             Final standings
           </button>
        </div>
      </td>
    </tr>
  );
}

export function StandingDashboard({ codeIIESTContests, globalContests }: { codeIIESTContests: any[], globalContests: any[] }) {
  const [friends, setFriends] = useState<string[]>([]);
  const [newFriend, setNewFriend] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('cf_friends');
    if (saved) {
      try {
        setFriends(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriend.trim()) return;
    const f = newFriend.trim();
    if (!friends.includes(f)) {
      const updated = [...friends, f];
      setFriends(updated);
      localStorage.setItem('cf_friends', JSON.stringify(updated));
    }
    setNewFriend('');
  };

  const handleRemoveFriend = (f: string) => {
    const updated = friends.filter(x => x !== f);
    setFriends(updated);
    localStorage.setItem('cf_friends', JSON.stringify(updated));
  };

  const handleContestClick = (contest: any, isCodeIIEST: boolean) => {
    let phase = contest.phase || contest.status;
    if (phase === 'PENDING') phase = 'BEFORE';

    if (phase === 'BEFORE') {
      alert("This contest has not started yet!");
      return;
    }

    const cId = isCodeIIEST ? contest.cfContestId : contest.id;
    const gId = isCodeIIEST ? (contest.groupId || 'P1htAKU3hf') : '';
    const mode = (phase === 'CODING') ? 'live' : 'replay';

    let url = `/live?contestId=${cId}&mode=${mode}`;
    if (gId) url += `&groupId=${gId}`;
    
    if (!isCodeIIEST && friends.length > 0) {
      url += `&friends=${friends.join(',')}`;
    }

    router.push(url);
  };
  
  const handleExternalClick = (contest: any, isCodeIIEST: boolean) => {
    const cId = isCodeIIEST ? contest.cfContestId : contest.id;
    const gId = isCodeIIEST ? (contest.groupId || 'P1htAKU3hf') : '';
    
    let url = `https://codeforces.com/contest/${cId}`;
    if (gId) {
      url = `https://codeforces.com/group/${gId}/contest/${cId}`;
    }
    window.open(url, '_blank');
  };

  const hasLiveContest = codeIIESTContests.some(c => c.status === 'SCHEDULED'); 

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-[verdana,arial,sans-serif] pb-10 w-full" style={{ width: '100%' }}>
      
      <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1.5rem 1rem', width: '100%' }}>
        {/* Codeforces-style Navbar */}
        <div style={{
          border: '1px solid #b9b9b9',
          borderRadius: '4px',
          backgroundColor: '#fff',
          padding: '7px 1.25rem 0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div className="flex flex-wrap gap-x-6 text-[13px] font-bold">
            <Link href="/" className="text-black hover:text-[#0000ee] hover:underline" style={{ color: '#000', paddingBottom: '7px' }}>Home</Link>
            <Link href="/leaderboard" className="text-black hover:text-[#0000ee] hover:underline" style={{ color: '#000', paddingBottom: '7px' }}>Standings</Link>
            <Link href="/sessions" className="text-black hover:text-[#0000ee] hover:underline" style={{ color: '#000', paddingBottom: '7px' }}>Schedule</Link>
            <span className="text-black" style={{ borderBottom: '3px solid #1a5eb9', paddingBottom: '4px', color: '#000' }}>Contests</span>
            <Link href="/profile" className="text-black hover:text-[#0000ee] hover:underline" style={{ color: '#000', paddingBottom: '7px' }}>Profile</Link>
            
            {/* Friends Button */}
            <button 
              onClick={() => setShowFriends(!showFriends)} 
              className="text-black hover:text-[#0000ee] hover:underline cursor-pointer outline-none" style={{ color: '#000', paddingBottom: '7px' }}
            >
              Friends {friends.length > 0 && `(${friends.length})`}
            </button>
          </div>

          {/* Friends Dropdown Widget */}
          {showFriends && (
            <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '320px', zIndex: 50, backgroundColor: '#fff', border: '1px solid #b9b9b9', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', fontSize: '13px', color: '#333' }}>
               <div style={{ backgroundColor: '#e1e1e1', padding: '0.4rem 0.6rem', borderBottom: '1px solid #c1c1c1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus className="w-3.5 h-3.5" /> My Friends
              </div>
              <div style={{ padding: '1rem' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.4' }}>
                  Add Codeforces handles here. Whenever you open a global contest, they will be injected into your scoreboard!
                </p>

                <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                  <input 
                    type="text" 
                    value={newFriend}
                    onChange={e => setNewFriend(e.target.value)}
                    placeholder="CF Handle (e.g. tourist)" 
                    style={{ width: '100%', border: '1px solid #ccc', borderRadius: '3px', padding: '6px 8px', outline: 'none', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                  />
                  <button type="submit" style={{ alignSelf: 'flex-start', backgroundColor: '#f3f3f3', border: '1px solid #b9b9b9', borderBottomColor: '#939393', borderRadius: '3px', color: '#333', fontWeight: 'bold', padding: '5px 12px', cursor: 'pointer', textShadow: '0 1px 0 #fff' }}>
                    Add Friend
                  </button>
                </form>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                  {friends.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '8px', color: '#888', fontStyle: 'italic' }}>No friends added.</div>
                  ) : (
                    friends.map((f, i) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: i % 2 === 0 ? '#fff' : '#f8f8f8', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontWeight: 'bold', color: '#0000ee' }}>{f}</span>
                        <button 
                          onClick={() => handleRemoveFriend(f)}
                          style={{ color: '#888', cursor: 'pointer', outline: 'none', border: 'none', background: 'transparent' }}
                          title="Remove friend"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content (Contest Tables) */}
        <div className="flex flex-col gap-6">
          
          {hasLiveContest && (
            <div className="bg-[#eaffea] border border-[#00a900] rounded p-4 shadow-sm text-[13px] text-black">
              <span className="font-bold text-[#00a900]">Bootcamp Contest Active!</span> A CodeIIEST scheduled contest is currently running. Jump into the arena now!
            </div>
          )}

          {/* Group Contests Table */}
          <div className="bg-white border border-[#e1e1e1] rounded shadow-sm overflow-hidden">
            <div className="bg-[#e1e1e1] p-1.5 border-b border-[#c1c1c1] text-[13px] font-bold text-black flex items-center gap-1.5 pl-2">
              <List className="w-3.5 h-3.5" /> Group Contests
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e1e1e1] text-[13px] font-bold text-black bg-white">
                    <th className="p-2 text-center w-1/2 font-bold border-r border-[#e1e1e1]">Name</th>
                    <th className="p-2 text-center border-r border-[#e1e1e1] w-[15%] font-bold">Start</th>
                    <th className="p-2 text-center border-r border-[#e1e1e1] w-[15%] font-bold">Length</th>
                    <th className="p-2 text-center w-[20%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {codeIIESTContests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[13px] text-[#888]">
                        No CodeIIEST contests synced or scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    codeIIESTContests.map((c, index) => (
                      <ContestTableRow 
                        key={c._id}
                        id={c.cfContestId}
                        name={c.contestName}
                        phase={c.status}
                        isCodeIIEST={true}
                        weekNumber={c.weekNumber}
                        durationSeconds={7200} // Fallback duration 2 hours
                        startTimeSeconds={c.syncedAt ? Math.floor(new Date(c.syncedAt).getTime() / 1000) : undefined}
                        onClick={() => handleContestClick(c, true)}
                        onExternalClick={() => handleExternalClick(c, true)}
                        index={index}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Contests Table */}
          <div className="bg-white border border-[#e1e1e1] rounded shadow-sm overflow-hidden">
            <div className="bg-[#e1e1e1] p-1.5 border-b border-[#c1c1c1] text-[13px] font-bold text-black flex items-center gap-1.5 pl-2">
              <List className="w-3.5 h-3.5" /> Current or upcoming contests
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e1e1e1] text-[13px] font-bold text-black bg-white">
                    <th className="p-2 text-center w-1/2 font-bold border-r border-[#e1e1e1]">Name</th>
                    <th className="p-2 text-center border-r border-[#e1e1e1] w-[15%] font-bold">Start</th>
                    <th className="p-2 text-center border-r border-[#e1e1e1] w-[15%] font-bold">Length</th>
                    <th className="p-2 text-center w-[20%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {globalContests.map((c, index) => (
                    <ContestTableRow 
                      key={c.id}
                      id={c.id.toString()}
                      name={c.name}
                      phase={c.phase}
                      isCodeIIEST={false}
                      durationSeconds={c.durationSeconds}
                      startTimeSeconds={c.startTimeSeconds}
                      onClick={() => handleContestClick(c, false)}
                      onExternalClick={() => handleExternalClick(c, false)}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
