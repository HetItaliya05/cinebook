import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  seats: { type: Number, required: true },
  seat_labels: { type: String, default: '' },
  total_price: { type: Number, required: true },
  payment_method: { type: String, enum: ['razorpay', 'cod'], default: 'cod' },
  payment_id: { type: String },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
