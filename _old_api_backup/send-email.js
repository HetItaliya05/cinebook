import supabase from './_supabase.js';

function buildEmailHtml({ bookingId, customerName, movieTitle, movieGenre, theater, showDate, showTime, seats, seatLabels, totalPrice, ticketPrice }) {
  const formattedDate = showDate
    ? new Date(showDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#13131a;border-radius:16px;border:1px solid #2a2a3a;overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,rgba(229,9,20,0.2),#13131a 70%);padding:32px 32px 24px;text-align:center;">
  <div style="display:inline-block;width:48px;height:48px;background-color:#e50914;border-radius:12px;line-height:48px;text-align:center;margin-bottom:16px;">
    <span style="color:white;font-size:22px;font-weight:bold;">🎬</span>
  </div>
  <h1 style="margin:0 0 6px;color:#f0f0f5;font-size:28px;font-weight:800;letter-spacing:2px;">BOOKING CONFIRMED!</h1>
  <p style="margin:0;color:#8a8a9a;font-size:14px;">Your tickets are ready, ${customerName}</p>
</td></tr>

<!-- Movie Title -->
<tr><td style="padding:24px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2a;border-radius:12px;padding:20px;">
    <tr><td>
      <h2 style="margin:0 0 6px;color:#f0f0f5;font-size:22px;font-weight:700;">${movieTitle}</h2>
      <span style="display:inline-block;padding:3px 12px;background-color:rgba(229,9,20,0.12);color:#e50914;border-radius:20px;font-size:11px;font-weight:600;border:1px solid rgba(229,9,20,0.25);">${movieGenre}</span>
    </td></tr>
  </table>
</td></tr>

<!-- Ticket Details -->
<tr><td style="padding:16px 32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2a;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:16px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Booking ID</td>
        <td align="right" style="color:#e50914;font-family:'Courier New',monospace;font-size:18px;font-weight:800;">#${bookingId}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">📅 Date</td>
        <td align="right" style="color:#f0f0f5;font-size:14px;">${formattedDate}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">🕐 Time</td>
        <td align="right" style="color:#f0f0f5;font-size:14px;font-weight:600;">${showTime}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">📍 Theater</td>
        <td align="right" style="color:#f0f0f5;font-size:14px;">${theater}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:14px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">🎟️ Tickets</td>
        <td align="right" style="color:#f0f0f5;font-size:14px;">${seats} × ₹${Math.round(ticketPrice)}</td>
      </tr></table>
    </td></tr>
    ${seatLabels ? `<tr><td style="padding:14px 20px;border-bottom:1px dashed #2a2a3a;">
      <table width="100%"><tr>
        <td style="color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">💺 Seats</td>
        <td align="right" style="color:#e50914;font-size:15px;font-weight:700;letter-spacing:0.5px;">${seatLabels}</td>
      </tr></table>
    </td></tr>` : ''}
    <tr><td style="padding:20px;background:linear-gradient(135deg,rgba(229,9,20,0.08),rgba(229,9,20,0.03));">
      <table width="100%"><tr>
        <td style="color:#f0f0f5;font-size:15px;font-weight:600;">Total Paid</td>
        <td align="right" style="color:#e50914;font-size:28px;font-weight:800;">₹${Math.round(totalPrice)}</td>
      </tr></table>
    </td></tr>
  </table>
</td></tr>

<!-- QR-like ticket strip -->
<tr><td style="padding:20px 32px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2a;border-radius:12px;padding:16px 20px;text-align:center;">
    <tr><td>
      <p style="margin:0 0 4px;color:#55556a;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Show this email at the entrance</p>
      <p style="margin:0;color:#8a8a9a;font-size:12px;">Please arrive 15 minutes before showtime</p>
    </td></tr>
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:0 32px 28px;text-align:center;">
  <p style="margin:0 0 4px;color:#2a2a3a;font-size:10px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
  <p style="margin:0;color:#55556a;font-size:11px;">CineBook — Your Cinema, Your Seats</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id required' });

    // Fetch booking with enriched data
    const { data: booking, error: bErr } = await supabase.from('bookings').select('*').eq('id', booking_id).single();
    if (bErr || !booking) return res.status(404).json({ error: 'Booking not found' });

    const { data: movie } = await supabase.from('movies').select('title, genre').eq('id', booking.movie_id).single();
    const { data: showtime } = await supabase.from('showtimes').select('theater, date, time, price').eq('id', booking.showtime_id).single();
    const { data: seatData } = await supabase.from('booking_seats').select('seat_labels').eq('booking_id', booking_id);
    const seatLabels = seatData?.[0]?.seat_labels || '';

    const subject = `🎬 Booking Confirmed — ${movie?.title || 'Movie'} | #${booking_id}`;
    const html = buildEmailHtml({
      bookingId: booking_id,
      customerName: booking.customer_name,
      movieTitle: movie?.title || 'Movie',
      movieGenre: movie?.genre || '',
      theater: showtime?.theater || '',
      showDate: showtime?.date || '',
      showTime: showtime?.time || '',
      seats: booking.seats,
      seatLabels,
      totalPrice: booking.total_price,
      ticketPrice: showtime?.price || 0,
    });

    let emailStatus = 'no_provider';

    // Method 1: Try Resend (preferred — free tier, no config needed beyond API key)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const { error: sendErr } = await resend.emails.send({
          from: process.env.RESEND_FROM || 'CineBook <onboarding@resend.dev>',
          to: booking.customer_email,
          subject,
          html,
        });
        emailStatus = sendErr ? 'resend_error' : 'sent';
        if (sendErr) console.error('[email] Resend error:', sendErr);
      } catch (e) {
        console.error('[email] Resend failed:', e.message);
        emailStatus = 'resend_error';
      }
    }

    // Method 2: Fallback to nodemailer SMTP
    if (emailStatus !== 'sent') {
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (smtpHost && smtpUser && smtpPass) {
        try {
          const nodemailer = (await import('nodemailer')).default;
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: smtpUser, pass: smtpPass },
          });
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'CineBook <noreply@cinebook.app>',
            to: booking.customer_email,
            subject,
            html,
          });
          emailStatus = 'sent';
        } catch (e) {
          console.error('[email] SMTP failed:', e.message);
          emailStatus = 'smtp_error';
        }
      }
    }

    if (emailStatus !== 'sent') {
      console.log(`[email] No email provider configured. Would send to: ${booking.customer_email}`);
    }

    // Record email attempt
    await supabase.from('booking_emails').insert({
      booking_id,
      to_email: booking.customer_email,
      subject,
      status: emailStatus,
    }).catch(() => {});

    return res.status(200).json({ success: emailStatus === 'sent', status: emailStatus });
  } catch (err) {
    console.error('Email error:', err);
    return res.status(200).json({ success: false, error: err.message });
  }
}
