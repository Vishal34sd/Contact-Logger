import express from 'express';
import authController from '../controllers/authController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/hubspot', authLimiter, asyncHandler(authController.getAuthUrl));
router.get('/hubspot/callback', authLimiter, asyncHandler(authController.handleCallback));
router.post('/hubspot/disconnect', asyncHandler(authController.disconnect));
router.get('/hubspot/status', asyncHandler(authController.getStatus));

export default router;
