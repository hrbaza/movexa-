import crypto from 'crypto';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { asyncHandler, httpError } from '../utils/helpers.js';
import { requireFields, validateEmail, validatePassword } from '../middleware/validate.js';

function authResponse(res, user, status = 200) {
  const token = signToken({ id: user._id, role: user.role });
  res.status(status).json({ token, user: user.toSafeJSON() });
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  requireFields(req.body, ['name', 'email', 'password']);
  validateEmail(email);
  validatePassword(password);

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw httpError(409, 'An account with that email already exists');

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  authResponse(res, user, 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  requireFields(req.body, ['email', 'password']);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw httpError(401, 'Invalid email or password');
  if (user.status === 'suspended') throw httpError(403, 'This account has been suspended');

  const ok = await user.comparePassword(password);
  if (!ok) throw httpError(401, 'Invalid email or password');

  authResponse(res, user);
});

// POST /api/auth/logout  (stateless JWT — client just drops the token)
export const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// PUT /api/auth/me  — update profile / preferences
export const updateMe = asyncHandler(async (req, res) => {
  const { name, avatar, preferences, password } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (preferences !== undefined) {
    user.preferences = { ...user.preferences.toObject(), ...preferences };
  }
  if (password) {
    validatePassword(password);
    await user.setPassword(password);
  }
  await user.save();
  res.json({ user: user.toSafeJSON() });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  requireFields(req.body, ['email']);

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always respond success to avoid leaking which emails exist.
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent' });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save();

  // In production this token would be emailed. For the MVP we return it so the
  // flow is testable without an email provider configured.
  res.json({
    message: 'If that email exists, a reset link has been sent',
    devResetToken: rawToken,
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  requireFields(req.body, ['token', 'password']);
  validatePassword(password);

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpires: { $gt: new Date() },
  }).select('+resetToken +resetTokenExpires');

  if (!user) throw httpError(400, 'Reset token is invalid or has expired');

  await user.setPassword(password);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  authResponse(res, user);
});
