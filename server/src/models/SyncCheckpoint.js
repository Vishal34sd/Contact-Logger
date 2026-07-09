import mongoose from 'mongoose';

const syncCheckpointSchema = new mongoose.Schema(
  {
    hubSpotConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HubSpotConnection',
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['contact', 'note'], 
      default: 'contact',
    },
    cursor: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'paused', 'error'],
      default: 'in_progress',
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

syncCheckpointSchema.index({ hubSpotConnectionId: 1, entityType: 1 }, { unique: true });

const SyncCheckpoint = mongoose.model('SyncCheckpoint', syncCheckpointSchema);

export default SyncCheckpoint;
