import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Movie from './models/Movie.js';
import Showtime from './models/Showtime.js';

// ✅ FIX PATH (same folder)
dotenv.config();

console.log("Mongo URI:", process.env.MONGODB_URI);

const movies = [
  {
    title: 'Shadow Protocol',
    genre: 'Action',
    rating: 8.7,
    duration_minutes: 142,
    description: 'A former covert operative is pulled back into the shadows.',
    poster_url: '/posters/poster1.jpg',
    release_year: 2025
  },
  {
    title: 'Nebula Rising',
    genre: 'Sci-Fi',
    rating: 9.1,
    duration_minutes: 156,
    description: 'Humanity’s last hope lies beyond the stars.',
    poster_url: '/posters/poster2.jpg',
    release_year: 2025
  }
];

const theaters = ['IMAX', 'PVR', 'INOX'];
const times = ['10:00 AM', '1:00 PM', '4:00 PM', '8:00 PM'];

async function seed() {
  try {
    // ✅ CONNECT USING ENV
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Clear DB
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Showtime.deleteMany({});

    // Users
    await User.create({
      email: 'admin@cinebook.com',
      password: 'admin123',
      name: 'Admin',
      role: 'admin'
    });

    await User.create({
      email: 'demo@cinebook.com',
      password: 'demo123',
      name: 'User',
      role: 'user'
    });

    console.log('✅ Users created');

    // Movies
    const createdMovies = await Movie.insertMany(movies);

    // Showtimes
    const showtimes = [];

    for (const movie of createdMovies) {
      for (let i = 0; i < 3; i++) {
        showtimes.push({
          movie_id: movie._id,
          theater: theaters[Math.floor(Math.random() * theaters.length)],
          date: '2025-07-20',
          time: times[Math.floor(Math.random() * times.length)],
          price: 200,
          available_seats: 50
        });
      }
    }

    await Showtime.insertMany(showtimes);

    console.log('✅ Seed completed');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();