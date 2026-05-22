import { Router } from 'express';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import { optionalAuth } from '../middleware/auth.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';

const router = Router();

async function enrichBookings(bookings) {
  const movieIds = [...new Set(bookings.map(b => b.movie_id.toString()))];
  const showtimeIds = [...new Set(bookings.map(b => b.showtime_id.toString()))];
  const movies = await Movie.find({ _id: { $in: movieIds } });
  const showtimes = await Showtime.find({ _id: { $in: showtimeIds } });
  const movieMap = {};
  movies.forEach(m => { movieMap[m._id] = m; });
  const stMap = {};
  showtimes.forEach(s => { stMap[s._id] = s; });
  return bookings.map(b => {
    const m = movieMap[b.movie_id] || {};
    const s = stMap[b.showtime_id] || {};
    return {
      _id: b._id.toString(),
      id: b._id.toString(),
      movie_id: b.movie_id,
      showtime_id: b.showtime_id,
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      seats: b.seats,
      seat_labels: b.seat_labels || '',
      total_price: b.total_price,
      created_at: b.createdAt,
      movie_title: m.title || '',
      movie_poster: m.poster_url || '',
      movie_genre: m.genre || '',
      theater: s.theater || '',
      show_date: s.date || '',
      show_time: s.time || '',
      ticket_price: s.price || 0,
    };
  });
}

// POST /api/bookings - Create booking
// POST /api/bookings - Create booking
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { movie_id, showtime_id, customer_name, customer_email, seats, total_price, seat_labels } = req.body;

    if (!movie_id || !showtime_id || !customer_name || !customer_email || !seats || !total_price) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const showtime = await Showtime.findById(showtime_id);
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    if (showtime.available_seats < seats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    // Check for seat conflicts
    if (seat_labels) {
      const existing = await Booking.find({ showtime_id });
      const takenSet = new Set();
      existing.forEach(b => {
        if (b.seat_labels) {
          b.seat_labels.split(',').map(s => s.trim()).filter(Boolean).forEach(s => takenSet.add(s));
        }
      });
      const requested = seat_labels.split(',').map(s => s.trim()).filter(Boolean);
      const conflicts = requested.filter(s => takenSet.has(s));
      if (conflicts.length > 0) {
        return res.status(409).json({ error: `Seats already booked: ${conflicts.join(', ')}` });
      }
    }

    // Create the booking
    const booking = await Booking.create({
      movie_id,
      showtime_id,
      customer_name,
      customer_email,
      seats,
      total_price,
      seat_labels: seat_labels || '',
      user_id: req.user?._id || null,
    });

    console.log('✅ Booking created:', booking._id);

    // Update available seats
    showtime.available_seats -= seats;
    await showtime.save();

    // Get movie details for email
    const movie = await Movie.findById(movie_id);

    // ─── SEND BOOKING CONFIRMATION EMAIL (non-blocking) ───
    sendBookingConfirmationEmail({
      customerName:  customer_name,
      customerEmail: customer_email,
      bookingId:     booking._id.toString(),
      movieTitle:    movie?.title        || 'Unknown Movie',
      movieGenre:    movie?.genre        || '',
      moviePoster:   movie?.poster_url   || '',
      theater:       showtime.theater,
      showDate:      showtime.date,
      showTime:      showtime.time,
      seats:         seats,
      seatLabels:    seat_labels        || '',
      totalPrice:    total_price,
      ticketPrice:   showtime.price,
    }).catch((err) => console.error('Booking email error:', err));

    // ✅ SEND RESPONSE TO CLIENT — THIS WAS MISSING!
    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      _id: booking._id.toString(),
      id: booking._id.toString(),
      booking: {
        _id: booking._id.toString(),
        id: booking._id.toString(),
        movie_id: booking.movie_id,
        showtime_id: booking.showtime_id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        seats: booking.seats,
        seat_labels: booking.seat_labels,
        total_price: booking.total_price,
        created_at: booking.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Booking creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id - Get single booking by ID (MUST BE BEFORE GET /)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching booking with ID:', id);

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid ID format:', id);
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      console.log('❌ Booking not found:', id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('✅ Booking found:', booking._id);

    const enriched = await enrichBookings([booking]);
    res.json(enriched[0]);
  } catch (err) {
    console.error('❌ Error fetching booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings?email=...&booking_id=... - Get bookings by query (MUST BE LAST)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { email, booking_id } = req.query;

    if (booking_id) {
      const booking = await Booking.findById(booking_id);
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      const enriched = await enrichBookings([booking]);
      return res.json(enriched[0]);
    }

    if (!email) {
      return res.status(400).json({ error: 'email or booking_id required' });
    }

    let query;
    if (req.user) {
      query = { $or: [{ user_id: req.user._id }, { customer_email: email }] };
    } else {
      query = { customer_email: email };
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    const enriched = await enrichBookings(bookings);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;