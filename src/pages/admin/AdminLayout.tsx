import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Film, Calendar, Ticket, BarChart3, ArrowLeft, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { path: '/admin/movies', label: 'Movies', icon: Film },
  { path: '/admin/showtimes', label: 'Showtimes', icon: Calendar },
  { path: '/admin/bookings', label: 'Bookings', icon: Ticket },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
      <div className="text-center">
        <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary mb-2">ACCESS DENIED</h1>
        <p className="text-text-muted mb-6">You don't have admin privileges.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );

  const sidebar = (
    <>
      <div className="p-5 border-b border-border">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent-glow">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-xl tracking-wider text-text-primary">CINEBOOK</span>
        </Link>
        <div className="flex items-center gap-1.5 mt-3">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span className="text-accent text-xs font-medium uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}>
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all">
          <ArrowLeft className="w-4 h-4" />Back to Site
        </Link>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent/5 transition-all">
          <LogOut className="w-4 h-4" />Sign Out
        </button>
      </div>
      <div className="p-4 border-t border-border">
        <p className="text-text-muted text-xs truncate">{user.email}</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-card border-b border-border h-14 flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-bg-surface text-text-primary">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span className="text-accent text-xs font-medium uppercase tracking-wider">Admin</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-bg-card border-r border-border z-50 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </aside>

      {/* Main */}
      <main className="lg:ml-64 p-4 sm:p-8 pt-18 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
