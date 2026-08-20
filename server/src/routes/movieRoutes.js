import { Router } from 'express';
import {
  listMovies,
  homeSections,
  getTmdbMovie,
  getMovie,
  similarMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { listReviews, createReview } from '../controllers/reviewController.js';
import { requireAuth, requireRole, optionalAuth, adminRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', listMovies);
router.get('/home', homeSections);
router.get('/tmdb/:tmdbId', getTmdbMovie);

// Reviews nested under a movie
router.get('/:idOrSlug/reviews', listReviews);
router.post('/:idOrSlug/reviews', requireAuth, createReview);
router.get('/:idOrSlug/similar', similarMovies);

router.get('/:idOrSlug', optionalAuth, getMovie);

// Admin CRUD
router.post('/', requireAuth, requireRole(...adminRoles), createMovie);
router.put('/:id', requireAuth, requireRole(...adminRoles), updateMovie);
router.delete('/:id', requireAuth, requireRole(...adminRoles), deleteMovie);

export default router;
