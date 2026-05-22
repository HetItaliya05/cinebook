import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Star, TrendingUp, Code } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  description: string;
  poster_url: string;
  release_year: number;
}

const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Animation', 'Thriller'];

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = async (genre: string) => {
  setLoading(true);
  try {
    const params = genre !== 'All' ? `?genre=${genre}` : '';
    const res = await fetch(`http://localhost:5000/api/movies${params}`);

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    setMovies(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Fetch error:', err);
    setMovies([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMovies(selectedGenre);
  }, [selectedGenre]);

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featured = movies[0];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      {featured && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-[60vh] sm:h-[70vh] overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src={featured.poster_url}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-bg-dark/40" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-accent text-sm font-medium uppercase tracking-wider">Featured</span>
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-7xl tracking-wide text-text-primary mb-3">
                  {featured.title}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-gold font-medium">{featured.rating}</span>
                  </div>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">{featured.genre}</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">{featured.duration_minutes} min</span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">{featured.release_year}</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                  {featured.description}
                </p>
                <Link
                  to={`/movie/${featured.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-all shadow-lg shadow-accent-glow hover:shadow-xl hover:shadow-accent-glow"
                >
                  Book Tickets
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-accent text-white shadow-md shadow-accent-glow'
                    : 'bg-bg-card text-text-secondary border border-border hover:border-accent/30 hover:text-text-primary'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary mb-6">
          {selectedGenre === 'All' ? 'NOW SHOWING' : selectedGenre.toUpperCase()}
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredMovies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">&copy; 2026 CineBook. All rights reserved.</p>
          <Link
            to="/setup-guide"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            Developer Setup Guide (VS Code + MongoDB)
          </Link>
        </div>
      </footer>
    </div>
  );
}
