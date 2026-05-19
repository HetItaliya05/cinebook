import express from 'express';

import mongoose from 'mongoose';

import User from '../models/User.js';
import { generateToken, authenticate, requireAdmin } from '../middleware/auth.js';

// Ensure this file is ES module friendly and exports default router.
const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      name: name || normalizedEmail.split('@')[0],
      role: 'user',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_admin: user.role === 'admin',
      },
    });
  } catch (err) {
    // Handle common Mongo duplicate key errors
    if (err && (err.code === 11000 || err.code === 11001)) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    return res.status(500).json({
      success: false,
      error: err?.message || 'Registration failed',
    });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive. Please contact support.',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_admin: user.role === 'admin',
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Login failed',
    });
  }
});

// GET /profile (current user)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_admin: user.role === 'admin',
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch profile',
    });
  }
});

// (Optional) Admin helper endpoints (won't break anything if unused)
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch users',
    });
  }
});

// export default router (required by index.js: import authRoutes from './routes/auth.js')
export default router;

