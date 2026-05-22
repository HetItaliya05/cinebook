<<<<<<< HEAD
// ============================================================
// IMPORTANT: env.js MUST be the very first import
// ============================================================
import './env.js';

// 🔒 Prevent any DB operations during import
import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);
mongoose.set('autoCreate', false);
=======
// server/index.js
import './env.js';

import mongoose from 'mongoose';
mongoose.set('bufferCommands', false);
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';
import crypto from 'crypto';
<<<<<<< HEAD
=======
import net from 'net';
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

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

<<<<<<< HEAD

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
=======
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const BASE_PORT = Number(process.env.PORT) || 5000;
const FALLBACK_PORT = BASE_PORT + 1;

// ================== MIDDLEWARE ==================
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

<<<<<<< HEAD
// ============ EMAIL CONFIGURATION ============

=======
// ================== RAZORPAY ==================
let razorpay = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized');
  } else {
    console.warn('⚠️ Razorpay keys missing - payment endpoints will return 500');
  }
} catch (err) {
  console.error('❌ Razorpay init error:', err);
}

// ================== EMAIL CONFIG ==================
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
<<<<<<< HEAD
    console.error('⚠️  Email configuration error:', error.message);
    console.error('    Check EMAIL_USER and EMAIL_PASSWORD in your .env file');
=======
    console.error('❌ Email error:', error.message);
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
  } else {
    console.log('✅ Email service ready');
  }
});

<<<<<<< HEAD
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
=======
// ================== PAYMENT ROUTES ==================
app.post('/api/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not configured' });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'amount is required' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Failed to create order' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
<<<<<<< HEAD
      res.json({ verified: true, payment_id: razorpay_payment_id });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ API ROUTES ============

=======
      return res.json({ verified: true });
    }

    return res.status(400).json({ verified: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Payment verification failed' });
  }
});

// ================== API ROUTES ==================
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/showtime-seats', showtimeSeatsRoutes);
<<<<<<< HEAD
=======

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
app.use('/api/admin/movies', adminMovieRoutes);
app.use('/api/admin/showtimes', adminShowtimeRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/admin/upload', uploadRoutes);

<<<<<<< HEAD
// ============ EMAIL ENDPOINT ============

=======
// ================== EMAIL ROUTE ==================
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

<<<<<<< HEAD
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
=======
    const mailOptions = {
      from: `"CineBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error?.message || 'Failed to send email' });
  }
});

// ================== TEST ROUTES ==================
app.get('/', (req, res) => {
  res.send('🎬 CINEBOOK API RUNNING');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server Working ✅',
    timestamp: new Date(),
  });
});

// ================== 404 ==================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const isPortInUse = async (port) =>
  new Promise((resolve) => {
    const probe = net
      .createServer()
      .once('error', (err) => {
        if (err && err.code === 'EADDRINUSE') return resolve(true);
        return resolve(true);
      })
      .once('listening', () => {
        probe.close(() => resolve(false));
      })
      .listen(port, '0.0.0.0');
  });

const START_GUARD_KEY = '__CINEBOOK_SERVER_STARTED__';

const startListening = (port) => {
  const server = app.listen(port);

  server.on('listening', () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} became busy, switching to ${FALLBACK_PORT}`);
      startListening(FALLBACK_PORT);
      return;
    }

    console.error('❌ Server listen error:', err);
  });

  return server;
};

// ================== MONGO + START ==================
const startServer = async () => {
  // Prevent duplicate server instances during nodemon restart
  if (globalThis[START_GUARD_KEY]) {
    console.warn('⚠️ Server start skipped (duplicate nodemon instance detected).');
    return;
  }
  globalThis[START_GUARD_KEY] = true;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MongoDB connection failed: Missing process.env.MONGODB_URI (or MONGO_URI fallback).');
    return;
  }

  try {
    await mongoose.connect(uri, { autoIndex: false });
    console.log('✅ MongoDB Connected');

    // Port conflict handling
    if (await isPortInUse(BASE_PORT)) {
      console.warn(`⚠️ Port ${BASE_PORT} busy, switching to ${FALLBACK_PORT}`);
      startListening(FALLBACK_PORT);
      return;
    }

    startListening(BASE_PORT);
  } catch (err) {
    console.error('❌ MongoDB Error:', err);
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
  }
};

process.on('unhandledRejection', (err) => {
<<<<<<< HEAD
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
=======
  console.error('❌ Unhandled Rejection:', err);
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
<<<<<<< HEAD
  process.exit(1);
});

startServer();
=======
});

startServer();

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
