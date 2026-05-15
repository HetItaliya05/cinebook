import supabase from './_supabase.js';

// Shared admin verification — DRY across all admin routes
export async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (role?.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

// Shared enrichBookings — DRY across admin bookings + stats
export async function enrichBookings(bookings) {
  if (!bookings.length) return [];
  const movieIds = [...new Set(bookings.map(b => b.movie_id))];
  const showtimeIds = [...new Set(bookings.map(b => b.showtime_id))];
  const bookingIds = bookings.map(b => b.id);

  const { data: movies } = await supabase.from('movies').select('id, title, poster_url, genre').in('id', movieIds);
  const movieMap = {};
  (movies || []).forEach(m => { movieMap[m.id] = m; });

  const { data: showtimes } = await supabase.from('showtimes').select('id, theater, date, time, price').in('id', showtimeIds);
  const stMap = {};
  (showtimes || []).forEach(s => { stMap[s.id] = s; });

  const { data: seatData } = await supabase.from('booking_seats').select('booking_id, seat_labels').in('booking_id', bookingIds);
  const seatMap = {};
  (seatData || []).forEach(s => { seatMap[s.booking_id] = s.seat_labels; });

  return bookings.map(b => {
    const movie = movieMap[b.movie_id] || {};
    const st = stMap[b.showtime_id] || {};
    return {
      ...b,
      seat_labels: seatMap[b.id] || '',
      movie_title: movie.title || '',
      movie_poster: movie.poster_url || '',
      movie_genre: movie.genre || '',
      theater: st.theater || '',
      show_date: st.date || '',
      show_time: st.time || '',
      ticket_price: st.price || 0,
    };
  });
}
