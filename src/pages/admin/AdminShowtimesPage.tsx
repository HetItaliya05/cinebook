import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, MapPin, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../lib/AuthContext';

// Standardized interfaces
interface Movie { 
  _id: string; 
  id: string; 
  title: string; 
}

interface Showtime {
  _id?: string;
  id?: string; 
  movie_id: string; 
  theater: string; 
  date: string; 
  time: string; 
  price: number; 
  available_seats: number;
}

interface FormErrors {
  movie_id?: string;
  theater?: string;
  date?: string;
  time?: string;
  price?: string;
  available_seats?: string;
}

const theaters = [
  'IMAX Grand Cinema', 
  'Dolby Atmos Theater', 
  'Starlight Multiplex', 
  'The Reel House'
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminShowtimesPage() {
  const { loading: authLoading } = useAuth(); 
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<string | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Showtime> | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Memoize headers to prevent recreation on every render
  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    };
  }, []);

  // Normalize ID helper
  const normalizeId = useCallback((obj: any): string => {
    return (obj._id || obj.id || '').toString();
  }, []);

  // Fetch data with better error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parallel fetch for better performance
      const [moviesRes, showtimesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/movies`),
        fetch(`${API_BASE_URL}/api/showtimes`)
      ]);

      if (!moviesRes.ok) {
        throw new Error(`Failed to fetch movies: ${moviesRes.statusText}`);
      }
      if (!showtimesRes.ok) {
        throw new Error(`Failed to fetch showtimes: ${showtimesRes.statusText}`);
      }

      const [moviesData, showtimesData] = await Promise.all([
        moviesRes.json(),
        showtimesRes.json()
      ]);

      // Normalize movies
      const formattedMovies = Array.isArray(moviesData) 
        ? moviesData.map((m: any) => {
            const id = normalizeId(m);
            return { 
              ...m, 
              _id: id,
              id: id
            };
          }) 
        : [];
      setMovies(formattedMovies);

      // Normalize showtimes
      const formattedShowtimes = Array.isArray(showtimesData)
        ? showtimesData.map((s: any) => {
            const id = normalizeId(s);
            return { 
              ...s, 
              _id: id,
              id: id,
              movie_id: normalizeId({ _id: s.movie_id, id: s.movie_id })
            };
          })
        : [];
      setShowtimes(formattedShowtimes);
      
    } catch (err) { 
      console.error("Fetch Data Error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setShowtimes([]);
      setMovies([]);
    } finally { 
      setLoading(false); 
    }
  }, [normalizeId]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Helper to resolve movie title safely with memoization
  const movieName = useCallback((id: any): string => {
    if (!id) return "Unknown Movie";
    const idStr = id.toString();
    const movie = movies.find((m) => 
      m._id === idStr || m.id === idStr
    );
    return movie ? movie.title : `Movie (${idStr.substring(0, 8)}...)`;
  }, [movies]);

  // Validate form
  const validateForm = useCallback((data: Partial<Showtime>): FormErrors => {
    const errors: FormErrors = {};

    if (!data.movie_id) {
      errors.movie_id = 'Please select a movie';
    }
    if (!data.theater) {
      errors.theater = 'Please select a theater';
    }
    if (!data.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }
    if (!data.time) {
      errors.time = 'Time is required';
    } else if (!/^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i.test(data.time)) {
      errors.time = 'Invalid time format (e.g., 7:30 PM)';
    }
    if (!data.price || data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!data.available_seats || data.available_seats < 0) {
      errors.available_seats = 'Seats must be 0 or greater';
    } else if (data.available_seats > 500) {
      errors.available_seats = 'Seats cannot exceed 500';
    }

    return errors;
  }, []);

  const openCreate = useCallback(() => {
    if (movies.length === 0) {
      alert("No movies available. Please add movies first.");
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const firstId = normalizeId(movies[0]);
    
    setEditing({ 
      movie_id: firstId, 
      theater: theaters[0], 
      date: today, 
      time: '12:00 PM', 
      price: 250, 
      available_seats: 50 
    });
    setFormErrors({});
    setShowModal(true);
  }, [movies, normalizeId]);

  const openEdit = useCallback((s: Showtime) => { 
    setEditing({ 
      ...s, 
      movie_id: normalizeId({ _id: s.movie_id, id: s.movie_id })
    }); 
    setFormErrors({});
    setShowModal(true); 
  }, [normalizeId]);
  
  const closeModal = useCallback(() => { 
    setShowModal(false); 
    setEditing(null); 
    setFormErrors({});
  }, []);

  const updateField = useCallback((field: keyof Showtime, value: any) => {
    setEditing((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    
    // Clear error for this field when user updates it
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof FormErrors];
      return newErrors;
    });
  }, []);

  const handleSave = async () => {
    if (!editing) return;

    // Validate form
    const errors = validateForm(editing);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const showtimeId = editing._id || editing.id;
      const isEdit = !!showtimeId;
      const url = isEdit 
        ? `${API_BASE_URL}/api/admin/showtimes/${showtimeId}` 
        : `${API_BASE_URL}/api/admin/showtimes`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(editing),
      });

      if (!res.ok) { 
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `Failed to save showtime (${res.status})`); 
      }
      
      closeModal();
      await fetchData(); 
    } catch (err: any) { 
      console.error('Save error:', err);
      alert(err.message || 'Failed to save showtime'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id: any) => {
    const showtime = showtimes.find(s => s.id === id);
    const movieTitle = showtime ? movieName(showtime.movie_id) : 'this showtime';
    
    if (!confirm(`Are you sure you want to delete the showtime for "${movieTitle}"?`)) {
      return;
    }
    
    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/showtimes/${id}`, { 
        method: 'DELETE', 
        headers 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to delete showtime');
      }
      
      await fetchData();
    } catch (err: any) { 
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete showtime'); 
    } finally { 
      setDeleting(null); 
    }
  };

  // Memoize filtered showtimes
  const filteredShowtimes = useMemo(() => {
    if (selectedMovie === 'all') return showtimes;
    return showtimes.filter(s => s.movie_id === selectedMovie);
  }, [selectedMovie, showtimes]);

  // Sort showtimes by date and time
  const sortedShowtimes = useMemo(() => {
    return [...filteredShowtimes].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [filteredShowtimes]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-16 h-16 text-accent" />
        <h2 className="text-xl font-semibold text-text-primary">Failed to Load Data</h2>
        <p className="text-text-muted">{error}</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary">
            SHOWTIMES
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage screening schedules ({showtimes.length} total)
          </p>
        </div>
        <button 
          onClick={openCreate} 
          disabled={movies.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow"
        >
          <Plus className="w-4 h-4" /> Add Showtime
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        <button 
          onClick={() => setSelectedMovie('all')} 
          className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
            selectedMovie === 'all' 
              ? 'bg-accent text-white shadow-md shadow-accent-glow' 
              : 'bg-bg-card border border-border text-text-secondary hover:border-accent/30'
          }`}
        >
          All Movies ({showtimes.length})
        </button>
        {movies.map((m) => {
          const count = showtimes.filter(s => s.movie_id === m.id).length;
          return (
            <button 
              key={m.id} 
              onClick={() => setSelectedMovie(m.id)} 
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
                selectedMovie === m.id 
                  ? 'bg-accent text-white shadow-md shadow-accent-glow' 
                  : 'bg-bg-card border border-border text-text-secondary hover:border-accent/30'
              }`}
            >
              {m.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {sortedShowtimes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MapPin className="w-16 h-16 text-text-muted/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Showtimes Found</h3>
            <p className="text-text-muted text-sm mb-6">
              {selectedMovie === 'all' 
                ? 'Get started by adding your first showtime' 
                : 'No showtimes for this movie yet'}
            </p>
            {movies.length > 0 && (
              <button 
                onClick={openCreate}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg transition-colors"
              >
                Add Showtime
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Movie
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Theater
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Time
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Price
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Seats
                  </th>
                  <th className="text-right px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedShowtimes.map((s) => (
                  <tr 
                    key={s.id} 
                    className="border-b border-border/50 hover:bg-bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-text-primary font-medium">
                      {movieName(s.movie_id)}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="truncate">{s.theater}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {new Date(s.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary font-medium">
                      {s.time}
                    </td>
                    <td className="px-5 py-3 text-sm text-success font-medium">
                      ₹{s.price.toFixed(0)}
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`font-medium ${
                        s.available_seats > 20 
                          ? 'text-success' 
                          : s.available_seats > 5 
                            ? 'text-gold' 
                            : 'text-accent'
                      }`}>
                        {s.available_seats}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEdit(s)} 
                          className="p-2 rounded-lg hover:bg-bg-surface text-text-muted hover:text-text-primary transition-colors"
                          title="Edit showtime"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          disabled={deleting === s.id} 
                          className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                          title="Delete showtime"
                        >
                          {deleting === s.id ? (
                            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && editing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
            onClick={closeModal}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary">
                  {(editing._id || editing.id) ? 'EDIT SHOWTIME' : 'ADD SHOWTIME'}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-1.5 rounded-lg hover:bg-bg-surface text-text-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Movie Selection */}
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                    Movie <span className="text-accent">*</span>
                  </label>
                  <select 
                    value={editing.movie_id || ''} 
                    onChange={(e) => updateField('movie_id', e.target.value)} 
                    className={`w-full px-4 py-2.5 bg-bg-surface border ${
                      formErrors.movie_id ? 'border-accent' : 'border-border'
                    } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                  {formErrors.movie_id && (
                    <p className="text-xs text-accent mt-1">{formErrors.movie_id}</p>
                  )}
                </div>

                {/* Theater Selection */}
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                    Theater <span className="text-accent">*</span>
                  </label>
                  <select 
                    value={editing.theater || ''} 
                    onChange={(e) => updateField('theater', e.target.value)} 
                    className={`w-full px-4 py-2.5 bg-bg-surface border ${
                      formErrors.theater ? 'border-accent' : 'border-border'
                    } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                  >
                    {theaters.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {formErrors.theater && (
                    <p className="text-xs text-accent mt-1">{formErrors.theater}</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Date <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="date" 
                      value={editing.date || ''} 
                      onChange={(e) => updateField('date', e.target.value)} 
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2.5 bg-bg-surface border ${
                        formErrors.date ? 'border-accent' : 'border-border'
                      } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                    />
                    {formErrors.date && (
                      <p className="text-xs text-accent mt-1">{formErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Time <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={editing.time || ''} 
                      onChange={(e) => updateField('time', e.target.value)} 
                      placeholder="7:30 PM" 
                      className={`w-full px-4 py-2.5 bg-bg-surface border ${
                        formErrors.time ? 'border-accent' : 'border-border'
                      } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                    />
                    {formErrors.time && (
                      <p className="text-xs text-accent mt-1">{formErrors.time}</p>
                    )}
                  </div>
                </div>

                {/* Price and Seats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Price (₹) <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={editing.price || ''} 
                      onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)} 
                      min="0"
                      step="10"
                      className={`w-full px-4 py-2.5 bg-bg-surface border ${
                        formErrors.price ? 'border-accent' : 'border-border'
                      } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                    />
                    {formErrors.price && (
                      <p className="text-xs text-accent mt-1">{formErrors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Available Seats <span className="text-accent">*</span>
                    </label>
                    <input 
                      type="number" 
                      value={editing.available_seats || ''} 
                      onChange={(e) => updateField('available_seats', parseInt(e.target.value) || 0)} 
                      min="0"
                      max="500"
                      className={`w-full px-4 py-2.5 bg-bg-surface border ${
                        formErrors.available_seats ? 'border-accent' : 'border-border'
                      } rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors`}
                    />
                    {formErrors.available_seats && (
                      <p className="text-xs text-accent mt-1">{formErrors.available_seats}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-border">
                <button 
                  onClick={closeModal} 
                  disabled={saving}
                  className="px-4 py-2.5 bg-bg-surface border border-border text-text-secondary text-sm rounded-lg hover:bg-bg-card-hover transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Showtime
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}