import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Clock, LogIn, Armchair, Film } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../lib/AuthContext';

interface EnrichedBooking {
  id: number;
  movie_id: number;
  showtime_id: number;
  customer_name: string;
  customer_email: string;
  seats: number;
  total_price: number;
  created_at: string;
  seat_labels: string;
  movie_title: string;
  movie_poster: string;
  movie_genre: string;
  theater: string;
  show_date: string;
  show_time: string;
  ticket_price: number;
}

export default function MyBookingsPage() {
  const { user, token, loading: authLoading } = useAuth();  // ✅ Changed session to token
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user?.email) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(user.email)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},  // ✅ Use token directly
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
    else setLoading(false);
  }, [user]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (authLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  if (!user) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <LogIn className="w-14 h-14 text-accent mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary mb-2">SIGN IN TO VIEW BOOKINGS</h2>
          <p className="text-text-secondary text-sm mb-6">Sign in to see your booking history.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow">Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wide text-text-primary mb-2">MY BOOKINGS</h1>
        <p className="text-text-secondary text-sm mb-8">Your booking history for {user.email}</p>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-4">No bookings yet</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow">Browse Movies</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="flex">
                  {b.movie_poster ? (
                    <img src={b.movie_poster} alt={b.movie_title} className="w-24 sm:w-32 object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-24 sm:w-32 bg-bg-surface flex items-center justify-center flex-shrink-0">
                      <Film className="w-8 h-8 text-text-muted" />
                    </div>
                  )}
                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary truncate">
                          {b.movie_title || `Movie #${b.movie_id}`}
                        </h3>
                        {b.movie_genre && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded-full">{b.movie_genre}</span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-text-muted flex-shrink-0">#{b.id}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm">
                      {b.show_date && (
                        <div className="flex items-center gap-1 text-text-secondary">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatDate(b.show_date)}</span>
                        </div>
                      )}
                      {b.show_time && (
                        <div className="flex items-center gap-1 text-text-secondary">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{b.show_time}</span>
                        </div>
                      )}
                      {b.theater && (
                        <div className="flex items-center gap-1 text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{b.theater}</span>
                        </div>
                      )}
                    </div>

                    {b.seat_labels && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-xs text-accent font-medium">Seats: {b.seat_labels}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-accent" />
                        <span className="text-text-primary text-sm font-medium">{b.seats} {b.seats === 1 ? 'ticket' : 'tickets'}</span>
                        {b.ticket_price > 0 && (
                          <span className="text-text-muted text-xs">× ₹{Number(b.ticket_price).toFixed(0)}</span>
                        )}
                      </div>
                      <span className="text-accent font-[family-name:var(--font-display)] text-xl">₹{(Number(b.total_price) || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}