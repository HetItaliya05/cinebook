// ============================================================
// IMPORTANT: env.js MUST be the very first import
// ============================================================
import './env.js';

// 🔒 Prevent any DB operations during import
import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);
mongoose.set('autoCreate', false);

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import crypto from 'crypto';

import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import showtimeRoutes from './routes/showtimes.js';
import bookingRoutes from './routes/bookings.js';
import adminMovieRoutes from './routes/admin/movies.js';
import adminShowtimeRoutes from './routes/admin/showtimes.js';
import adminBookingRoutes from './routes/admin/bookings.js';
import adminStatsRoutes from './routes/admin/stats.js';
import uploadRoutes from './routes/admin/upload.js';
import showtimeSeatsRoutes from './routes/showtime-seats.js';


// server.js or routes/payment.js

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized');
} else {
  console.warn('⚠️  Razorpay environment variables missing. Payment features disabled.');
}

// ─── SETUP ──────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ EMAIL CONFIGURATION ============

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('⚠️  Email configuration error:', error.message);
    console.error('    Check EMAIL_USER and EMAIL_PASSWORD in your .env file');
  } else {
    console.log('✅ Email service ready');
  }
});

// Create order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
    });
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true, payment_id: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ API ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/showtime-seats', showtimeSeatsRoutes);
app.use('/api/admin/movies', adminMovieRoutes);
app.use('/api/admin/showtimes', adminShowtimeRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/upload', uploadRoutes);

// ============ EMAIL ENDPOINT ============

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, and html or text',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'CineBook'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || text,
      text: text || html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message,
    });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    email_configured: !!process.env.EMAIL_USER,
    timestamp: new Date().toISOString(),
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server working ✅' });
});

// ============ 404 HANDLER ============

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// ============ GLOBAL ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ============ DATABASE + SERVER START ============

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log('✅ MongoDB ping successful');

    // 🚀 Put any post-connect initializers here (ensureAdminUser, etc.)
    // await ensureAdminUser();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║     🎬 CINEBOOK - BOOKING HUB          ║
║                                        ║
║   🚀 Server running on port ${PORT}      ║
║   📧 Email service: Ready              ║
║   🗄️  Database: Connected & Verified   ║
╚════════════════════════════════════════╝
      `);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📋 Full error:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();