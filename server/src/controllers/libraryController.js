import { Watchlist, Favorite, History } from '../models/UserContent.js';
import Movie from '../models/Movie.js';
import { asyncHandler, httpError } from '../utils/helpers.js';

async function ensureMovie(id) {
  const movie = await Movie.findById(id).select('_id');
  if (!movie) throw httpError(404, 'Movie not found');
  return movie;
}

// ---------- Watchlist ----------

// GET /api/watchlist
export const getWatchlist = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ user: req.user._id })
    .populate('movie')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items: items.filter((i) => i.movie).map((i) => i.movie) });
});

// POST /api/watchlist/:movieId
export const addToWatchlist = asyncHandler(async (req, res) => {
  await ensureMovie(req.params.movieId);
  await Watchlist.updateOne(
    { user: req.user._id, movie: req.params.movieId },
    { $setOnInsert: { user: req.user._id, movie: req.params.movieId } },
    { upsert: true }
  );
  res.status(201).json({ message: 'Added to watchlist' });
});

// DELETE /api/watchlist/:movieId
export const removeFromWatchlist = asyncHandler(async (req, res) => {
  await Watchlist.deleteOne({ user: req.user._id, movie: req.params.movieId });
  res.json({ message: 'Removed from watchlist' });
});

// ---------- Favorites ----------

// GET /api/favorites
export const getFavorites = asyncHandler(async (req, res) => {
  const items = await Favorite.find({ user: req.user._id })
    .populate('movie')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items: items.filter((i) => i.movie).map((i) => i.movie) });
});

// POST /api/favorites/:movieId
export const addToFavorites = asyncHandler(async (req, res) => {
  await ensureMovie(req.params.movieId);
  await Favorite.updateOne(
    { user: req.user._id, movie: req.params.movieId },
    { $setOnInsert: { user: req.user._id, movie: req.params.movieId } },
    { upsert: true }
  );
  res.status(201).json({ message: 'Added to favorites' });
});

// DELETE /api/favorites/:movieId
export const removeFromFavorites = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, movie: req.params.movieId });
  res.json({ message: 'Removed from favorites' });
});

// ---------- Combined status (is this movie in my lists?) ----------

// GET /api/library/status/:movieId
export const libraryStatus = asyncHandler(async (req, res) => {
  const [inWatchlist, inFavorites, history] = await Promise.all([
    Watchlist.exists({ user: req.user._id, movie: req.params.movieId }),
    Favorite.exists({ user: req.user._id, movie: req.params.movieId }),
    History.findOne({ user: req.user._id, movie: req.params.movieId }).lean(),
  ]);
  res.json({
    inWatchlist: Boolean(inWatchlist),
    inFavorites: Boolean(inFavorites),
    progress: history ? { position: history.position, completion: history.completion } : null,
  });
});

// ---------- History / Continue Watching ----------

// GET /api/history
export const getHistory = asyncHandler(async (req, res) => {
  const items = await History.find({ user: req.user._id })
    .populate('movie')
    .sort({ lastWatchedAt: -1 })
    .lean();
  res.json({
    items: items
      .filter((i) => i.movie)
      .map((i) => ({
        _id: i._id,
        movie: i.movie,
        position: i.position,
        duration: i.duration,
        completion: i.completion,
        lastWatchedAt: i.lastWatchedAt,
      })),
  });
});

// GET /api/history/continue  — unfinished titles
export const getContinueWatching = asyncHandler(async (req, res) => {
  const items = await History.find({
    user: req.user._id,
    completion: { $gt: 0, $lt: 95 },
  })
    .populate('movie')
    .sort({ lastWatchedAt: -1 })
    .limit(12)
    .lean();
  res.json({
    items: items
      .filter((i) => i.movie)
      .map((i) => ({ movie: i.movie, position: i.position, completion: i.completion })),
  });
});

// POST /api/history  — upsert playback progress { movieId, position, duration }
export const upsertHistory = asyncHandler(async (req, res) => {
  const { movieId, position = 0, duration = 0 } = req.body;
  if (!movieId) throw httpError(400, 'movieId is required');
  await ensureMovie(movieId);

  const completion = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const doc = await History.findOneAndUpdate(
    { user: req.user._id, movie: movieId },
    { position, duration, completion, lastWatchedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ item: doc });
});

// DELETE /api/history/:id
export const removeHistory = asyncHandler(async (req, res) => {
  await History.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Removed from history' });
});
