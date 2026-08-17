import { httpError } from '../utils/helpers.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Throw a 400 if any required field on `fields` is missing/empty. */
export function requireFields(body, fields) {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
  );
  if (missing.length) {
    throw httpError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
}

export function validateEmail(email) {
  if (!EMAIL_RE.test(String(email))) throw httpError(400, 'Please provide a valid email address');
}

export function validatePassword(password) {
  if (String(password).length < 6) {
    throw httpError(400, 'Password must be at least 6 characters');
  }
}
