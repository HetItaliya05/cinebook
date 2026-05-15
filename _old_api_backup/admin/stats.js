import supabase from '../_supabase.js';
import { verifyAdmin, enrichBookings } from '../_adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { data: movies } = await supabase.from('movies').select('id, title');
    const { data: bookings } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });

    const total_revenue = (bookings || []).reduce((sum, b) => sum + Number(b.total_price), 0);
    const total_tickets = (bookings || []).reduce((sum, b) => sum + b.seats, 0);

    const recent = (bookings || []).slice(0, 10);
    const enrichedRecent = await enrichBookings(recent);

    return res.status(200).json({
      total_movies: movies?.length || 0,
      total_bookings: bookings?.length || 0,
      total_revenue,
      total_tickets,
      recent_bookings: enrichedRecent,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
