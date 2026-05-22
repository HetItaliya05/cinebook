// server/env.js
// This file MUST be imported first in index.js
// It loads all environment variables before anything else runs

import dotenv from 'dotenv';
dotenv.config();

// Debug: confirm .env loaded correctly
console.log('🔧 ENV loaded:', {
  PORT:           process.env.PORT        || '❌ missing',
  MONGODB:        process.env.MONGODB_URI  ? '✅ set' : '❌ missing',
  EMAIL_USER:     process.env.EMAIL_USER   ? '✅ set' : '❌ missing',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✅ set' : '❌ missing',
  JWT_SECRET:     process.env.JWT_SECRET   ? '✅ set' : '❌ missing',
  RAZORPAY_KEY:   process.env.RAZORPAY_KEY_ID ? '✅ set' : '❌ missing',
});