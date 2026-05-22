import { Router } from 'express';
import Movie from '../../models/Movie.js';
import Showtime from '../../models/Showtime.js';
<<<<<<< HEAD
// import { requireAdmin } from '../../middleware/auth.js';
=======
import { requireAdmin } from '../../middleware/auth.js';
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
import { sendNewMovieNotification } from '../../services/emailService.js';
import User from '../../models/User.js';

const router = Router();

<<<<<<< HEAD
// router.use(requireAdmin);
=======
router.use(requireAdmin);

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

/**
 * CREATE
 * POST /api/admin/movies
 */
router.post('/', async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    
    // ✅ MOVED INSIDE: Only run after movie is created
    try {
      const allUsers = await User.find({ isActive: true }).select('email');
      const emails = allUsers.map(u => u.email);

      // Send notification (non-blocking)
      sendNewMovieNotification({
        movieTitle: movie.title,
        movieGenre: movie.genre,
        movieRating: movie.rating,
         moviePoster: movie.poster_url?.startsWith('http') 
    ? movie.poster_url 
    : `${process.env.SERVER_URL || 'http://localhost:5000'}${movie.poster_url}`,
        releaseYear: movie.release_year,
        description: movie.description,
      }, emails).catch(err => console.error('Movie notify error:', err));
    } catch (notifyErr) {
      // Don't fail the movie creation if notification fails
      console.error('Failed to send movie notification:', notifyErr.message);
    }
    
    res.status(201).json({ ...movie.toObject(), id: movie._id });
  } catch (err) {
    console.error('Save Movie Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * (Optional but useful) READ ONE
 * GET /api/admin/movies/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json({ ...movie.toObject(), id: movie._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE
 * PUT /api/admin/movies/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id, _id, ...updates } = req.body;

    const movie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    res.json({ ...movie.toObject(), id: movie._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE
 * DELETE /api/admin/movies/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    await Showtime.deleteMany({ movie_id: id });
    await Movie.findByIdAndDelete(id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Backward compatibility
 */
router.delete('/', async (req, res) => {
  try {
    const id = req.body.id || req.body._id;
    if (!id) return res.status(400).json({ error: 'Movie ID is required for deletion' });

    await Showtime.deleteMany({ movie_id: id });
    await Movie.findByIdAndDelete(id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;