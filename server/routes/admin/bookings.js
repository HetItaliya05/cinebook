import { Router } from 'express';
import Booking from '../../models/Booking.js';
import Showtime from '../../models/Showtime.js';
import Movie from '../../models/Movie.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

async function enrichBookings(bookings) {
  const movieIds = [...new Set(bookings.map(b => b.movie_id.toString()))];
  const showtimeIds = [...new Set(bookings.map(b => b.showtime_id.toString()))];
  const movies = await Movie.find({ _id: { $in: movieIds } });
  const showtimes = await Showtime.find({ _id: { $in: showtimeIds } });
  const movieMap = {}; movies.forEach(m => { movieMap[m._id] = m; });
  const stMap = {}; showtimes.forEach(s => { stMap[s._id] = s; });
  return bookings.map(b => {
    const m = movieMap[b.movie_id] || {};
    const s = stMap[b.showtime_id] || {};
    return {
      id: b._id, movie_id: b.movie_id, showtime_id: b.showtime_id,
      customer_name: b.customer_name, customer_email: b.customer_email,
      seats: b.seats, seat_labels: b.seat_labels || '', total_price: b.total_price,
      created_at: b.createdAt,
      movie_title: m.title || '', movie_poster: m.poster_url || '', movie_genre: m.genre || '',
      theater: s.theater || '', show_date: s.date || '', show_time: s.time || '', ticket_price: s.price || 0,
    };
  });
}

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(200);
    const enriched = await enrichBookings(bookings);
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.body;
    const booking = await Booking.findById(id);
    if (booking) {
      const st = await Showtime.findById(booking.showtime_id);
      if (st) { st.available_seats += booking.seats; await st.save(); }
      await Booking.findByIdAndDelete(id);
    }
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
