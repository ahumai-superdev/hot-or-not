'use client';
import { useEffect, useState } from 'react';
import { getLeaderboard, Profile } from '@/lib/api';
import Link from 'next/link';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => { setProfiles(data); setLoading(false); });
  }, []);

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)' }}>
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-purple-400 text-2xl">←</Link>
          <h1 className="text-3xl font-black text-white">🏆 leaderboard</h1>
        </div>
        <p className="text-gray-400 text-sm mb-6">top 10 hottest profiles 🔥</p>
        {loading ? (
          <p className="text-purple-400 animate-pulse">loading...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {profiles.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="text-2xl font-black" style={{ color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#fb923c' : '#6b7280' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <img src={p.photo_url} alt={p.name} className="w-12 h-12 rounded-full object-cover" style={{ border: '2px solid rgba(139,92,246,0.5)' }} />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.age} years old</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-sm">🔥 {p.hot_count}</p>
                  <p className="text-blue-400 text-xs">❄️ {p.not_count}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
