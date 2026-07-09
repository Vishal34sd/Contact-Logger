import mongoose from 'mongoose';
import { NOTE_SYNC_STATUS } from '../constants/index.js';

const contactNoteSchema = new mongoose.Schema(
  {
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
    },
    hubSpotNoteId: {
      type: String,
      index: true,
    },
    syncStatus: {
      type: String,
      enum: Object.values(NOTE_SYNC_STATUS),
      default: NOTE_SYNC_STATUS.PENDING,
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastAttempt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

contactNoteSchema.index({ syncStatus: 1, retryCount: 1 });

contactNoteSchema.index({ contactId: 1, createdAt: -1 });

const ContactNote = mongoose.model('ContactNote', contactNoteSchema);

export default ContactNote;
