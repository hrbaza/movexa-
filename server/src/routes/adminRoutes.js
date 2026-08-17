import { Router } from 'express';
import {
  dashboard,
  analytics,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listAllMovies,
  listReportedReviews,
} from '../controllers/adminController.js';
import { tmdbStatus, tmdbSearch, tmdbImport } from '../controllers/tmdbController.js';
import { requireAuth, requireRole, adminRoles } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole(...adminRoles));

// TMDB import tools
router.get('/tmdb/status', tmdbStatus);
router.get('/tmdb/search', tmdbSearch);
router.post('/tmdb/import/:tmdbId', tmdbImport);

router.get('/dashboard', dashboard);
router.get('/analytics', analytics);

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/movies', listAllMovies);
router.get('/reviews', listReportedReviews);

export default router;
