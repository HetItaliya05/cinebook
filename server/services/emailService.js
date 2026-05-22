// ============================================================
// EMAIL SERVICE — Central hub for all email sending logic
// Uses nodemailer + Gmail App Password
// ============================================================

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import {
  welcomeEmailTemplate,
  bookingConfirmationTemplate,
  newMovieNotificationTemplate,
} from '../templates/emailTemplates.js';

// ─── CREATE TRANSPORTER ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─── VERIFY CONNECTION ON STARTUP ───────────────────────────
transporter.verify((error) => {
  if (error) {
    console.error('⚠️  Email service error:', error.message);
  } else {
    console.log('✅ Email service connected');
  }
});

// ─── BASE SEND FUNCTION ─────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  // Guard: skip if email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email credentials missing — skipping email send');
    return { skipped: true };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'CineBook'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    // Return error info but don't throw
    // We never want email failure to crash booking/registration
    return { success: false, error: error.message };
  }
}

// ─── GENERATE QR CODE ────────────────────────────────────────
// Returns a base64 data URL image (no file storage needed)
async function generateQRCode(bookingId) {
  try {
    const qrData = JSON.stringify({
      bookingId,
      app: 'CineBook',
      timestamp: new Date().toISOString(),
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return qrCodeUrl;
  } catch (error) {
    console.error('❌ QR generation failed:', error.message);
    return null;
  }
}

// ============================================================
// PUBLIC FUNCTIONS — Called from routes
// ============================================================

// ─── 1. SEND WELCOME EMAIL ───────────────────────────────────
export async function sendWelcomeEmail({ name, email }) {
  try {
    const html = welcomeEmailTemplate({ name, email });

    return await sendEmail({
      to: email,
      subject: '🎬 Welcome to CineBook — Account Created!',
      html,
    });
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── 2. SEND BOOKING CONFIRMATION EMAIL ──────────────────────
export async function sendBookingConfirmationEmail(bookingData) {
  try {
    const {
      customerName,
      customerEmail,
      bookingId,
      movieTitle,
      movieGenre,
      moviePoster,
      theater,
      showDate,
      showTime,
      seats,
      seatLabels,
      totalPrice,
      ticketPrice,
    } = bookingData;

    // Generate QR code with booking ID
    const qrCodeUrl = await generateQRCode(bookingId);

    // Build HTML from template
    const html = bookingConfirmationTemplate({
      customerName,
      customerEmail,
      bookingId,
      movieTitle,
      movieGenre,
      moviePoster,
      theater,
      showDate,
      showTime,
      seats,
      seatLabels,
      totalPrice,
      ticketPrice,
      qrCodeUrl,
    });

    return await sendEmail({
      to: customerEmail,
      subject: `🎟️ Booking Confirmed — ${movieTitle} | CineBook`,
      html,
    });
  } catch (error) {
    console.error('❌ Booking confirmation email error:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── 3. SEND NEW MOVIE NOTIFICATION ──────────────────────────
// Sends to a list of subscriber emails (or admin only for now)
export async function sendNewMovieNotification(movieData, recipientEmails = []) {
  try {
    if (!recipientEmails || recipientEmails.length === 0) {
      console.log('ℹ️  No recipients for movie notification');
      return { skipped: true };
    }

    const html = newMovieNotificationTemplate(movieData);

    // Send to all recipients
    const results = await Promise.allSettled(
      recipientEmails.map((email) =>
        sendEmail({
          to: email,
          subject: `🎬 New Movie: ${movieData.movieTitle} — Now on CineBook!`,
          html,
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`✅ Movie notifications sent: ${sent}/${recipientEmails.length}`);

    return { success: true, sent, total: recipientEmails.length };
  } catch (error) {
    console.error('❌ Movie notification error:', error.message);
    return { success: false, error: error.message };
  }
}