import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Star,
  Upload,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../lib/AuthContext';

interface Movie {
  _id?: string; // MongoDB
  id?: string;  // sometimes returned by APIs
  title: string;
  genre: string;
  rating: number;
  duration_minutes: number;
  description: string;
  poster_url: string;
  release_year: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emptyMovie: Movie = {
  title: '',
  genre: 'Action',
  rating: 7.0,
  duration_minutes: 120,
  description: '',
  poster_url: '',
  release_year: 2025,
};

const genres = [
  'Action',
  'Sci-Fi',
  'Drama',
  'Comedy',
  'Horror',
  'Animation',
  'Thriller',
  'Romance',
];

export default function AdminMoviesPage() {
  const { token: ctxToken } = useAuth();

  // support either storage key (depends on your AuthContext implementation)
  const token =
    ctxToken ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    '';

  const authHeaders = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/movies`);
      if (!res.ok) throw new Error(`Failed to load movies (${res.status})`);

      const data = await res.json();

      const list: Movie[] = Array.isArray(data) ? data : [];
      // normalize so frontend can reliably use movie.id too
      const formatted = list.map((m: any) => ({
        ...m,
        id: m._id ?? m.id, // keep real server id only (no fake ids)
      }));

      setMovies(formatted);
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openCreate = () => {
    setEditingMovie({ ...emptyMovie });
    setShowModal(true);
  };

  const openEdit = (m: Movie) => {
    setEditingMovie({ ...m, id: m._id ?? m.id });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMovie(null);
    setDragOver(false);
  };

  const updateField = (field: string, value: any) => {
    setEditingMovie((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!editingMovie) return;

    if (!token) {
      alert('You are not logged in as admin.');
      return;
    }

    // decide edit vs create based on REAL server id
    const movieId = editingMovie._id ?? editingMovie.id;
    const isEdit = Boolean(movieId);

    // avoid sending _id/id back (often causes issues with Mongo updates)
    const { _id, id, ...payload } = editingMovie;

    setSaving(true);
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/admin/movies/${movieId}`
        : `${API_BASE_URL}/api/admin/movies`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || d.message || 'Failed to save movie');

      closeModal();
      await fetchMovies();
    } catch (err: any) {
      alert(err?.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (movieId?: string) => {
    // FIX: never call DELETE with undefined
    if (!movieId) {
      console.error('Delete blocked: movieId is missing.');
      alert('Cannot delete: movie id is missing.');
      return;
    }

    if (!token) {
      alert('You are not logged in as admin.');
      return;
    }

    if (!window.confirm('Delete this movie? This will also delete its showtimes.')) return;

    setDeleting(movieId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/movies/${movieId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || d.message || 'Failed to delete movie');

      // Optimistic update (also avoids refetch delay)
      setMovies((prev) => prev.filter((m) => (m._id ?? m.id) !== movieId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete movie');
    } finally {
      setDeleting(null);
    }
  };

  const uploadFile = async (file: File) => {
    if (!token) {
      alert('You are not logged in as admin.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5 MB');
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          file_data: base64,
          file_name: file.name,
          content_type: file.type,
        }),
      });

      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || d.message || 'Upload failed');

      updateField('poster_url', d.url);
    } catch (err: any) {
      alert('Upload failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary">
            MOVIES
          </h1>
          <p className="text-text-muted text-sm mt-1">Manage your movie catalog</p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow"
        >
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Movie
                </th>
                <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Genre
                </th>
                <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Rating
                </th>
                <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Duration
                </th>
                <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Year
                </th>
                <th className="text-right px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {movies.map((m, idx) => {
                const movieId = m._id ?? m.id;

                // FIX: key is ALWAYS defined + unique (prevents React key warning)
                const rowKey = movieId ?? `${m.title}-${m.release_year}-${idx}`;

                const deleteDisabled = !movieId || deleting === movieId;

                return (
                  <tr
                    key={rowKey}
                    className="border-b border-border/50 hover:bg-bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.poster_url}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/80x112?text=Poster';
                          }}
                        />
                        <div>
                          <p className="text-sm text-text-primary font-medium">{m.title}</p>
                          <p className="text-xs text-text-muted truncate max-w-[200px]">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full">
                        {m.genre}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-gold">{m.rating}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-sm text-text-secondary">
                      {m.duration_minutes}m
                    </td>

                    <td className="px-5 py-3 text-sm text-text-secondary">{m.release_year}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 rounded-lg hover:bg-bg-surface text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(movieId)}
                          disabled={deleteDisabled}
                          className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!movieId ? 'Missing movie id' : 'Delete'}
                        >
                          {deleting === movieId ? (
                            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && editingMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary">
                  {editingMovie._id || editingMovie.id ? 'EDIT MOVIE' : 'ADD MOVIE'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-bg-surface text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                    Title
                  </label>
                  <input
                    value={editingMovie.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
                    placeholder="Movie title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Genre
                    </label>
                    <select
                      value={editingMovie.genre || 'Action'}
                      onChange={(e) => updateField('genre', e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    >
                      {genres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Year
                    </label>
                    <input
                      type="number"
                      value={editingMovie.release_year ?? 2025}
                      onChange={(e) => updateField('release_year', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editingMovie.rating ?? 7}
                      onChange={(e) => updateField('rating', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={editingMovie.duration_minutes ?? 120}
                      onChange={(e) =>
                        updateField('duration_minutes', parseInt(e.target.value))
                      }
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                    Poster
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {editingMovie.poster_url ? (
                    <div className="relative group rounded-xl overflow-hidden border border-border bg-bg-surface">
                      <img
                        src={editingMovie.poster_url}
                        alt="Poster preview"
                        className="w-full h-52 object-contain bg-bg-dark/50"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField('poster_url', '')}
                          className="flex items-center gap-2 px-4 py-2 bg-bg-surface/80 hover:bg-bg-surface text-text-primary text-xs font-medium rounded-lg transition-colors border border-border"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>

                      {uploading && (
                        <div className="absolute inset-0 bg-bg-dark/70 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-accent animate-spin" />
                            <span className="text-xs text-text-secondary">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        uploading
                          ? 'border-accent/40 bg-accent/5 cursor-wait'
                          : dragOver
                            ? 'border-accent bg-accent/10 scale-[1.01]'
                            : 'border-border hover:border-accent/40 hover:bg-bg-surface/50'
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-accent animate-spin" />
                          <span className="text-sm text-text-secondary">Uploading poster...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-text-muted" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-text-primary">
                              <span className="text-accent font-medium">Click to upload</span> or
                              drag and drop
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              JPG, PNG, WebP or GIF — max 5 MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">
                        or paste URL
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <input
                      value={editingMovie.poster_url || ''}
                      onChange={(e) => updateField('poster_url', e.target.value)}
                      className="w-full px-4 py-2 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted uppercase tracking-wider mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={editingMovie.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
                    placeholder="Movie description..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-5 border-t border-border">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-bg-surface border border-border text-text-secondary text-sm rounded-lg hover:bg-bg-card-hover transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-accent-glow"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}