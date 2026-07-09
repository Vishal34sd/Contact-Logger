import express from 'express';
import contactController from '../controllers/contactController.js';
import noteController from '../controllers/noteController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(contactController.getContacts));
router.get('/:id', asyncHandler(contactController.getContactById));

router.get('/:id/notes', asyncHandler(noteController.getNotes));
router.post('/:id/notes', asyncHandler(noteController.createNote));

export default router;
