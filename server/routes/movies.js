// import { Router } from 'express';
// import Movie from '../models/Movie.js';

// const router = Router();

// //
// // ✅ GET MOVIES OR SINGLE MOVIE
// //
// router.get('/', async (req, res) => {

//   console.log("🔥 Movies route hit");
  
//   try {
//     const { id, genre } = req.query;

//     // 🎬 GET SINGLE MOVIE
//     if (id) {
//       const movie = await Movie.findById(id);

//       if (!movie) {
//         return res.status(404).json({ error: 'Movie not found' });
//       }

//       return res.json({
//         id: movie._id,
//         title: movie.title,
//         genre: movie.genre,
//         rating: movie.rating,
//         duration_minutes: movie.duration_minutes,
//         description: movie.description,
//         poster_url: movie.poster_url,
//         release_year: movie.release_year,
//       });
//     }

//     // 🎬 GET ALL MOVIES
//     let query = {};

//     if (genre && genre !== 'All') {
//       query.genre = genre;
//     }

//     const movies = await Movie.find(query).sort({ rating: -1 });

//     // ⚠️ If DB empty → return fallback data (important)
//     if (movies.length === 0) {
//       return res.json([
//         {
//           id: "1",
//           title: "Avengers",
//           genre: "Action",
//           rating: 8.5,
//           duration_minutes: 120,
//           description: "Sample movie (DB empty)",
//           poster_url: "https://via.placeholder.com/300",
//           release_year: 2020,
//         }
//       ]);
//     }

//     // ✅ CLEAN RESPONSE
//     const formatted = movies.map((m) => ({
//       id: m._id,
//       title: m.title,
//       genre: m.genre,
//       rating: m.rating,
//       duration_minutes: m.duration_minutes,
//       description: m.description,
//       poster_url: m.poster_url,
//       release_year: m.release_year,
//     }));

//     res.json(formatted);

//   } catch (err) {
//     console.error("Movies error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import { Router } from 'express';
import Movie from '../models/Movie.js';

const router = Router();

//
// ✅ GET ALL MOVIES OR SINGLE MOVIE
//
router.get('/', async (req, res) => {
  console.log("🔥 Movies route hit");

  try {
    const { id, genre } = req.query;

    //
    // 🎬 GET SINGLE MOVIE
    //
    if (id) {
      const movie = await Movie.findById(id);

      if (!movie) {
        return res.status(404).json({
          success: false,
          error: 'Movie not found',
        });
      }

      return res.status(200).json({
        success: true,
        movie: {
          id: movie._id.toString(),
          title: movie.title,
          genre: movie.genre,
          rating: movie.rating,
          duration_minutes: movie.duration_minutes,
          description: movie.description,
          poster_url: movie.poster_url,
          release_year: movie.release_year,
        },
      });
    }

    //
    // 🎬 GET ALL MOVIES
    //
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    const movies = await Movie.find(query).sort({ rating: -1 });

    //
    // ⚠️ IF DATABASE EMPTY
    //
    if (movies.length === 0) {
      return res.status(200).json({
        success: true,
        movies: [
          {
            id: "1",
            title: "Avengers",
            genre: "Action",
            rating: 8.5,
            duration_minutes: 120,
            description: "Sample movie (DB empty)",
            poster_url: "https://via.placeholder.com/300",
            release_year: 2020,
          },
        ],
      });
    }

    //
    // ✅ FORMAT RESPONSE
    //
    const formattedMovies = movies.map((movie) => ({
      id: movie._id.toString(),
      title: movie.title,
      genre: movie.genre,
      rating: movie.rating,
      duration_minutes: movie.duration_minutes,
      description: movie.description,
      poster_url: movie.poster_url,
      release_year: movie.release_year,
    }));

    return res.status(200).json({
      success: true,
      count: formattedMovies.length,
      movies: formattedMovies,
    });

  } catch (err) {
    console.error("❌ Movies Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
});

export default router;