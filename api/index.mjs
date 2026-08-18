// Vercel serverless entry — wraps the Express app.
// The React frontend is served by Vercel's CDN (see vercel.json); only /api/*
// requests reach this function.
import app from '../server/src/app.js';
import { connectServerless } from '../server/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectServerless();
  } catch (err) {
    console.error('DB connection failed:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Database connection failed' }));
    return;
  }
  return app(req, res);
}
