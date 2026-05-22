// server/env.js
<<<<<<< HEAD
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
=======
// Must be imported first in server/index.js

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly so it works regardless of the working directory
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const present = (v) => (v ? '✅ set' : '❌ missing');

console.log('🧾 ENV loaded:', {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: present(process.env.MONGODB_URI),
  MONGO_URI: present(process.env.MONGO_URI),
  EMAIL_USER: present(process.env.EMAIL_USER),
  EMAIL_PASSWORD: present(process.env.EMAIL_PASSWORD),
  JWT_SECRET: present(process.env.JWT_SECRET),
  RAZORPAY_KEY: present(process.env.RAZORPAY_KEY_ID),
  RAZORPAY_SECRET: present(process.env.RAZORPAY_KEY_SECRET),
});

// Normalize DB env for the rest of the codebase
// Primary: MONGODB_URI
// Fallback: MONGO_URI
if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

if (!process.env.MONGO_URI && process.env.MONGODB_URI) {
  process.env.MONGO_URI = process.env.MONGODB_URI;
}

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
