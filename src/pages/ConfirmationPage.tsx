import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Home,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  Mail,
  AlertCircle,
  Download,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../lib/AuthContext';

interface BookingDetails {
  _id?: string;
  id?: string;
  movie_title: string;
  movie_poster: string;
  movie_genre: string;
  theater: string;
  show_date: string;
  show_time: string;
  seats: number;
  seat_labels: string;
  total_price: number;
  ticket_price: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500;

export default function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailStatus] = useState<'sending' | 'sent' | 'failed'>('sent');
  const [debugInfo, setDebugInfo] = useState('');
  const [downloading, setDownloading] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  const qrValue = JSON.stringify({
    bookingId,
    app: 'CineBook',
    movie: booking?.movie_title,
    seats: booking?.seat_labels,
    date: booking?.show_date,
    time: booking?.show_time,
  });

  // Fetch booking details with retry logic
  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided in URL');
      setLoading(false);
      return;
    }

    const fetchBooking = async (attempt: number = 0) => {
      try {
        if (attempt > 0) {
          setDebugInfo(`Booking not found. Retrying...`);
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, { headers });

        if (!res.ok) {
          if (res.status === 404 && attempt < MAX_RETRIES - 1) {
            setTimeout(() => fetchBooking(attempt + 1), RETRY_DELAY);
            return;
          } else {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Booking not found after ${MAX_RETRIES} attempts.`);
          }
        }

        const data = await res.json();
        console.log('✅ Booking data loaded:', data);

        if (!data._id && !data.id) {
          throw new Error('Booking data is missing a valid ID.');
        }

        setBooking(data);
        setDebugInfo('');
        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load booking details';
        setError(errorMessage);
        setDebugInfo(`Failed after ${MAX_RETRIES} attempts.`);
        setLoading(false);
      }
    };

    setLoading(true);
    fetchBooking(0);
  }, [bookingId, token]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ────────────── DOWNLOAD AS SINGLE-PAGE PDF (NO GLITCH) ──────────────
  const downloadTicket = async () => {
  if (!booking || !ticketRef.current) return;

  setDownloading(true);
  try {
    // Temporarily make it visible (but behind everything)
    ticketRef.current.style.visibility = 'visible';
    ticketRef.current.style.zIndex = '-1';

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    // Hide again immediately
    ticketRef.current.style.visibility = 'hidden';

    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const maxWidth = pdfWidth - margin * 2;
    const maxHeight = pdfHeight - margin * 2;

    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = maxWidth / maxHeight;

    let imgWidth, imgHeight;

    if (canvasRatio > pageRatio) {
      imgWidth = maxWidth;
      imgHeight = maxWidth / canvasRatio;
    } else {
      imgHeight = maxHeight;
      imgWidth = maxHeight * canvasRatio;
    }

    const xPos = (pdfWidth - imgWidth) / 2;
    const yPos = (pdfHeight - imgHeight) / 2;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
    pdf.save(`CineBook-Ticket-${bookingId}.pdf`);
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    alert('Failed to download ticket. Please try again.');
  } finally {
    setDownloading(false);
    if (ticketRef.current) {
      ticketRef.current.style.visibility = 'hidden';
    }
  }
};

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          {debugInfo && <p className="text-text-secondary text-sm mt-4">{debugInfo}</p>}
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-bg-card border border-border rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Booking Not Found</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-20 min-h-screen flex items-start justify-center px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mt-10"
        >
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-accent/20 via-bg-card to-bg-card p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-accent rounded-full blur-3xl" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-text-primary mb-2">
                BOOKING CONFIRMED!
              </h1>
              <p className="text-text-secondary text-sm">Your tickets have been reserved</p>
            </div>

            <div className="p-6 space-y-4">
              {booking && (
                <>
                  <div className="flex gap-4 items-start">
                    <img
                      src={booking.movie_poster}
                      alt={booking.movie_title}
                      className="w-16 h-24 object-cover rounded-lg flex-shrink-0 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x96?text=Movie';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-text-primary line-clamp-2">
                        {booking.movie_title}
                      </h2>
                      {booking.movie_genre && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-accent/10 text-accent rounded-full">
                          {booking.movie_genre}
                        </span>
                      )}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatDate(booking.show_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{booking.show_time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{booking.theater}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-surface rounded-xl p-4 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs uppercase tracking-wider">Booking ID</span>
                      <span className="font-mono text-accent font-medium text-sm">#{bookingId?.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="border-t border-border border-dashed" />
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs uppercase tracking-wider">Tickets</span>
                      <span className="text-text-primary text-sm font-medium">
                        {booking.seats} {booking.seats === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>
                    {booking.seat_labels && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs uppercase tracking-wider">Seats</span>
                        <div className="flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-accent" />
                          <span className="text-accent text-sm font-medium">{booking.seat_labels}</span>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-border border-dashed" />
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs uppercase tracking-wider">Total Paid</span>
                      <span className="text-accent font-[family-name:var(--font-display)] text-2xl">
                        ₹{Number(booking.total_price).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* QR CODE ON WEBSITE */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border-2 border-dashed border-border flex flex-col items-center gap-3"
                  >
                    <QRCodeCanvas value={qrValue} size={160} level="H" includeMargin={true} />
                    <p className="text-gray-700 text-xs uppercase tracking-wider font-semibold">
                      📱 Scan at Theater Entry
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-surface/50 rounded-xl p-4 border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-text-secondary text-xs font-medium">Confirmation email</p>
                          <p className="text-text-muted text-xs truncate">{booking.customer_email}</p>
                        </div>
                      </div>
                      {emailStatus === 'sent' && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-500 text-xs font-medium flex items-center gap-1 flex-shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Sent
                        </motion.span>
                      )}
                    </div>
                  </motion.div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={downloadTicket}
                      disabled={!booking || downloading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-surface border border-border text-text-primary rounded-lg hover:bg-bg-card-hover disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      {downloading ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-surface border border-border text-text-primary rounded-lg hover:bg-bg-card-hover transition-colors text-sm font-medium"
                    >
                      <Home className="w-4 h-4" /> Home
                    </button>
                    <Link
                      to="/my-bookings"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-accent/20"
                    >
                      <Ticket className="w-4 h-4" /> Bookings
                    </Link>
                  </div>

                  <div className="text-center text-text-muted text-xs pt-2">
                    <p>✓ Secure booking</p>
                    <p>✓ Confirmed with theater</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* HIDDEN PDF TICKET TEMPLATE */}
      {booking && (
        <div
          ref={ticketRef}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '600px',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            // Hide it visually but keep it rendered
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <div style={{ padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ color: '#ffffff', fontSize: '28px', margin: 0, fontWeight: 800, letterSpacing: '2px' }}>
                  🎬 CINEBOOK
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '5px', fontSize: '13px' }}>
                  Official Movie Ticket
                </p>
              </div>

              {/* Movie Banner */}
              <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '18px', textAlign: 'center' }}>
                <h2 style={{ color: '#ffffff', fontSize: '22px', margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {booking.movie_title}
                </h2>
                {booking.movie_genre && (
                  <span style={{ display: 'inline-block', marginTop: '6px', padding: '4px 12px', background: 'rgba(255,255,255,0.25)', borderRadius: '20px', color: '#ffffff', fontSize: '12px', fontWeight: 600 }}>
                    {booking.movie_genre}
                  </span>
                )}
              </div>

              {/* Details */}
              <div style={{ padding: '18px' }}>
                <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    Booking Reference
                  </p>
                  <p style={{ margin: '3px 0 0', color: '#f5576c', fontSize: '18px', fontWeight: 800, fontFamily: 'Courier New, monospace', letterSpacing: '1px' }}>
                    #{bookingId}
                  </p>
                </div>

                <div style={{ border: '2px solid #e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 15px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📅</div>
                    <div>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Date</p>
                      <p style={{ margin: 0, color: '#212529', fontSize: '14px', fontWeight: 600 }}>{formatDate(booking.show_date)}</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 15px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🕐</div>
                    <div>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Show Time</p>
                      <p style={{ margin: 0, color: '#212529', fontSize: '14px', fontWeight: 600 }}>{booking.show_time}</p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 15px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎭</div>
                    <div>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Theater</p>
                      <p style={{ margin: 0, color: '#212529', fontSize: '14px', fontWeight: 600 }}>{booking.theater}</p>
                    </div>
                  </div>

                  {booking.seat_labels && (
                    <div style={{ padding: '12px 15px', borderBottom: '1px solid #e9ecef', background: '#fffbea', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💺</div>
                      <div>
                        <p style={{ margin: 0, color: '#6c757d', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Seats</p>
                        <p style={{ margin: 0, color: '#19547b', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>{booking.seat_labels}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎟️</div>
                    <div>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Tickets</p>
                      <p style={{ margin: 0, color: '#212529', fontSize: '14px', fontWeight: 600 }}>{booking.seats} × ₹{Math.round(booking.ticket_price)}</p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div style={{ marginTop: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '10px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600 }}>Total Paid</p>
                  <p style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: 800 }}>₹{Math.round(booking.total_price)}</p>
                </div>

                {/* QR Code */}
                <div style={{ marginTop: '12px', padding: '12px', background: '#ffffff', border: '2px dashed #dee2e6', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block' }}>
                    <QRCodeCanvas value={qrValue} size={130} level="H" includeMargin={true} />
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#6c757d', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    Scan at Theater Entrance
                  </p>
                </div>

                {/* Customer */}
                <div style={{ marginTop: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '11px' }}>
                    <strong>Customer:</strong> {booking.customer_name}
                  </p>
                  <p style={{ margin: '3px 0 0', color: '#6c757d', fontSize: '11px' }}>
                    <strong>Email:</strong> {booking.customer_email}
                  </p>
                </div>

                {/* Warning */}
                <div style={{ marginTop: '12px', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '10px', padding: '10px', borderLeft: '4px solid #f5576c' }}>
                  <p style={{ margin: 0, color: '#856404', fontSize: '11px', fontWeight: 600 }}>
                    ⚠️ Please arrive 15 minutes before showtime. Show this ticket at the entrance.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', padding: '15px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                  Thank you for choosing <strong>CineBook</strong>! 🍿
                </p>
                <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>
                  © {new Date().getFullYear()} CineBook. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}