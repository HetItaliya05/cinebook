import jwt from 'jsonwebtoken';
import User from '../models/User.js';

<<<<<<< HEAD
const JWT_SECRET = process.env.JWT_SECRET || 'cinebook-secret-change-this';
=======
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required (missing in environment)');
}

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37

// ============ GENERATE TOKEN ============
export function generateToken(user) {
  try {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('❌ Token generation error:', error);
    throw error;
  }
}

// ============ AUTHENTICATE MIDDLEWARE ============
// Required: User must be logged in
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('❌ Token verification error:', err.message);

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expired. Please log in again.',
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please log in again.',
        });
      }

      try {
        // Fetch user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        // Optional: Check if user is active
        if (user.isActive === false) {
          return res.status(403).json({
            success: false,
            error: 'User account is inactive',
          });
        }

        req.user = user;
        req.userId = decoded.id;
        next();
      } catch (error) {
        console.error('❌ User lookup error:', error);
        res.status(500).json({
          success: false,
          error: 'Server error during authentication',
        });
      }
    });
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

// ============ OPTIONAL AUTHENTICATION MIDDLEWARE ============
// Optional: Works with or without user
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(); // Continue without user
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return next(); // Continue without user
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (!err) {
        try {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            req.userId = decoded.id;
          }
        } catch (error) {
          console.error('⚠️ Optional auth user lookup error:', error);
        }
      }
      next(); // Continue regardless
    });
  } catch (error) {
    console.error('⚠️ Optional auth error:', error);
    next(); // Continue regardless
  }
}

// ============ ADMIN MIDDLEWARE ============
// Required: User must be admin
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Admin access required.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('❌ Admin token verification error:', err.message);

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expired. Please log in again.',
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }

      try {
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
          console.warn(`⚠️ Non-admin user ${user.email} attempted admin access`);
          return res.status(403).json({
            success: false,
            error: 'Admin access required',
          });
        }

        req.user = user;
        req.userId = decoded.id;
        next();
      } catch (error) {
        console.error('❌ Admin user lookup error:', error);
        res.status(500).json({
          success: false,
          error: 'Server error during admin verification',
        });
      }
    });
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin verification failed',
    });
  }
}

// ============ VERIFY TOKEN HELPER (useful for debugging) ============
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return null;
  }
}

// ============ DECODE TOKEN HELPER (without verification) ============
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ Token decode error:', error.message);
    return null;
  }
}