import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema({
  movie_id: { type: Number, required: true },
  theater: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  available_seats: { type: Number, required: true, min: 0 }
}, { 
  timestamps: true 
});

// We map the virtual 'id' to the database '_id' so the frontend doesn't break
showtimeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

export const Showtime = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);