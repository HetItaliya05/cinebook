import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import BookingPage from './pages/BookingPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminShowtimesPage from './pages/admin/AdminShowtimesPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import SetupGuidePage from './pages/SetupGuidePage';


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/movie/:id" element={<><Navbar /><MoviePage /></>} />
            <Route path="/book/:movieId/:showtimeId" element={<><Navbar /><BookingPage /></>} />
            <Route path="/confirmation/:bookingId" element={<><Navbar /><ConfirmationPage /></>} />
            <Route path="/my-bookings" element={<><Navbar /><MyBookingsPage /></>} />
            <Route path="/setup-guide" element={<><Navbar /><SetupGuidePage /></>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="movies" element={<AdminMoviesPage />} />
              <Route path="showtimes" element={<AdminShowtimesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
