import supabase from '../_supabase.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
    if (role?.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { file_data, file_name, content_type } = req.body;

    if (!file_data || !file_name) {
      return res.status(400).json({ error: 'file_data and file_name are required' });
    }

    // file_data is a base64 string
    const buffer = Buffer.from(file_data, 'base64');

    // Generate unique filename
    const ext = file_name.split('.').pop() || 'jpg';
    const uniqueName = `poster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('posters')
      .upload(uniqueName, buffer, {
        contentType: content_type || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('posters')
      .getPublicUrl(uniqueName);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
}
