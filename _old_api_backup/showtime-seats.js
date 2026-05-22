import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { showtime_id } = req.query;
    if (!showtime_id) return res.status(400).json({ error: 'showtime_id required' });

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('showtime_id', parseInt(showtime_id));
    if (error) throw error;

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({ booked_seats: [] });
    }

    const bookingIds = bookings.map(b => b.id);

    const { data: seatData, error: seatError } = await supabase
      .from('booking_seats')
      .select('seat_labels')
      .in('booking_id', bookingIds);
    if (seatError) throw seatError;

    const allSeats = [];
    for (const row of (seatData || [])) {
      if (row.seat_labels) {
        const seats = row.seat_labels.split(',').map(s => s.trim()).filter(Boolean);
        allSeats.push(...seats);
      }
    }

    return res.status(200).json({ booked_seats: allSeats });
  } catch (err) {
    console.error('Showtime seats error:', err);
    res.status(500).json({ error: err.message });
  }
}
