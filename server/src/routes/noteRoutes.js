import express from 'express';
import noteController from '../controllers/noteController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = express.Router();

// This allows triggering a retry for all failed notes. 
// Can be moved to a worker/cron in the future.
router.post('/retry-failed', asyncHandler(noteController.retryFailed));

export default router;
