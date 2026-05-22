import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============ INDEXES ============
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// ============ PRE-SAVE MIDDLEWARE ============
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============ INSTANCE METHODS ============

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Convert to JSON (exclude password)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    is_admin: this.role === 'admin',
    createdAt: this.createdAt,
  };
};

// ============ STATIC METHODS ============

// Find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find admin users
userSchema.statics.findAdmins = function () {
  return this.find({ role: 'admin' });
};

export default mongoose.model('User', userSchema);