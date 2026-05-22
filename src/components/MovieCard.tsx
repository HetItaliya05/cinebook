import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function MovieCard({ movie, index }: { movie: Movie; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/movie/${movie.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-bg-card border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent-glow/10">
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent opacity-80" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full border border-accent/30">
                {movie.genre}
              </span>
              <span className="text-xs text-text-muted">{movie.release_year}</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary mb-1 group-hover:text-accent transition-colors">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-gold font-medium">{movie.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-text-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>{movie.duration_minutes}m</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
