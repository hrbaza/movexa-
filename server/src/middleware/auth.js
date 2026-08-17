import { verifyToken } from '../utils/token.js';
import { httpError } from '../utils/helpers.js';
import User from '../models/User.js';

/**
 * Require a valid JWT. Attaches req.user (the User document).
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw httpError(401, 'Authentication required');

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw httpError(401, 'User no longer exists');
    if (user.status === 'suspended') throw httpError(403, 'Account suspended');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(httpError(401, 'Invalid or expired token'));
    }
    next(err);
  }
}

/**
 * Optional auth — attaches req.user if a valid token is present, else continues.
 * Used on public endpoints that personalise results (e.g. "in my watchlist?").
 */
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.status !== 'suspended') req.user = user;
    }
  } catch {
    /* ignore — treat as guest */
  }
  next();
}

/**
 * Require the authenticated user to hold one of the given roles.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

/** Roles allowed to manage content / users. */
export const adminRoles = ['admin', 'super_admin', 'content_manager'];
