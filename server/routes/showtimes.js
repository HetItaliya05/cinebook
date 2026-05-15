import { Router } from 'express';
import Showtime from '../models/Showtime.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { movie_id } = req.query;
    
    let query = {};
    
    // Only filter by movie_id if one is actually provided in the URL
    // This allows the Admin page to load "All Movies" without crashing
    if (movie_id && movie_id !== 'all' && movie_id !== 'undefined') {
      query.movie_id = movie_id;
    }

    const showtimes = await Showtime.find(query).sort({ date: 1, time: 1 });
    
    // Ensure we always return an array, mapping _id to id for the frontend
    const results = showtimes.map(s => ({ 
      id: s._id, 
      ...s.toObject() 
    }));

    res.json(results);
  } catch (err) { 
    console.error("Public Showtimes Route Error:", err);
    // Return an empty array on error so the frontend map() doesn't crash
    res.status(500).json([]); 
  }
});

export default router;