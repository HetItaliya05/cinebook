import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// 1. Define the Mongoose Model so MongoDB knows what a showtime looks like
const showtimeSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.Mixed, required: true }, 
  theater: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  available_seats: { type: Number, required: true }
}, { timestamps: true });

// This ensures the database '_id' is sent to the frontend simply as 'id'
showtimeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Showtime = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);

// ---------------------------------------------------------
// GET: Fetch all showtimes (This will fix the blank page)
// ---------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const showtimes = await Showtime.find({});
    res.status(200).json(showtimes);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// POST: Create a new showtime
// ---------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const newShowtime = await Showtime.create(req.body);
    res.status(201).json(newShowtime);
  } catch (err) {
    console.error('Create error:', err);
    res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// PUT: Update an existing showtime
// ---------------------------------------------------------
router.put('/', async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    
    const updated = await Showtime.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Support for /api/admin/showtimes/:id format
router.put('/:id', async (req, res) => {
  try {
    const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// DELETE: Remove a showtime
// ---------------------------------------------------------
router.delete('/', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    
    await Showtime.findByIdAndDelete(id);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Support for /api/admin/showtimes/:id format
router.delete('/:id', async (req, res) => {
  try {
    await Showtime.findByIdAndDelete(req.params.id);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;