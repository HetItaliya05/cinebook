import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Loads env vars for MONGODB_URI/JWT_SECRET/etc.
dotenv.config();

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment. Check server/.env');
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cinebook.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

  await mongoose.connect(process.env.MONGODB_URI);

  // Create admin user. (If user already exists, don't overwrite password.)
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email} (role=${existing.role})`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
    role: 'admin',
  });

  console.log('✅ Admin account created successfully');
  console.log({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });

  await mongoose.disconnect();
}

main()
  .catch((err) => {
    console.error('❌ Failed to create admin:', err?.message || err);
    process.exit(1);
  });

