import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  duration_minutes: { type: Number, required: true },
  description: { type: String, default: '' },
  poster_url: { type: String, default: '' },
  release_year: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);
