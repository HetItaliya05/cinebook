import supabase from '../_supabase.js';
import { verifyAdmin, enrichBookings } from '../_adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    if (req.method === 'GET') {
      const page = parseInt(req.query.page || '1');
      const limit = Math.min(parseInt(req.query.limit || '50'), 200);
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;

      const enriched = await enrichBookings(data || []);
      return res.status(200).json(enriched);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const { data: booking } = await supabase.from('bookings').select('showtime_id, seats').eq('id', id).single();
      if (booking) {
        const { data: st } = await supabase.from('showtimes').select('available_seats').eq('id', booking.showtime_id).single();
        if (st) {
          await supabase.from('showtimes').update({ available_seats: st.available_seats + booking.seats }).eq('id', booking.showtime_id);
        }
      }
      await supabase.from('booking_seats').delete().eq('booking_id', id);
      await supabase.from('user_bookings').delete().eq('booking_id', id);
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
