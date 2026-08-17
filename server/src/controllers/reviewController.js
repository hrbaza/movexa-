import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { asyncHandler, httpError } from '../utils/helpers.js';

/** Recompute a movie's average user rating from its reviews. */
async function recomputeRating(movieId) {
  const agg = await Review.aggregate([
    { $match: { movie: movieId } },
    { $group: { _id: '$movie', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] || {};
  await Movie.updateOne(
    { _id: movieId },
    { userRatingAvg: Math.round(avg * 10) / 10, userRatingCount: count }
  );
}

// GET /api/movies/:idOrSlug/reviews
export const listReviews = asyncHandler(async (req, res) => {
  const movie = await resolveMovie(req.params.idOrSlug);
  const reviews = await Review.find({ movie: movie._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items: reviews });
});

// POST /api/movies/:idOrSlug/reviews  (auth)
export const createReview = asyncHandler(async (req, res) => {
  const { rating, text } = req.body;
  if (!rating || rating < 1 || rating > 5) throw httpError(400, 'Rating must be 1–5');

  const movie = await resolveMovie(req.params.idOrSlug);

  const existing = await Review.findOne({ movie: movie._id, user: req.user._id });
  if (existing) throw httpError(409, 'You have already reviewed this title — edit your review instead');

  const review = await Review.create({
    movie: movie._id,
    user: req.user._id,
    rating,
    text: text || '',
  });
  await recomputeRating(movie._id);
  await review.populate('user', 'name avatar');
  res.status(201).json({ review });
});

// PUT /api/reviews/:id  (auth — own review)
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw httpError(404, 'Review not found');
  if (String(review.user) !== String(req.user._id)) throw httpError(403, 'Not your review');

  if (req.body.rating !== undefined) {
    if (req.body.rating < 1 || req.body.rating > 5) throw httpError(400, 'Rating must be 1–5');
    review.rating = req.body.rating;
  }
  if (req.body.text !== undefined) review.text = req.body.text;
  await review.save();
  await recomputeRating(review.movie);
  await review.populate('user', 'name avatar');
  res.json({ review });
});

// DELETE /api/reviews/:id  (auth — own review, or moderator/admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw httpError(404, 'Review not found');

  const isOwner = String(review.user) === String(req.user._id);
  const canModerate = ['moderator', 'admin', 'super_admin'].includes(req.user.role);
  if (!isOwner && !canModerate) throw httpError(403, 'Not allowed');

  const movieId = review.movie;
  await review.deleteOne();
  await recomputeRating(movieId);
  res.json({ message: 'Review deleted' });
});

// POST /api/reviews/:id/report  (auth)
export const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { reported: true, reportReason: req.body.reason || '' },
    { new: true }
  );
  if (!review) throw httpError(404, 'Review not found');
  res.json({ message: 'Review reported for moderation' });
});

async function resolveMovie(idOrSlug) {
  const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const movie = await Movie.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }).select('_id');
  if (!movie) throw httpError(404, 'Movie not found');
  return movie;
}
