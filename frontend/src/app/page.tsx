'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import TinderCard from 'react-tinder-card';
import { getProfiles, submitVote, Profile } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastVote, setLastVote] = useState<'hot' | 'not' | null>(null);
  const [hotCount, setHotCount] = useState(0);
  const [notCount, setNotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const sessionId = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    getProfiles().then(data => {
      setProfiles(data);
      setCurrentIndex(data.length - 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const onSwipe = useCallback(async (direction: string, profile: Profile) => {
    const vote = direction === 'right' ? 'hot' : 'not';
    setLastVote(vote);
    if (vote === 'hot') setHotCount(h => h + 1);
    else setNotCount(n => n + 1);
    setCurrentIndex(i => i - 1);
    await submitVote(profile.id, vote, sessionId.current);
    setTimeout(() => setLastVote(null), 800);
  }, []);

  const swipeLeft = () => {
    if (currentIndex >= 0 && profiles[currentIndex]) onSwipe('left', profiles[currentIndex]);
  };
  const swipeRight = () => {
    if (currentIndex >= 0 && profiles[currentIndex]) onSwipe('right', profiles[currentIndex]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-6 px-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)' }}>
      <div className="w-full max-w-sm flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">hot or not 🔥</h1>
          <p className="text-purple-400 text-sm">swipe right = hot • swipe left = not</p>
        </div>
        <Link href="/leaderboard" className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)', color: '#a78bfa' }}>
          🏆 Board
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="px-5 py-2 rounded-full font-bold text-lg" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c' }}>🔥 {hotCount}</div>
        <div className="px-5 py-2 rounded-full font-bold text-lg" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }}>❄️ {notCount}</div>
      </div>

      {lastVote && (
        <div className={`fixed top-20 z-50 text-6xl font-black px-8 py-4 rounded-2xl ${lastVote === 'hot' ? 'text-orange-400' : 'text-blue-400'}`}
          style={{ background: lastVote === 'hot' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)', border: `2px solid ${lastVote === 'hot' ? '#fb923c' : '#60a5fa'}` }}>
          {lastVote === 'hot' ? '🔥 HOT!' : '❄️ NOT'}
        </div>
      )}

      <div className="relative w-72 h-96 mb-8">
        {loading ? (
          <div className="w-72 h-96 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-purple-400 text-lg animate-pulse">loading... ✨</p>
          </div>
        ) : currentIndex < 0 ? (
          <div className="w-72 h-96 rounded-3xl flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-4xl">🎉</p>
            <p className="text-white font-bold text-xl">you swiped em all!</p>
            <p className="text-gray-400 text-sm">🔥 {hotCount} hot • ❄️ {notCount} not</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              play again 🔄
            </button>
          </div>
        ) : (
          profiles.map((profile, index) => (
            index <= currentIndex && index >= currentIndex - 2 ? (
              <TinderCard key={profile.id} onSwipe={(dir) => onSwipe(dir, profile)} preventSwipe={['up', 'down']} className="absolute">
                <div className="w-72 h-96 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.1)', transform: `scale(${1 - (currentIndex - index) * 0.04}) translateY(${(currentIndex - index) * 10}px)`, zIndex: index }}>
                  <img src={profile.photo_url} alt={profile.name} className="w-full h-72 object-cover" />
                  <div className="p-4" style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.95), transparent)' }}>
                    <h2 className="text-white font-black text-xl">{profile.name}</h2>
                    <p className="text-purple-400 text-sm">{profile.age} years old ✨</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>🔥 {profile.hot_count}</span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>❄️ {profile.not_count}</span>
                    </div>
                  </div>
                </div>
              </TinderCard>
            ) : null
          ))
        )}
      </div>

      {!loading && currentIndex >= 0 && (
        <div className="flex gap-6">
          <button onClick={swipeLeft} className="w-16 h-16 rounded-full text-2xl font-bold flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.5)', color: '#60a5fa', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>❄️</button>
          <button onClick={swipeRight} className="w-16 h-16 rounded-full text-2xl font-bold flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.5)', color: '#fb923c', boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}>🔥</button>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-6">built by ahum ai 🐾</p>
    </main>
  );
}
