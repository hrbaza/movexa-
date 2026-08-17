import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';
import { asyncHandler, httpError, slugify } from '../utils/helpers.js';
import {
  tmdbConfigured,
  searchMovies,
  fetchMovieDetail,
  mapDetailToMovie,
} from '../services/tmdb.js';

function ensureConfigured() {
  if (!tmdbConfigured()) {
    throw httpError(503, 'TMDB is not configured. Add TMDB_API_KEY to server/.env and restart.');
  }
}

// GET /api/admin/tmdb/status
export const tmdbStatus = asyncHandler(async (req, res) => {
  res.json({ configured: tmdbConfigured() });
});

// GET /api/admin/tmdb/search?q=
export const tmdbSearch = asyncHandler(async (req, res) => {
  ensureConfigured();
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ items: [] });

  const results = await searchMovies(q);
  // Flag which ones are already in our catalog.
  const ids = results.map((r) => r.tmdbId);
  const existing = await Movie.find({ tmdbId: { $in: ids } }).select('tmdbId slug').lean();
  const map = new Map(existing.map((m) => [m.tmdbId, m.slug]));

  res.json({
    items: results.map((r) => ({ ...r, imported: map.has(r.tmdbId), slug: map.get(r.tmdbId) || null })),
  });
});

// POST /api/admin/tmdb/import/:tmdbId
export const tmdbImport = asyncHandler(async (req, res) => {
  ensureConfigured();
  const tmdbId = Number(req.params.tmdbId);
  if (!tmdbId) throw httpError(400, 'Invalid TMDB id');

  const already = await Movie.findOne({ tmdbId });
  if (already) return res.status(200).json({ movie: already, imported: false });

  const detail = await fetchMovieDetail(tmdbId);
  const count = await Movie.estimatedDocumentCount();
  const doc = mapDetailToMovie(detail, count);

  // Make sure the movie's genres exist as Genre docs too.
  for (const name of doc.genres) {
    await Genre.updateOne(
      { name },
      { $setOnInsert: { name, slug: slugify(name) } },
      { upsert: true }
    ).catch(() => {});
  }

  // Guard against slug collisions with a distinct title+year already present.
  const slugExists = await Movie.findOne({ slug: doc.slug });
  if (slugExists) doc.slug = `${doc.slug}-${tmdbId}`;

  const movie = await Movie.create(doc);
  res.status(201).json({ movie, imported: true });
});
