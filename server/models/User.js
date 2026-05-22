<<<<<<< HEAD
=======
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: [6, 'Password must be at least 6 characters'],
//       select: false, // Don't return password by default 
//     },

//     // Optional phone number.
//     // IMPORTANT:
//     // - MongoDB unique indexes treat multiple null values as duplicates.
//     // - We add `sparse: true` + a partial unique index so uniqueness is enforced
//     //   only when phone is provided (not null/empty).
//     // Phone is optional.
//     // Important for MongoDB uniqueness:
//     // - When `unique: true` is used, MongoDB treats *multiple null values as duplicates*.
//     // - Therefore we also apply `sparse: true` + a partial unique index in `userSchema.index(...)`
//     //   so uniqueness is only enforced when phone is actually provided.
//     phone: {
//       type: String,
//       required: false,
//       default: null,
//       trim: true,
//       validate: {
//         // Allow null/undefined/empty. Enforce basic string form when provided.
//         validator: function (v) {
//           if (v === null || v === undefined || v === '') return true;
//           return typeof v === 'string';
//         },
//         message: 'Phone must be a string',
//       },
//     },

//     // Optional convenience field to ensure empty-string registrations
//     // get normalized consistently (prevents edge-case unique violations).
//     // Not persisted unless you explicitly set it elsewhere.
//     // phoneNormalized: { type: String, select: false },

//     name: {
//       type: String,
//       default: '',
//       trim: true,
//     },
//     role: {
//       type: String,
//       enum: ['user', 'admin'],
//       default: 'user',
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // ============ INDEXES ============
// // Keep email uniqueness as-is.
// userSchema.index({ email: 1 });
// userSchema.index({ createdAt: -1 });

// // Phone uniqueness fix (prevents `phone: null` duplicates):
// // - We do NOT use `required`.
// // - We create a unique index that only applies when phone is a non-empty string.
// //   This prevents MongoDB from treating multiple `null` values as duplicates.
// // - `sparse: true` further ensures documents without the field won't collide.
// //
// // This is the production-safe approach:
// //   unique + sparse + partialFilterExpression.
// userSchema.index(
//   { phone: 1 },
//   {
//     unique: true,
//     sparse: true,
//     partialFilterExpression: {
//       phone: { $type: 'string', $ne: '' },
//     },
//   }
// );



// // ============ PRE-SAVE MIDDLEWARE ============
// userSchema.pre('save', async function (next) {
//   // Normalize phone so "empty" registrations do not store null/empty strings.
//   // This prevents unique index edge-cases.
//   if (this.phone === null || this.phone === undefined || this.phone === '') {
//     this.phone = undefined;
//   }

//   // Only hash password if it's modified
//   if (!this.isModified('password')) {
//     return next();
//   }

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // ============ INSTANCE METHODS ============

// // Compare password
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     throw new Error('Password comparison failed');
//   }
// };

// // Convert to JSON (exclude password)
// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   return user;
// };

// // Get public profile
// userSchema.methods.getPublicProfile = function () {
//   return {
//     _id: this._id,
//     email: this.email,
//     name: this.name,
//     role: this.role,
//     is_admin: this.role === 'admin',
//     createdAt: this.createdAt,
//   };
// };

// // ============ STATIC METHODS ============

// // Find by email
// userSchema.statics.findByEmail = function (email) {
//   return this.findOne({ email: email.toLowerCase() });
// };

// // Find admin users
// userSchema.statics.findAdmins = function () {
//   return this.find({ role: 'admin' });
// };

// export default mongoose.model('User', userSchema);


>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
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
<<<<<<< HEAD
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
=======
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
<<<<<<< HEAD
      select: false, // Don't return password by default
    },
=======
      select: false,
    },

    phone: {
      type: String,
      default: undefined,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;

          // Only digits allowed
          return /^[0-9]{10,15}$/.test(v);
        },
        message: 'Invalid phone number',
      },
    },

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    name: {
      type: String,
      default: '',
      trim: true,
<<<<<<< HEAD
    },
=======
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
<<<<<<< HEAD
=======

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
<<<<<<< HEAD
=======
    versionKey: false,
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

<<<<<<< HEAD
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
=======
//
// ✅ INDEXES
//
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      phone: { $type: 'string', $ne: '' },
    },
  }
);

//
// ✅ PRE SAVE
//
userSchema.pre('save', async function (next) {
  try {
    // Normalize phone
    if (!this.phone || this.phone === '') {
      this.phone = undefined;
    }

    // Hash password only if modified
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();

>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
  } catch (error) {
    next(error);
  }
});

<<<<<<< HEAD
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
=======
//
// ✅ COMPARE PASSWORD
//
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// ✅ REMOVE PASSWORD FROM RESPONSE
//
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;

  return userObject;
};

//
// ✅ PUBLIC PROFILE
//
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
    email: this.email,
    name: this.name,
    role: this.role,
    is_admin: this.role === 'admin',
    createdAt: this.createdAt,
  };
};

<<<<<<< HEAD
// ============ STATIC METHODS ============

// Find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find admin users
userSchema.statics.findAdmins = function () {
  return this.find({ role: 'admin' });
=======
//
// ✅ STATIC METHODS
//
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
  }).select('+password');
};

userSchema.statics.findAdmins = function () {
  return this.find({
    role: 'admin',
  });
>>>>>>> d4502265145f7864581183a0a2e10a99cafdcf37
};

export default mongoose.model('User', userSchema);