import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Film, Ticket, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../lib/AuthContext';

interface RecentBooking {
  id: number;
  movie_title: string;
  customer_name: string;
  customer_email: string;
  show_date: string;
  show_time: string;
  theater: string;
  seats: number;
  seat_labels: string;
  total_price: number;
  created_at: string;
}

interface Stats {
  total_movies: number;
  total_bookings: number;
  total_revenue: number;
  total_tickets: number;
  recent_bookings: RecentBooking[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.statusText}`);
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Fetch stats error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const formatCurrency = useCallback((amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }, []);

  // Calculate average ticket price
  const averageTicketPrice = useMemo(() => {
    if (!stats || stats.total_tickets === 0) return 0;
    return stats.total_revenue / stats.total_tickets;
  }, [stats]);

  const statCards = useMemo(() => [
    { 
      label: 'Total Movies', 
      value: stats?.total_movies || 0, 
      icon: Film, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      trend: null
    },
    { 
      label: 'Total Bookings', 
      value: stats?.total_bookings || 0, 
      icon: Ticket, 
      color: 'text-accent', 
      bg: 'bg-accent/10',
      trend: null
    },
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats?.total_revenue || 0), 
      icon: DollarSign, 
      color: 'text-success', 
      bg: 'bg-success/10',
      subtitle: averageTicketPrice > 0 ? `Avg: ${formatCurrency(averageTicketPrice)}` : null
    },
    { 
      label: 'Tickets Sold', 
      value: stats?.total_tickets || 0, 
      icon: Users, 
      color: 'text-gold', 
      bg: 'bg-gold/10',
      trend: null
    },
  ], [stats, averageTicketPrice, formatCurrency]);

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
        <h2 className="text-xl font-semibold text-text-primary">Failed to Load Dashboard</h2>
        <p className="text-text-muted">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary">
          DASHBOARD
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Overview of your cinema operations
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted text-sm font-medium">
                {stat.label}
              </span>
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className={`font-[family-name:var(--font-display)] text-3xl ${stat.color} leading-none mb-1`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('en-IN') : stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-text-muted mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Summary */}
      {stats && stats.total_bookings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Avg Seats/Booking</span>
            </div>
            <p className="text-2xl font-semibold text-text-primary">
              {(stats.total_tickets / stats.total_bookings).toFixed(1)}
            </p>
          </div>
          
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Avg Booking Value</span>
            </div>
            <p className="text-2xl font-semibold text-text-primary">
              {formatCurrency(stats.total_revenue / stats.total_bookings)}
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Movies per Booking</span>
            </div>
            <p className="text-2xl font-semibold text-text-primary">
              {stats.total_movies > 0 ? (stats.total_bookings / stats.total_movies).toFixed(1) : '0'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary">
              RECENT BOOKINGS
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Latest {stats?.recent_bookings?.length || 0} bookings
            </p>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {(!stats?.recent_bookings || stats.recent_bookings.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Ticket className="w-16 h-16 text-text-muted/30 mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Bookings Yet</h3>
            <p className="text-text-muted text-sm">
              Bookings will appear here once customers start making reservations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-surface/30">
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Movie
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium hidden md:table-cell">
                    Showtime
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Seats
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map((b, index) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="border-b border-border/50 hover:bg-bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-mono text-accent font-medium">
                      #{b.id}
                    </td>
                    <td className="px-5 py-3 text-sm text-text-primary font-medium">
                      {b.movie_title || 'Unknown'}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-primary font-medium">
                        {b.customer_name}
                      </p>
                      <p className="text-[11px] text-text-muted truncate max-w-[180px]">
                        {b.customer_email}
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
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
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-primary font-medium">
                        {b.seats}
                      </p>
                      {b.seat_labels && (
                        <p className="text-[10px] text-accent font-medium truncate max-w-[100px]">
                          {b.seat_labels}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-success font-medium">
                      {formatCurrency(Number(b.total_price || 0))}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Additional Info */}
      {stats && stats.total_bookings > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-center text-xs text-text-muted"
        >
          <p>
            Dashboard updates in real-time · Last updated: {new Date().toLocaleTimeString('en-IN')}
          </p>
        </motion.div>
      )}
    </div>
  );
}