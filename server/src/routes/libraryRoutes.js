import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  libraryStatus,
  getHistory,
  getContinueWatching,
  upsertHistory,
  removeHistory,
} from '../controllers/libraryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth); // everything here needs a logged-in user

router.get('/watchlist', getWatchlist);
router.post('/watchlist/:movieId', addToWatchlist);
router.delete('/watchlist/:movieId', removeFromWatchlist);

router.get('/favorites', getFavorites);
router.post('/favorites/:movieId', addToFavorites);
router.delete('/favorites/:movieId', removeFromFavorites);

router.get('/library/status/:movieId', libraryStatus);

router.get('/history', getHistory);
router.get('/history/continue', getContinueWatching);
router.post('/history', upsertHistory);
router.delete('/history/:id', removeHistory);

export default router;
