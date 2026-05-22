import { Router } from 'express';
import Movie from '../../models/Movie.js';
import Booking from '../../models/Booking.js';
import Showtime from '../../models/Showtime.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const [movies, bookings] = await Promise.all([
      Movie.find().select('_id title'),
      Booking.find().sort({ createdAt: -1 }),
    ]);
    const movieMap = {}; movies.forEach(m => { movieMap[m._id] = m.title; });
    const total_revenue = bookings.reduce((s, b) => s + b.total_price, 0);
    const total_tickets = bookings.reduce((s, b) => s + b.seats, 0);
    const recent = bookings.slice(0, 10);
    const stIds = [...new Set(recent.map(b => b.showtime_id.toString()))];
    const showtimes = await Showtime.find({ _id: { $in: stIds } });
    const stMap = {}; showtimes.forEach(s => { stMap[s._id] = s; });
    const enrichedRecent = recent.map(b => {
      const s = stMap[b.showtime_id] || {};
      return {
        id: b._id, customer_name: b.customer_name, customer_email: b.customer_email,
        seats: b.seats, seat_labels: b.seat_labels || '', total_price: b.total_price,
        created_at: b.createdAt, movie_title: movieMap[b.movie_id] || '',
        theater: s.theater || '', show_date: s.date || '', show_time: s.time || '',
      };
    });
    res.json({ total_movies: movies.length, total_bookings: bookings.length, total_revenue, total_tickets, recent_bookings: enrichedRecent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
