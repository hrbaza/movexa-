import Movie from '../models/Movie.js';
import { asyncHandler, httpError, slugify } from '../utils/helpers.js';
import { fetchMovieDetail, mapDetailToMovie, tmdbConfigured } from '../services/tmdb.js';

const SORT_MAP = {
  popularity: { popularity: -1, views: -1 },
  rating: { rating: -1 },
  newest: { year: -1, releaseDate: -1 },
  oldest: { year: 1, releaseDate: 1 },
  alphabetical: { title: 1 },
};

/** Build a Mongo filter object from query params. */
function buildFilter(q) {
  const filter = { published: true };

  if (q.type) filter.type = q.type;
  if (q.genre) filter.genres = q.genre;
  if (q.language) filter.language = q.language;
  if (q.country) filter.country = q.country;
  if (q.quality) filter.quality = q.quality;
  if (q.contentRating) filter.contentRating = q.contentRating;
  if (q.featured === 'true') filter.featured = true;
  if (q.trending === 'true') filter.trending = true;

  if (q.year) filter.year = Number(q.year);
  if (q.yearFrom || q.yearTo) {
    filter.year = {};
    if (q.yearFrom) filter.year.$gte = Number(q.yearFrom);
    if (q.yearTo) filter.year.$lte = Number(q.yearTo);
  }
  if (q.minRating) filter.rating = { $gte: Number(q.minRating) };

  if (q.search) {
    filter.$or = [
      { title: { $regex: q.search, $options: 'i' } },
      { director: { $regex: q.search, $options: 'i' } },
      { 'cast.name': { $regex: q.search, $options: 'i' } },
    ];
  }
  return filter;
}

// GET /api/movies
export const listMovies = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 24);
  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query);
  const sort = SORT_MAP[req.query.sort] || SORT_MAP.popularity;

  const [items, total] = await Promise.all([
    Movie.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Movie.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/movies/home  — aggregated homepage sections
export const homeSections = asyncHandler(async (req, res) => {
  const base = { published: true };
  const [featured, trending, popular, latest, topRated, genresAgg] = await Promise.all([
    Movie.find({ ...base, featured: true }).limit(6).lean(),
    Movie.find({ ...base, trending: true }).sort({ popularity: -1 }).limit(12).lean(),
    Movie.find(base).sort({ popularity: -1, views: -1 }).limit(12).lean(),
    Movie.find(base).sort({ releaseDate: -1, year: -1 }).limit(12).lean(),
    Movie.find(base).sort({ rating: -1 }).limit(12).lean(),
    Movie.aggregate([
      { $match: base },
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const hero = featured[0] || trending[0] || popular[0] || null;

  res.json({
    hero,
    featured,
    trending,
    popular,
    latest,
    topRated,
    genres: genresAgg.map((g) => ({ name: g._id, count: g.count })),
  });
});

// GET /api/movies/tmdb/:tmdbId — live TMDB movie, no catalog import required
export const getTmdbMovie = asyncHandler(async (req, res) => {
  if (!tmdbConfigured()) throw httpError(503, 'TMDB is not configured');
  const tmdbId = Number(req.params.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw httpError(400, 'Invalid TMDB id');

  const existing = await Movie.findOne({ tmdbId }).lean();
  if (existing) return res.json({ movie: existing, imported: true });

  const detail = await fetchMovieDetail(tmdbId);
  const movie = mapDetailToMovie(detail);
  res.json({
    movie: { ...movie, _id: `tmdb-${tmdbId}`, external: true },
    imported: false,
  });
});

// GET /api/movies/:idOrSlug
export const getMovie = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const movie = await Movie.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
  );
  if (!movie || (!movie.published && !req.user)) throw httpError(404, 'Movie not found');

  // Count a view (fire and forget)
  Movie.updateOne({ _id: movie._id }, { $inc: { views: 1, popularity: 0.5 } }).catch(() => {});

  // Similar: same genres, exclude self
  const similar = await Movie.find({
    _id: { $ne: movie._id },
    published: true,
    genres: { $in: movie.genres },
  })
    .sort({ rating: -1, popularity: -1 })
    .limit(12)
    .lean();

  res.json({ movie, similar });
});

// GET /api/movies/:idOrSlug/similar
export const similarMovies = asyncHandler(async (req, res) => {
  const movie = await Movie.findOne({ slug: req.params.idOrSlug }).lean();
  if (!movie) throw httpError(404, 'Movie not found');
  const similar = await Movie.find({
    _id: { $ne: movie._id },
    published: true,
    genres: { $in: movie.genres },
  })
    .sort({ rating: -1 })
    .limit(12)
    .lean();
  res.json({ items: similar });
});

// ---- Admin CRUD ----

// POST /api/movies
export const createMovie = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.title) throw httpError(400, 'Title is required');
  if (body.releaseDate) body.year = new Date(body.releaseDate).getFullYear();
  body.slug = slugify(body.title, body.year || '');

  const movie = await Movie.create(body);
  res.status(201).json({ movie });
});

// PUT /api/movies/:id
export const updateMovie = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.releaseDate) body.year = new Date(body.releaseDate).getFullYear();
  if (body.title) body.slug = slugify(body.title, body.year || '');

  const movie = await Movie.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!movie) throw httpError(404, 'Movie not found');
  res.json({ movie });
});

// DELETE /api/movies/:id
export const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw httpError(404, 'Movie not found');
  res.json({ message: 'Movie deleted' });
});
