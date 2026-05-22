import supabase from '../_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    // Check user_roles table
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    return res.status(200).json({
      id: user.id,
      email: user.email,
      is_admin: role?.role === 'admin',
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: err.message });
  }
}
