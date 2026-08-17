import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['user', 'moderator', 'content_manager', 'admin', 'super_admin'];

const preferencesSchema = new mongoose.Schema(
  {
    favoriteGenres: { type: [String], default: [] },
    autoplay: { type: Boolean, default: true },
    notifications: {
      newReleases: { type: Boolean, default: true },
      watchlist: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ROLES, default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    preferences: { type: preferencesSchema, default: () => ({}) },
    subscription: {
      plan: { type: String, enum: ['free', 'standard', 'premium'], default: 'free' },
      status: { type: String, enum: ['active', 'expired', 'none'], default: 'active' },
      expiresAt: { type: Date, default: null },
    },
    resetToken: { type: String, default: null, select: false },
    resetTokenExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetToken;
  delete obj.resetTokenExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
