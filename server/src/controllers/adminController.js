import User, { ROLES } from '../models/User.js';
import Movie from '../models/Movie.js';
import Review from '../models/Review.js';
import { History } from '../models/UserContent.js';
import { asyncHandler, httpError } from '../utils/helpers.js';

// GET /api/admin/dashboard
export const dashboard = asyncHandler(async (req, res) => {
  const [
    userCount,
    movieCount,
    publishedCount,
    reviewCount,
    viewsAgg,
    recentUsers,
    topMovies,
  ] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Movie.countDocuments({ published: true }),
    Review.countDocuments(),
    Movie.aggregate([{ $group: { _id: null, views: { $sum: '$views' } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Movie.find().sort({ views: -1 }).limit(5).select('title poster views rating year').lean(),
  ]);

  res.json({
    stats: {
      users: userCount,
      movies: movieCount,
      published: publishedCount,
      reviews: reviewCount,
      totalViews: viewsAgg[0]?.views || 0,
    },
    recentUsers: recentUsers.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
    topMovies,
  });
});

// GET /api/admin/analytics
export const analytics = asyncHandler(async (req, res) => {
  const [genrePop, viewsByMovie, ratingBuckets, signupsByDay] = await Promise.all([
    Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', views: { $sum: '$views' }, count: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]),
    Movie.find().sort({ views: -1 }).limit(8).select('title views').lean(),
    Movie.aggregate([
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 2, 4, 6, 8, 10.1],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ]);

  res.json({
    genrePopularity: genrePop.map((g) => ({ genre: g._id, views: g.views, count: g.count })),
    topMovies: viewsByMovie,
    ratingDistribution: ratingBuckets,
    signups: signupsByDay,
  });
});

// GET /api/admin/users?search=&role=&page=
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const re = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: re }, { email: re }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    items: items.map((u) => {
      delete u.passwordHash;
      return u;
    }),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    roles: ROLES,
  });
});

// GET /api/admin/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw httpError(404, 'User not found');
  delete user.passwordHash;
  const [reviews, watched] = await Promise.all([
    Review.countDocuments({ user: user._id }),
    History.countDocuments({ user: user._id }),
  ]);
  res.json({ user, activity: { reviews, watched } });
});

// PUT /api/admin/users/:id  — change role / status
export const updateUser = asyncHandler(async (req, res) => {
  const { role, status } = req.body;

  // Only super_admin may create/modify admins.
  if (role && ['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
    throw httpError(403, 'Only a Super Admin can assign admin roles');
  }
  if (role && !ROLES.includes(role)) throw httpError(400, 'Invalid role');

  const target = await User.findById(req.params.id);
  if (!target) throw httpError(404, 'User not found');
  if (String(target._id) === String(req.user._id) && status === 'suspended') {
    throw httpError(400, 'You cannot suspend your own account');
  }

  if (role) target.role = role;
  if (status) target.status = status;
  await target.save();
  res.json({ user: target.toSafeJSON() });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw httpError(400, 'You cannot delete your own account');
  }
  const target = await User.findById(req.params.id);
  if (!target) throw httpError(404, 'User not found');
  if (target.role === 'super_admin') throw httpError(403, 'A Super Admin account cannot be deleted');

  await target.deleteOne();
  res.json({ message: 'User deleted' });
});

// GET /api/admin/movies  — includes unpublished
export const listAllMovies = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const filter = {};
  if (req.query.search) filter.title = new RegExp(req.query.search, 'i');
  if (req.query.published === 'true') filter.published = true;
  if (req.query.published === 'false') filter.published = false;

  const [items, total] = await Promise.all([
    Movie.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Movie.countDocuments(filter),
  ]);
  res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
});

// GET /api/admin/reviews  — reported reviews for moderation
export const listReportedReviews = asyncHandler(async (req, res) => {
  const items = await Review.find({ reported: true })
    .populate('user', 'name email')
    .populate('movie', 'title slug poster')
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ items });
});
