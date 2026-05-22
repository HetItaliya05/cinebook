import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, genre } = req.query;
      if (id) {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .eq('id', parseInt(id))
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('movies').select('*').order('rating', { ascending: false });
      if (genre && genre !== 'All') {
        query = query.eq('genre', genre);
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
