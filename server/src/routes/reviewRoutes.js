import { Router } from 'express';
import { updateReview, deleteReview, reportReview } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.put('/:id', requireAuth, updateReview);
router.delete('/:id', requireAuth, deleteReview);
router.post('/:id/report', requireAuth, reportReview);

export default router;
