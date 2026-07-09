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
      enum: ['contact', 'note'], // Extensible for future entities
      default: 'contact',
    },
    cursor: {
      type: String, // The 'after' pagination token from HubSpot
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

// Ensures only one checkpoint per entity type per connection
syncCheckpointSchema.index({ hubSpotConnectionId: 1, entityType: 1 }, { unique: true });

const SyncCheckpoint = mongoose.model('SyncCheckpoint', syncCheckpointSchema);

export default SyncCheckpoint;
