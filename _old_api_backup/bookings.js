import supabase from './_supabase.js';
import { validate } from './_validate.js';
import { rateLimit } from './_rateLimit.js';
import { enrichBookings } from './_adminAuth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  let userId = null;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    } catch {}
  }

  try {
    if (req.method === 'POST') {
      // Rate limit: 10 bookings per minute per IP
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      if (!rateLimit(`book:${ip}`, 10, 60000)) {
        return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      }

      const { movie_id, showtime_id, customer_name, customer_email, seats, total_price, seat_labels } = req.body;

      const validationError = validate(req.body, {
        movie_id: { required: true, type: 'number' },
        showtime_id: { required: true, type: 'number' },
        customer_name: { required: true, type: 'string', maxLength: 200 },
        customer_email: { required: true, type: 'email' },
        seats: { required: true, type: 'number', min: 1, max: 10 },
        total_price: { required: true, type: 'number', min: 0 },
      });
      if (validationError) return res.status(400).json({ error: validationError });

      const { data: showtime, error: stError } = await supabase
        .from('showtimes')
        .select('available_seats, theater, date, time, price')
        .eq('id', showtime_id)
        .single();
      if (stError) throw stError;
      if (showtime.available_seats < seats) {
        return res.status(400).json({ error: 'Not enough seats available' });
      }

      // Check for duplicate seat bookings
      if (seat_labels) {
        const { data: existingBookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('showtime_id', showtime_id);
        if (existingBookings && existingBookings.length > 0) {
          const existingIds = existingBookings.map(b => b.id);
          const { data: existingSeats } = await supabase
            .from('booking_seats')
            .select('seat_labels')
            .in('booking_id', existingIds);
          const takenSet = new Set();
          (existingSeats || []).forEach(s => {
            s.seat_labels.split(',').map(l => l.trim()).filter(Boolean).forEach(l => takenSet.add(l));
          });
          const requested = seat_labels.split(',').map(l => l.trim()).filter(Boolean);
          const conflicts = requested.filter(s => takenSet.has(s));
          if (conflicts.length > 0) {
            return res.status(409).json({ error: `Seats already booked: ${conflicts.join(', ')}. Please select different seats.` });
          }
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({ movie_id, showtime_id, customer_name, customer_email, seats, total_price })
        .select()
        .single();
      if (error) throw error;

      if (seat_labels && data) {
        await supabase.from('booking_seats').insert({ booking_id: data.id, seat_labels });
      }
      if (userId && data) {
        await supabase.from('user_bookings').insert({ user_id: userId, booking_id: data.id });
      }

      await supabase.from('showtimes')
        .update({ available_seats: showtime.available_seats - seats })
        .eq('id', showtime_id);

      const { data: movie } = await supabase.from('movies').select('title, poster_url, genre').eq('id', movie_id).single();

      // Trigger confirmation email (fire-and-forget, don't block response)
      try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        fetch(`${protocol}://${host}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: data.id }),
        }).catch(() => {}); // Silently ignore email failures
      } catch {}

      return res.status(201).json({
        ...data,
        seat_labels: seat_labels || '',
        movie_title: movie?.title || '',
        movie_poster: movie?.poster_url || '',
        movie_genre: movie?.genre || '',
        theater: showtime.theater,
        show_date: showtime.date,
        show_time: showtime.time,
        ticket_price: showtime.price,
      });
    }

    if (req.method === 'GET') {
      const { email, booking_id } = req.query;

      if (booking_id) {
        const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', parseInt(booking_id)).single();
        if (error) throw error;
        const enriched = await enrichBookings([booking]);
        return res.status(200).json(enriched[0]);
      }

      if (!email) return res.status(400).json({ error: 'email or booking_id required' });

      let bookings;
      if (userId) {
        const { data: userBookings } = await supabase.from('user_bookings').select('booking_id').eq('user_id', userId);
        const bookingIds = (userBookings || []).map(ub => ub.booking_id);
        let query = supabase.from('bookings').select('*');
        if (bookingIds.length > 0) {
          query = query.or(`id.in.(${bookingIds.join(',')}),customer_email.eq.${email}`);
        } else {
          query = query.eq('customer_email', email);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        const seen = new Set();
        bookings = (data || []).filter(b => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });
      } else {
        const { data, error } = await supabase.from('bookings').select('*').eq('customer_email', email).order('created_at', { ascending: false });
        if (error) throw error;
        bookings = data;
      }

      const enriched = await enrichBookings(bookings || []);
      return res.status(200).json(enriched);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
