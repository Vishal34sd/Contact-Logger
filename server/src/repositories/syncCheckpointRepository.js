import SyncCheckpoint from '../models/SyncCheckpoint.js';

class SyncCheckpointRepository {
  async getCheckpoint(connectionId, entityType) {
    return SyncCheckpoint.findOne({ hubSpotConnectionId: connectionId, entityType });
  }

  async saveCheckpoint(connectionId, entityType, cursor) {
    return SyncCheckpoint.findOneAndUpdate(
      { hubSpotConnectionId: connectionId, entityType },
      { 
        cursor,
        status: 'in_progress',
        lastSyncedAt: new Date()
      },
      { upsert: true, new: true }
    );
  }

  async clearCheckpoint(connectionId, entityType) {
    return SyncCheckpoint.findOneAndDelete({ hubSpotConnectionId: connectionId, entityType });
  }

  async setCheckpointError(connectionId, entityType) {
    return SyncCheckpoint.findOneAndUpdate(
      { hubSpotConnectionId: connectionId, entityType },
      { status: 'error' },
      { new: true }
    );
  }
}

export default new SyncCheckpointRepository();
