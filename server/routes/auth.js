<<<<<<< HEAD
import { Router } from 'express';
import User from '../models/User.js';
import { generateToken, authenticate, requireAdmin } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = Router();

// ============ REGISTER ============
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    // ✅ Validation
=======
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

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
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

<<<<<<< HEAD
    if (password.length < 6) {
=======
    if (String(password).length < 6) {
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

<<<<<<< HEAD
    // ✅ Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
=======
    const normalizedEmail = String(email).toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

<<<<<<< HEAD
    // ✅ Create user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name || email.split('@')[0],
    });

    // ✅ Generate token
    const token = generateToken(user);

    console.log('✅ User registered:', email);

// ─── SEND WELCOME EMAIL (non-blocking) ───────────────
// We use .catch() so email failure never breaks registration
sendWelcomeEmail({
  name: user.name,
  email: user.email,
}).catch((err) => console.error('Welcome email error:', err));

res.status(201).json({
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
    console.error('❌ Register error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Registration failed',
=======
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
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    });
  }
});

<<<<<<< HEAD
// ============ LOGIN ============
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
=======
// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

<<<<<<< HEAD
    // ✅ Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
=======
    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

<<<<<<< HEAD
    // ✅ Compare password
=======
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

<<<<<<< HEAD
    // ✅ Check if user is active
=======
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive. Please contact support.',
      });
    }

<<<<<<< HEAD
    // ✅ Generate token
    const token = generateToken(user);

    console.log('✅ User logged in:', email);

    res.json({
=======
    const token = generateToken(user);

    return res.json({
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
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
<<<<<<< HEAD
    console.error('❌ Login error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Login failed',
=======
    return res.status(500).json({
      success: false,
      error: err?.message || 'Login failed',
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    });
  }
});

<<<<<<< HEAD
// ============ GET CURRENT USER ============
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        is_admin: req.user.role === 'admin',
      },
    });
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
=======
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
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    });
  }
});

<<<<<<< HEAD
// ============ UPDATE PROFILE ============
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name || req.user.name },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        is_admin: updatedUser.role === 'admin',
      },
    });
  } catch (err) {
    console.error('❌ Update user error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// ============ CHANGE PASSWORD ============
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // ✅ Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new passwords are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // ✅ Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // ✅ Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // ✅ Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed for:', user.email);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('❌ Change password error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
});

// ============ LOGOUT ============
router.post('/logout', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

// ============ ADMIN: GET ALL USERS ============
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
=======
// (Optional) Admin helper endpoints (won't break anything if unused)
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
      success: true,
      total: users.length,
      users,
    });
  } catch (err) {
<<<<<<< HEAD
    console.error('❌ Get users error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
=======
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch users',
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    });
  }
});

<<<<<<< HEAD
// ============ ADMIN: DELETE USER ============
router.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    console.log('✅ User deleted:', user.email);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error('❌ Delete user error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
});

export default router;
=======
// export default router (required by index.js: import authRoutes from './routes/auth.js')
export default router;

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
