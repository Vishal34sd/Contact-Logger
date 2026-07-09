import express from 'express';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import noteRoutes from './noteRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/notes', noteRoutes);

export default router;
