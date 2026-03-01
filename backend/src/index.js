const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'hot-or-not-backend' }));

app.get('/api/profiles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    const shuffled = data.sort(() => Math.random() - 0.5);
    res.json(shuffled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/votes', async (req, res) => {
  try {
    const { profile_id, vote, session_id } = req.body;
    if (!profile_id || !vote) return res.status(400).json({ error: 'Missing fields' });

    const { error: voteErr } = await supabase
      .from('votes')
      .insert({ profile_id, vote, session_id: session_id || 'anonymous' });
    if (voteErr) throw voteErr;

    const col = vote === 'hot' ? 'hot_count' : 'not_count';
    const { data: profile } = await supabase.from('profiles').select(col).eq('id', profile_id).single();
    await supabase.from('profiles').update({ [col]: (profile?.[col] || 0) + 1 }).eq('id', profile_id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('hot_count', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const response = await fetch('https://randomuser.me/api/?results=50&gender=female&nat=us,gb,au,ca,fr');
    const data = await response.json();
    const profiles = data.results.map(u => ({
      name: `${u.name.first} ${u.name.last}`,
      photo_url: u.picture.large,
      age: u.dob.age,
    }));
    const { error } = await supabase.from('profiles').insert(profiles);
    if (error) throw error;
    res.json({ success: true, count: profiles.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔥 Hot or Not backend running on port ${PORT}`));
