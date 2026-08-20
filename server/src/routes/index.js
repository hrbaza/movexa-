import { Router } from 'express';
import authRoutes from './authRoutes.js';
import movieRoutes from './movieRoutes.js';
import genreRoutes from './genreRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import libraryRoutes from './libraryRoutes.js';
import adminRoutes from './adminRoutes.js';
import subtitleRoutes from './subtitleRoutes.js';
import { search } from '../controllers/searchController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'movexa-api' }));

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/genres', genreRoutes);
router.use('/reviews', reviewRoutes);
router.get('/search', search);
router.use('/subtitles', subtitleRoutes);
router.use('/', libraryRoutes); // watchlist, favorites, history, library/status
router.use('/admin', adminRoutes);

export default router;
