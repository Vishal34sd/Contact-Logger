import express from 'express';
import noteController from '../controllers/noteController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = express.Router();

router.post('/retry-failed', asyncHandler(noteController.retryFailed));

export default router;
