'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Profile {
  id: string; name: string; photo_url: string;
  age: number; hot_count: number; not_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function Card({ profile, onVote }: { profile: Profile; onVote: (v: 'hot' | 'not') => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-22, 22]);
  const hotO = useTransform(x, [30, 130], [0, 1]);
  const notO = useTransform(x, [-130, -30], [1, 0]);
  const exitX = useRef(0);

  return (
    <motion.div
      style={{ x, rotate, position: 'absolute', inset: 0, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={(_, i) => {
        if (i.offset.x > 80) { exitX.current = 700; onVote('hot'); }
        else if (i.offset.x < -80) { exitX.current = -700; onVote('not'); }
      }}
      exit={{ x: exitX.current, opacity: 0, rotate: exitX.current > 0 ? 30 : -30, transition: { duration: 0.3 } }}
      className="cursor-grab active:cursor-grabbing select-none"
      whileTap={{ scale: 1.03 }}
    >
      <motion.div style={{ opacity: hotO, position: 'absolute', top: 28, left: 20, zIndex: 20, rotate: -18, pointerEvents: 'none' }}>
        <span style={{ border: '3px solid #f97316', color: '#f97316', background: 'rgba(249,115,22,0.15)', borderRadius: 14, padding: '6px 14px', fontWeight: 900, fontSize: 22, display: 'block' }}>🔥 HOT</span>
      </motion.div>
      <motion.div style={{ opacity: notO, position: 'absolute', top: 28, right: 20, zIndex: 20, rotate: 18, pointerEvents: 'none' }}>
        <span style={{ border: '3px solid #3b82f6', color: '#3b82f6', background: 'rgba(59,130,246,0.15)', borderRadius: 14, padding: '6px 14px', fontWeight: 900, fontSize: 22, display: 'block' }}>❄️ NOT</span>
      </motion.div>

      <div style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', background: '#0d0d1a', border: '1.5px solid rgba(139,92,246,0.5)', boxShadow: '0 30px 70px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.12)' }}>
        <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '14px 18px', background: 'linear-gradient(to top, #0a0a0f 80%, transparent)' }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>{profile.name}</div>
          <div style={{ fontSize: 13, color: '#a78bfa', marginTop: 2 }}>{profile.age} years old ✨</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>🔥 {profile.hot_count}</span>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>❄️ {profile.not_count}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [idx, setIdx] = useState(0);
  const [hotCount, setHotCount] = useState(0);
  const [notCount, setNotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voteFlash, setVoteFlash] = useState<'hot' | 'not' | null>(null);
  const sessionId = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    fetch(`${API}/api/profiles`)
      .then(r => r.json())
      .then(d => { setProfiles(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const vote = async (v: 'hot' | 'not') => {
    const profile = profiles[idx];
    if (!profile) return;
    setVoteFlash(v);
    if (v === 'hot') setHotCount(h => h + 1);
    else setNotCount(n => n + 1);
    setIdx(i => i + 1);
    setTimeout(() => setVoteFlash(null), 700);
    try { await fetch(`${API}/api/votes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile_id: profile.id, vote: v, session_id: sessionId.current }) }); } catch {}
  };

  const current = profiles[idx];
  const next = profiles[idx + 1];

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg, #0a0a0f 0%, #130a24 45%, #0a0a0f 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 32, position: 'relative', overflow: 'hidden' }}>
      {/* bg blobs */}
      <div style={{ position: 'fixed', top: '15%', left: '10%', width: 280, height: 280, borderRadius: '50%', background: '#7c3aed', opacity: 0.07, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 220, height: 220, borderRadius: '50%', background: '#db2777', opacity: 0.07, filter: 'blur(70px)', pointerEvents: 'none' }} />

      {/* vote flash */}
      <AnimatePresence>
        {voteFlash && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.3 }}
            style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, fontSize: 72, pointerEvents: 'none' }}>
            {voteFlash === 'hot' ? '🔥' : '❄️'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* header */}
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 20px 16px', position: 'relative', zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 28, background: 'linear-gradient(135deg, #fff 30%, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>hot or not 🔥</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>swipe right = hot • swipe left = not</div>
        </div>
        <Link href="/leaderboard" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa', textDecoration: 'none' }}>🏆 Board</Link>
      </div>

      {/* score */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, position: 'relative', zIndex: 10 }}>
        <motion.div key={`h${hotCount}`} animate={{ scale: [1.25, 1] }} transition={{ duration: 0.2 }} style={{ padding: '6px 18px', borderRadius: 20, fontWeight: 700, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#fb923c' }}>🔥 {hotCount}</motion.div>
        <motion.div key={`n${notCount}`} animate={{ scale: [1.25, 1] }} transition={{ duration: 0.2 }} style={{ padding: '6px 18px', borderRadius: 20, fontWeight: 700, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }}>❄️ {notCount}</motion.div>
      </div>

      {/* card stack */}
      <div style={{ position: 'relative', width: 300, height: 440, marginBottom: 32, zIndex: 10 }}>
        {loading ? (
          <div style={{ width: 300, height: 440, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ fontSize: 36 }}>✨</motion.div>
            <div style={{ color: '#a78bfa', fontSize: 14 }}>loading vibes...</div>
          </div>
        ) : !current ? (
          <div style={{ width: 300, height: 440, borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>you swiped em all!</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>🔥 {hotCount} hot • ❄️ {notCount} not</div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIdx(0); setHotCount(0); setNotCount(0); }} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 24, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', cursor: 'pointer', fontSize: 14 }}>play again 🔄</motion.button>
          </div>
        ) : (
          <>
            {next && <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.15)', transform: 'scale(0.93) translateY(14px)', zIndex: 1 }} />}
            <AnimatePresence mode="wait">
              <Card key={current.id} profile={current} onVote={vote} />
            </AnimatePresence>
          </>
        )}
      </div>

      {/* buttons */}
      {!loading && current && (
        <div style={{ display: 'flex', gap: 32, position: 'relative', zIndex: 10 }}>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={() => vote('not')} style={{ width: 64, height: 64, borderRadius: '50%', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.5)', boxShadow: '0 0 24px rgba(59,130,246,0.25)', cursor: 'pointer' }}>❄️</motion.button>
          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={() => vote('hot')} style={{ width: 64, height: 64, borderRadius: '50%', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.5)', boxShadow: '0 0 24px rgba(249,115,22,0.25)', cursor: 'pointer' }}>🔥</motion.button>
        </div>
      )}

      <div style={{ fontSize: 11, color: '#374151', marginTop: 24, position: 'relative', zIndex: 10 }}>built by ahum ai 🐾</div>
    </main>
  );
}
