import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, LogIn, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import SeatSelector from '../components/SeatSelector';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../lib/AuthContext';

interface Movie {
  id?: string;
  _id?: string;
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  description: string;
  poster_url: string;
  release_year: number;
}

interface Showtime {
  id?: string;
  _id?: string;
  movie_id?: string;
  movieId?: string;
  theater: string;
  date: string;
  time: string;
  price: number;
  available_seats: number;
}

interface BookingPayload {
  movie_id: string;
  showtime_id: string;
  customer_name: string;
  customer_email: string;
  seats: number;
  total_price: number;
  seat_labels: string;
}

const MAX_SEATS_PER_BOOKING = 10;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get ID from either id or _id
const getId = (obj: { id?: string; _id?: string } | null): string => {
  if (!obj) return '';
  return obj.id || obj._id || '';
};

export default function BookingPage() {
  const { movieId, showtimeId } = useParams<{ movieId: string; showtimeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, token } = useAuth();

  // State
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
<<<<<<< HEAD
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
=======
  const paymentMethod = 'razorpay' as const;
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

  // Auto-fill user details
  useEffect(() => {
    if (user) {
      setName(user.email?.split('@')[0] || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!movieId || !showtimeId) {
          throw new Error('Missing movieId or showtimeId');
        }

        console.log('🔍 Fetching data for movieId:', movieId, 'showtimeId:', showtimeId);

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [movieRes, showtimeRes, seatsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/movies?id=${movieId}`, { headers }),
          fetch(`${API_BASE_URL}/api/showtimes?movie_id=${movieId}`, { headers }),
          fetch(`${API_BASE_URL}/api/showtime-seats?showtime_id=${showtimeId}`, { headers }),
        ]);

        if (!movieRes.ok) throw new Error('Failed to load movie');
        if (!showtimeRes.ok) throw new Error('Failed to load showtimes');
        if (!seatsRes.ok) throw new Error('Failed to load seat information');

        const movieData: Movie = await movieRes.json();
        const showtimeData: Showtime[] = await showtimeRes.json();
        const seatsData = await seatsRes.json();

        console.log('✅ Movie Data:', movieData);
        console.log('✅ Showtime Data:', showtimeData);
        console.log('✅ Seats Data:', seatsData);

        setMovie(movieData);

        // Find showtime by comparing IDs
        const foundShowtime = showtimeData.find((s) => {
          const showId = getId(s);
          return showId === showtimeId;
        });

        if (!foundShowtime) {
          console.error('Available showtimes:', showtimeData.map((s) => ({ id: getId(s), time: s.time })));
          throw new Error(`Showtime with ID ${showtimeId} not found`);
        }

        console.log('✅ Found Showtime:', foundShowtime);
        setShowtime(foundShowtime);

        // Set booked seats
        if (seatsData?.booked_seats && Array.isArray(seatsData.booked_seats)) {
          console.log('✅ Booked Seats:', seatsData.booked_seats);
          setBookedSeatIds(new Set(seatsData.booked_seats));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('❌ Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, showtimeId, token]);

  // Handle seat toggle
  const handleToggleSeat = useCallback((seatId: string) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < MAX_SEATS_PER_BOOKING) {
        next.add(seatId);
      }
      return next;
    });
  }, []);

<<<<<<< HEAD
  // Create booking
  const createBooking = async (bookingPayload: BookingPayload, paymentId?: string) => {
=======
  // Create booking (only after payment is verified)
  const createBooking = async (bookingPayload: BookingPayload, paymentId: string) => {
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add payment info to payload
      const payloadWithPayment = {
        ...bookingPayload,
        payment_method: paymentMethod,
        payment_id: paymentId,
<<<<<<< HEAD
        payment_status: paymentId ? 'paid' : 'pending',
=======
        payment_status: 'paid',
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
      };

      console.log('📤 Sending booking:', payloadWithPayment);

      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payloadWithPayment),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Booking failed');
      }

      console.log('✅ Booking successful:', data);

      const bookingId = getId(data);

      // Send confirmation email (non-blocking)
      sendConfirmationEmail(bookingId);

      // Show success and redirect
      setSuccess('Booking confirmed! Redirecting...');
      setTimeout(() => {
        navigate(`/confirmation/${bookingId}`);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      console.error('❌ Booking error:', err);
    }
  };

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (selectedSeatIds.size === 0) {
      setError('Please select at least one seat');
      return;
    }

    if (!showtime || !movie) {
      setError('Missing booking information');
      return;
    }

    setSubmitting(true);

<<<<<<< HEAD
    // Prepare booking payload
    const bookingPayload: BookingPayload = {
      movie_id: getId(movie),
      showtime_id: getId(showtime),
      customer_name: name.trim(),
      customer_email: email.trim(),
      seats: selectedSeatIds.size,
      total_price: selectedSeatIds.size * Number(showtime.price),
      seat_labels: Array.from(selectedSeatIds).sort().join(', '),
    };

    // Create booking directly (COD only)
    await createBooking(bookingPayload);
=======
    try {
      // Prepare booking payload
      const bookingPayload: BookingPayload = {
        movie_id: getId(movie),
        showtime_id: getId(showtime),
        customer_name: name.trim(),
        customer_email: email.trim(),
        seats: selectedSeatIds.size,
        // Razorpay expects amount in INR (server will convert to paise)
        total_price: selectedSeatIds.size * Number(showtime.price),
        seat_labels: Array.from(selectedSeatIds).sort().join(', '),
      };

      const amount = Number(bookingPayload.total_price);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid total amount');
      }

      // 1) Create Razorpay order
      const orderRes = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `cinebook_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || orderData.message || 'Failed to create payment order');
      }

      // 2) Open Razorpay Checkout
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: amount * 100, // Razorpay checkout expects paise
          currency: 'INR',
          name: 'CineBook',
          description: 'Movie booking payment',
          order_id: orderData.id,
          prefill: {
            name: name.trim(),
            email: email.trim(),
          },
          theme: {
            color: '#3399cc',
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                throw new Error(verifyData.error || verifyData.message || 'Payment verification failed');
              }

              // 3) Create booking after successful verification
              await createBooking(bookingPayload, response.razorpay_payment_id);
              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error('Payment verification failed'));
            }
          },
        };

        if (!options.key) {
          reject(new Error('Missing VITE_RAZORPAY_KEY_ID. Set your Razorpay TEST key id in frontend env.'));
          return;
        }

        const RzpCtor = window.Razorpay;
        if (!RzpCtor) {
          reject(new Error('Razorpay checkout script not loaded. Add Razorpay checkout.js to your app.'));
          return;
        }

        const rzp = new RzpCtor(options);
        rzp.open();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      setError(errorMessage);
      console.error('❌ Booking error:', err);
      setSubmitting(false);
    }
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
  };

  // Send confirmation email (separate function, non-blocking)
  const sendConfirmationEmail = async (bookingId: string) => {
    try {
      const seatLabels = Array.from(selectedSeatIds).sort().join(', ');
      const total = selectedSeatIds.size * Number(showtime?.price || 0);

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #0066cc; text-align: center;">✅ Booking Confirmed!</h2>
          <p style="color: #333; font-size: 16px;">Dear <strong>${name}</strong>,</p>
          <p style="color: #666;">Your movie ticket booking has been confirmed. Here are your details:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc;">
            <h3 style="color: #0066cc; margin-top: 0;">${movie?.title}</h3>
            <p style="margin: 8px 0;"><strong>Theater:</strong> ${showtime?.theater}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${showtime?.date}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${showtime?.time}</p>
            <p style="margin: 8px 0;"><strong>Seats:</strong> <span style="color: #0066cc; font-weight: bold;">${seatLabels}</span></p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> <span style="color: #0066cc; font-weight: bold;">₹${total.toFixed(0)}</span></p>
            <p style="margin: 8px 0; padding-top: 8px; border-top: 1px solid #ddd;"><strong>Booking ID:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">${bookingId}</code></p>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc;"><strong>ℹ️ Important:</strong></p>
            <ul style="margin: 8px 0; color: #333; padding-left: 20px;">
              <li>Please arrive 15 minutes before the show time</li>
              <li>Bring a valid ID for verification</li>
              <li>Keep your booking ID handy</li>
            </ul>
          </div>

          <p style="color: #666; text-align: center; margin-top: 30px;">Thank you for booking with <strong>CineBook</strong>!</p>
          <p style="color: #999; text-align: center; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `;

      const emailRes = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.trim(),
          subject: `🎬 Booking Confirmation - ${movie?.title}`,
          html: emailHtml,
        }),
      });

      if (emailRes.ok) {
        console.log('✅ Confirmation email sent');
      } else {
        const errorData = await emailRes.json();
        console.warn('⚠️ Email send failed:', errorData.error);
      }
    } catch (emailError) {
      console.warn('⚠️ Email send failed (non-critical):', emailError);
      // Don't block booking if email fails
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <LogIn className="w-14 h-14 text-accent mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary mb-2">
            SIGN IN TO BOOK
          </h2>
          <p className="text-text-secondary text-sm mb-6">You need an account to book tickets.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-bg-card border border-border text-text-secondary rounded-lg hover:bg-bg-card-hover transition-colors"
            >
              Go Back
            </button>
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Data not found
  if (!movie || !showtime) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Not Found</h2>
          <p className="text-text-muted text-sm mb-6">{error || 'The movie or showtime could not be found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const seatCount = selectedSeatIds.size;
  const total = seatCount * Number(showtime.price);
  const totalTheaterSeats = 96;
  const availableCount = totalTheaterSeats - bookedSeatIds.size;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wide text-text-primary mb-8">
          CHOOSE YOUR SEATS
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Seat Selection */}
          <div className="lg:col-span-3 bg-bg-card border border-border rounded-xl p-4 sm:p-6">
            {availableCount > 0 ? (
              <SeatSelector
                selectedSeatIds={selectedSeatIds}
                bookedSeatIds={bookedSeatIds}
                onToggleSeat={handleToggleSeat}
                maxSelectable={Math.min(MAX_SEATS_PER_BOOKING, availableCount)}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-text-muted">❌ All seats are booked for this showtime</p>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card border border-border rounded-xl p-5"
            >
              <div className="flex gap-4">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x120?text=Movie';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-text-primary line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-text-muted text-xs mt-2">{showtime.theater}</p>
                  <p className="text-text-secondary text-sm mt-1">{formatDate(showtime.date)}</p>
                  <p className="text-accent font-semibold text-sm mt-1">{showtime.time}</p>
                </div>
              </div>
            </motion.div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-text-primary font-semibold">Booking Details</h3>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    required
                  />
                </div>
              </div>

<<<<<<< HEAD
              {/* Payment Method - Only COD available */}
=======
              {/* Payment Method - Razorpay */}
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                  Payment Method
                </label>
                <div className="flex items-center justify-center gap-2 py-3 bg-accent/10 border border-accent text-accent rounded-lg">
                  <Wallet className="w-4 h-4" />
<<<<<<< HEAD
                  <span className="text-sm font-medium">Pay at Theater</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Pay cash at the theater counter before the show
=======
                  <span className="text-sm font-medium">Pay with Razorpay</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Secure online payment via Razorpay
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
                </p>
              </div>

              {/* Selected Seats Summary */}
              {seatCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-surface/50 border border-border rounded-lg p-3"
                >
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">
                    Selected seats ({seatCount})
                  </p>
                  <p className="text-sm text-accent font-medium break-words">
                    {Array.from(selectedSeatIds).sort().join(', ')}
                  </p>
                </motion.div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {seatCount > 0 ? `${seatCount}x Ticket` : 'No seats selected'}
                  </span>
                  <span className="text-text-primary">₹{Number(showtime.price).toFixed(0)} each</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-text-primary">Total</span>
                  <span className="text-accent">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-green-500 text-sm">{success}</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || seatCount === 0 || availableCount === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg"
              >
                {submitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    {seatCount === 0
                      ? 'Select Seats to Continue'
<<<<<<< HEAD
                      : `Book ${seatCount} ${seatCount === 1 ? 'Ticket' : 'Tickets'} (Pay at Theater)`}
=======
                      : `Pay & Book ${seatCount} ${seatCount === 1 ? 'Ticket' : 'Tickets'}`}
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="text-xs text-text-muted text-center">
              <p>✓ Secure booking</p>
              <p>✓ Instant confirmation</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}