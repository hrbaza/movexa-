import { Router } from 'express';
import { listGenres, getGenre, createGenre, deleteGenre } from '../controllers/genreController.js';
import { requireAuth, requireRole, adminRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', listGenres);
router.get('/:slug', getGenre);
router.post('/', requireAuth, requireRole(...adminRoles), createGenre);
router.delete('/:id', requireAuth, requireRole(...adminRoles), deleteGenre);

export default router;
