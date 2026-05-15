import { Router } from 'express';
import Showtime from '../../models/Showtime.js';
import Movie from '../../models/Movie.js'; // You'll need this for enriching data
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAdmin); // Re-enable admin protection

// GET all showtimes (enriched with movie titles)
router.get('/', async (req, res) => {
  try {
    const showtimes = await Showtime.find({}).sort({ date: -1, time: -1 });
    
    // Enrich with movie titles for a better admin UI
    const movieIds = [...new Set(showtimes.map(st => st.movie_id.toString()))];
    const movies = await Movie.find({ _id: { $in: movieIds } }).select('title');
    const movieMap = movies.reduce((acc, movie) => {
      acc[movie._id] = movie.title;
      return acc;
    }, {});

    const formattedShowtimes = showtimes.map(st => ({
      ...st.toObject(),
      id: st._id, // Ensure frontend gets 'id'
      movie_title: movieMap[st.movie_id] || 'Unknown/Deleted Movie',
    }));
    
    res.status(200).json(formattedShowtimes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new showtime
router.post('/', async (req, res) => {
  try {
    // Don't allow creating a showtime with an ID
    const { id, _id, ...showtimeData } = req.body;
    const newShowtime = new Showtime(showtimeData);
    await newShowtime.save();
    
    res.status(201).json({ ...newShowtime.toObject(), id: newShowtime._id });
  } catch (err) {
    // Provide more detailed validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- FIX IS HERE ---
// UPDATE an existing showtime by ID (from URL parameter)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL
    const { _id, ...updates } = req.body; // Get update data from body, ignore any passed ID

    const updatedShowtime = await Showtime.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedShowtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    console.log('✅ Showtime updated:', updatedShowtime._id);
    res.json({ ...updatedShowtime.toObject(), id: updatedShowtime._id });
  } catch (err) {
    console.error('❌ Showtime update error:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- AND HERE ---
// DELETE a showtime by ID (from URL parameter)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL
    const deletedShowtime = await Showtime.findByIdAndDelete(id);

    if (!deletedShowtime) {
      return res.status(404).json({ error: 'Showtime not found' });
    }

    res.status(200).json({ ok: true, message: 'Showtime deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;