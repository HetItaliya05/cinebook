import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Trash2, Film, ChevronLeft, ChevronRight, AlertCircle, Download } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../lib/AuthContext';


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

const PAGE_SIZE = 20;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminBookingsPage() {
  const { loading: authLoading } = useAuth(); // Use the correct property from AuthContext
  
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  // Memoize headers
  const headers = useMemo(() => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/admin/bookings?limit=200`, {
        headers: {
          Authorization: headers.Authorization
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bookings: ${res.statusText}`);
      }

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDelete = async (id: number) => {
    const booking = bookings.find(b => b.id === id);
    const confirmMsg = booking
      ? `Delete booking #${id} for ${booking.customer_name}?\n\nThis action cannot be undone.`
      : 'Delete this booking? This action cannot be undone.';

    if (!confirm(confirmMsg)) return;

    setDeleting(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to delete booking');
      }

      await fetchBookings();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Memoize filtered bookings
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return bookings;

    return bookings.filter((b) =>
      b.customer_name.toLowerCase().includes(searchLower) ||
      b.customer_email.toLowerCase().includes(searchLower) ||
      b.movie_title.toLowerCase().includes(searchLower) ||
      b.id.toString().includes(searchLower) ||
      b.theater?.toLowerCase().includes(searchLower) ||
      b.seat_labels?.toLowerCase().includes(searchLower)
    );
  }, [bookings, search]);

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filtered.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
  }, [filtered]);

  const formatDate = useCallback((dateStr: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }, []);

  const formatDateTime = useCallback((dateStr: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }, []);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (filtered.length === 0) {
      alert('No bookings to export');
      return;
    }

    const headers = [
      'ID', 'Movie', 'Customer Name', 'Customer Email', 'Theater',
      'Date', 'Time', 'Seats', 'Seat Labels', 'Total Price', 'Booked At'
    ];

    const rows = filtered.map(b => [
      b.id,
      b.movie_title,
      b.customer_name,
      b.customer_email,
      b.theater || '',
      b.show_date || '',
      b.show_time || '',
      b.seats,
      b.seat_labels || '',
      b.total_price,
      formatDateTime(b.created_at)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filtered, formatDateTime]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

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
        <h2 className="text-xl font-semibold text-text-primary">Failed to Load Bookings</h2>
        <p className="text-text-muted">{error}</p>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary">
            BOOKINGS
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''} · 
            ₹{totalRevenue.toLocaleString('en-IN')} revenue
          </p>
        </div>

        {filtered.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border hover:border-accent/30 text-text-secondary hover:text-text-primary text-sm rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      <div className="relative w-full sm:w-96 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email, movie, theater, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Search className="w-16 h-16 text-text-muted/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {search ? 'No Matching Bookings' : 'No Bookings Yet'}
            </h3>
            <p className="text-text-muted text-sm">
              {search 
                ? 'Try adjusting your search terms' 
                : 'Bookings will appear here once customers make reservations'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      Movie
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium hidden lg:table-cell">
                      Showtime
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      Seats
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium hidden md:table-cell">
                      Booked At
                    </th>
                    <th className="text-right px-4 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border/50 hover:bg-bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-accent font-medium">
                        #{b.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.movie_poster ? (
                            <img
                              src={b.movie_poster}
                              alt={b.movie_title}
                              className="w-8 h-11 object-cover rounded flex-shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-8 h-11 bg-bg-surface rounded flex items-center justify-center flex-shrink-0">
                              <Film className="w-4 h-4 text-text-muted" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-text-primary font-medium truncate max-w-[160px]">
                              {b.movie_title || 'Unknown'}
                            </p>
                            {b.movie_genre && (
                              <p className="text-[10px] text-text-muted">
                                {b.movie_genre}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary font-medium">
                          {b.customer_name}
                        </p>
                        <p className="text-[11px] text-text-muted truncate max-w-[180px]">
                          {b.customer_email}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {b.show_date && (
                          <p className="text-xs text-text-secondary">
                            {formatDate(b.show_date)} · {b.show_time || 'N/A'}
                          </p>
                        )}
                        {b.theater && (
                          <p className="text-[11px] text-text-muted truncate max-w-[140px]">
                            {b.theater}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary font-medium">
                          {b.seats}
                        </p>
                        {b.seat_labels && (
                          <p className="text-[10px] text-accent font-medium mt-0.5 truncate max-w-[100px]">
                            {b.seat_labels}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-success font-medium">
                        ₹{Number(b.total_price || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted hidden md:table-cell">
                        {formatDateTime(b.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deleting === b.id}
                            className="p-2 rounded-lg hover:bg-accent/10 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                            title="Delete booking"
                          >
                            {deleting === b.id ? (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-text-muted">
                  Page {page} of {totalPages} · Showing {paginated.length} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-bg-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-bg-surface text-text-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}