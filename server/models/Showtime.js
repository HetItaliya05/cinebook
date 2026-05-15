import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theater: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  available_seats: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Showtime', showtimeSchema);
