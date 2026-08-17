import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /api/search?q=...
export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ query: '', movies: [], genres: [], people: [] });

  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [movies, genres] = await Promise.all([
    Movie.find({
      published: true,
      $or: [{ title: re }, { director: re }, { 'cast.name': re }, { genres: re }],
    })
      .sort({ popularity: -1 })
      .limit(30)
      .lean(),
    Genre.find({ name: re }).limit(8).lean(),
  ]);

  // Distinct people (cast + directors) matching the query
  const peopleSet = new Map();
  for (const m of movies) {
    if (re.test(m.director) && m.director) {
      peopleSet.set(m.director, { name: m.director, role: 'Director' });
    }
    for (const c of m.cast || []) {
      if (re.test(c.name)) peopleSet.set(c.name, { name: c.name, role: 'Actor', photo: c.photo });
    }
  }

  res.json({
    query: q,
    movies,
    genres,
    people: [...peopleSet.values()].slice(0, 12),
  });
});
