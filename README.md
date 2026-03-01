# Hot or Not 🔥

Gen Z dating app — swipe right for hot, left for not.

## Stack
- Frontend: Next.js 14 (App Router, TypeScript, Tailwind) → Vercel
- Backend: Express.js → Render
- Database: Supabase (PostgreSQL)

## Supabase Setup

Run this SQL in your Supabase dashboard SQL editor:

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  age INTEGER,
  hot_count INTEGER DEFAULT 0,
  not_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote TEXT CHECK (vote IN ('hot', 'not')) NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
```

## Seed Database

After tables are created, call the seed endpoint:

```bash
curl -X POST https://<your-render-url>/api/seed
```

This populates 50 profiles from randomuser.me.

## Local Dev

### Backend
```bash
cd backend
cp .env.example .env  # fill in your Supabase creds
npm install
npm run dev
```

### Frontend
```bash
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
```
