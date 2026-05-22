import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

type AnyId = string | number;

interface Movie {
  _id?: string;
  id?: AnyId;
  title: string;
  genre?: string;
  rating?: number;
  duration_minutes?: number;
  description?: string;
  poster_url?: string;
  posterUrl?: string;
  release_year?: number;
}

interface Showtime {
  _id?: string;
  id?: AnyId;
  movie_id?: AnyId;
  theater: string;
  date: string;
  time: string;
  price: number | string;
  available_seats?: number;
  availableSeats?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getDocId = (doc: any) => String(doc?._id ?? doc?.id ?? '');
const normalizeOne = <T,>(data: any): T | null => {
  if (!data) return null;
  return Array.isArray(data) ? (data[0] ?? null) : (data as T);
};

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [movieRes, showtimeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/movies?id=${encodeURIComponent(id)}`),
          fetch(`${API_BASE_URL}/api/showtimes?movie_id=${encodeURIComponent(id)}`),
        ]);

        if (!movieRes.ok) throw new Error(`Movie fetch failed: ${movieRes.status}`);
        if (!showtimeRes.ok) throw new Error(`Showtime fetch failed: ${showtimeRes.status}`);

        const movieJson = await movieRes.json();
        const showtimeJson = await showtimeRes.json();

        console.log('📊 API Responses:', { movieJson, showtimeJson });

        // Normalize movie (handle array or object)
        const normalizedMovie = normalizeOne<Movie>(movieJson);
        setMovie(normalizedMovie);

        // Normalize showtimes (ensure array)
        const list: Showtime[] = Array.isArray(showtimeJson) ? showtimeJson : [];
        setShowtimes(list);

        // Set first date as selected
        if (list.length > 0) {
          const sortedDates = [...new Set(list.map((s) => s.date))].sort();
          setSelectedDate(sortedDates[0] ?? '');
        } else {
          setSelectedDate('');
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load movie data');
        setMovie(null);
        setShowtimes([]);
        setSelectedDate('');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const dates = useMemo(() => {
    return [...new Set(showtimes.map((s) => s.date))].sort();
  }, [showtimes]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((s) => s.date === selectedDate);
  }, [showtimes, selectedDate]);

  const theaters = useMemo(() => {
    return [...new Set(filteredShowtimes.map((s) => s.theater))];
  }, [filteredShowtimes]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      };
    } catch {
      return { day: '?', date: 0, month: '?' };
    }
  };

  if (loading) {
    return (
      <div className="pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="pt-20 text-center">
        <p className="text-text-muted mb-4">Movie not found</p>
        {error && <p className="text-accent text-sm">{error}</p>}
      </div>
    );
  }

  const movieRealId = getDocId(movie) || String(id);
  const poster = movie.poster_url || movie.posterUrl || '';

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-[50vh] overflow-hidden">
        {poster ? (
          <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-bg-surface" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/85 to-bg-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6 items-end">
            {poster ? (
              <img
                src={poster}
                alt={movie.title}
                className="hidden sm:block w-40 h-60 object-cover rounded-xl shadow-2xl border border-border"
              />
            ) : (
              <div className="hidden sm:block w-40 h-60 rounded-xl bg-bg-surface border border-border" />
            )}

            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to movies
              </Link>

              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl tracking-wide text-text-primary mb-2">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-gold font-medium">{movie.rating ?? '-'}</span>
                </div>

                <span className="text-text-muted">•</span>

                {movie.genre && (
                  <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full border border-accent/30">
                    {movie.genre}
                  </span>
                )}

                <span className="text-text-muted">•</span>

                <div className="flex items-center gap-1 text-text-secondary text-sm">
                  <Clock className="w-3.5 h-3.5" /> {movie.duration_minutes ?? '-'} min
                </div>

                <span className="text-text-muted">•</span>

                <span className="text-text-secondary text-sm">{movie.release_year ?? '-'}</span>
              </div>

              <p className="text-text-secondary text-sm leading-relaxed max-w-xl">{movie.description ?? ''}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Showtimes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-text-primary mb-6">
          SELECT SHOWTIME
        </h2>

        {/* Date Selector */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />

          {dates.length > 0 ? (
            dates.map((date) => {
              const d = formatDate(date);
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[70px] transition-all ${
                    selectedDate === date
                      ? 'bg-accent text-white shadow-lg shadow-accent-glow'
                      : 'bg-bg-card border border-border text-text-secondary hover:border-accent/30'
                  }`}
                >
                  <span className="text-xs font-medium uppercase">{d.day}</span>
                  <span className="text-xl font-[family-name:var(--font-display)]">{d.date}</span>
                  <span className="text-xs">{d.month}</span>
                </button>
              );
            })
          ) : (
            <p className="text-text-muted text-sm">No dates available</p>
          )}
        </div>

        {/* Theaters & Times */}
        <div className="space-y-6">
          {theaters.length > 0 ? (
            theaters.map((theater) => (
              <motion.div
                key={theater}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-accent" />
                  <h3 className="text-text-primary font-medium">{theater}</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {filteredShowtimes
                    .filter((s) => s.theater === theater)
                    .map((showtime) => {
                      const showtimeRealId = getDocId(showtime);
                      const available = Number(showtime.available_seats ?? showtime.availableSeats ?? 0);

                      return (
                        <Link
                          key={showtimeRealId}
                          to={`/book/${movieRealId}/${showtimeRealId}`}
                          className={`group relative px-5 py-3 rounded-lg border transition-all ${
                            available > 0
                              ? 'border-border hover:border-accent bg-bg-surface hover:bg-bg-card-hover'
                              : 'border-border/50 bg-bg-surface/50 opacity-50 pointer-events-none'
                          }`}
                        >
                          <span className="text-text-primary font-medium text-sm">{showtime.time}</span>
                          <div className="flex items-center justify-between gap-4 mt-1">
                            <span className="text-xs text-text-muted">
                              ₹{Number(showtime.price).toFixed(0)}
                            </span>
                            <span
                              className={`text-xs ${
                                available > 20 ? 'text-success' : available > 5 ? 'text-gold' : 'text-accent'
                              }`}
                            >
                              {available} seats
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted">
                {selectedDate ? 'No showtimes available for this date' : 'Select a date to view showtimes'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}