import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { movie_id } = req.query;
      if (!movie_id) return res.status(400).json({ error: 'movie_id required' });
      const { data, error } = await supabase
        .from('showtimes')
        .select('*')
        .eq('movie_id', parseInt(movie_id))
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
