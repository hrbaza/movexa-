import Genre from '../models/Genre.js';
import Movie from '../models/Movie.js';
import { asyncHandler, httpError, slugify } from '../utils/helpers.js';

// GET /api/genres
export const listGenres = asyncHandler(async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 }).lean();
  // attach movie counts
  const counts = await Movie.aggregate([
    { $match: { published: true } },
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json({ items: genres.map((g) => ({ ...g, count: countMap[g.name] || 0 })) });
});

// GET /api/genres/:slug  — genre + its movies
export const getGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findOne({ slug: req.params.slug }).lean();
  if (!genre) throw httpError(404, 'Genre not found');
  const movies = await Movie.find({ published: true, genres: genre.name })
    .sort({ popularity: -1 })
    .lean();
  res.json({ genre, movies });
});

// POST /api/genres  (admin)
export const createGenre = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw httpError(400, 'Genre name is required');
  const genre = await Genre.create({ name, slug: slugify(name), description: description || '' });
  res.status(201).json({ genre });
});

// DELETE /api/genres/:id  (admin)
export const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) throw httpError(404, 'Genre not found');
  res.json({ message: 'Genre deleted' });
});
