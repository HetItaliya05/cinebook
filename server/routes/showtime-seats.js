import { Router } from 'express';
import Booking from '../models/Booking.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { showtime_id } = req.query;
    if (!showtime_id) return res.status(400).json({ error: 'showtime_id required' });
    const bookings = await Booking.find({ showtime_id });
    const allSeats = [];
    bookings.forEach(b => {
      if (b.seat_labels) {
        b.seat_labels.split(',').map(s => s.trim()).filter(Boolean).forEach(s => allSeats.push(s));
      }
    });
    res.json({ booked_seats: allSeats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
