import dotenv from 'dotenv';
dotenv.config();

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

// ================== RAZORPAY ==================

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log('✅ Razorpay initialized');
} else {
  console.warn('⚠️ Razorpay keys missing');
}

// ================== SETUP ==================

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const PORT = process.env.PORT || 5000;

// ================== MIDDLEWARE ==================

app.use(cors());

app.use(express.json({ limit: '5mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================== EMAIL CONFIG ==================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ================== PAYMENT ROUTES ==================

app.post('/api/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        error: 'Razorpay not configured',
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.json({
        verified: true,
      });
    }

    return res.status(400).json({
      verified: false,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ================== API ROUTES ==================

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

// ================== EMAIL ROUTE ==================

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const mailOptions = {
      from: `"CineBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
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
  res.status(404).json({
    error: 'Route not found',
  });
});

// ================== ERROR HANDLER ==================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Internal Server Error',
  });
});

// ================== START SERVER ==================

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║        🎬 CINEBOOK SERVER            ║
║                                      ║
║   🚀 Running On Port ${PORT}          ║
║   🗄️ MongoDB Connected               ║
╚══════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);

    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

startServer();