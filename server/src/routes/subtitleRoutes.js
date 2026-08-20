import { Router } from 'express';
import { searchSubtitles } from '../controllers/subtitleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:tmdbId', requireAuth, searchSubtitles);

export default router;
