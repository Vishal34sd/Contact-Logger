import mongoose from 'mongoose';
import { SYNC_STATUS } from '../constants/index.js';

const syncLogSchema = new mongoose.Schema(
  {
    hubSpotConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HubSpotConnection',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SYNC_STATUS),
      default: SYNC_STATUS.IN_PROGRESS,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    totalFetched: {
      type: Number,
      default: 0,
    },
    totalCreated: {
      type: Number,
      default: 0,
    },
    totalUpdated: {
      type: Number,
      default: 0,
    },
    totalFailed: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    errorDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

syncLogSchema.virtual('durationMs').get(function() {
  if (this.startedAt && this.completedAt) {
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
  return null;
});

syncLogSchema.set('toObject', { virtuals: true });
syncLogSchema.set('toJSON', { virtuals: true });

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

export default SyncLog;
