const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Profile {
  id: string;
  name: string;
  photo_url: string;
  age: number;
  hot_count: number;
  not_count: number;
}

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${API_URL}/api/profiles`);
  return res.json();
}

export async function submitVote(profile_id: string, vote: 'hot' | 'not', session_id: string) {
  const res = await fetch(`${API_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id, vote, session_id }),
  });
  return res.json();
}

export async function getLeaderboard(): Promise<Profile[]> {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  return res.json();
}
