import supabase from '../_supabase.js';
import { verifyAdmin } from '../_adminAuth.js';
import { validate } from '../_validate.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    if (req.method === 'POST') {
      const err = validate(req.body, {
        title: { required: true, type: 'string', maxLength: 300 },
        genre: { required: true, type: 'string' },
        rating: { required: true, type: 'number', min: 0, max: 10 },
        duration_minutes: { required: true, type: 'number', min: 1 },
        release_year: { required: true, type: 'number', min: 1900, max: 2100 },
      });
      if (err) return res.status(400).json({ error: err });

      const { title, genre, rating, duration_minutes, description, poster_url, release_year } = req.body;
      const { data, error } = await supabase
        .from('movies')
        .insert({ title, genre, rating, duration_minutes, description: description || '', poster_url: poster_url || '', release_year })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, title, genre, rating, duration_minutes, description, poster_url, release_year } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase
        .from('movies')
        .update({ title, genre, rating, duration_minutes, description, poster_url, release_year })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await supabase.from('showtimes').delete().eq('movie_id', id);
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin movies error:', err);
    res.status(500).json({ error: err.message });
  }
}
