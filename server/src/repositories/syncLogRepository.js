import SyncLog from '../models/SyncLog.js';
import { SYNC_STATUS } from '../constants/index.js';

class SyncLogRepository {
  async createSyncLog(connectionId) {
    return SyncLog.create({
      hubSpotConnectionId: connectionId,
      status: SYNC_STATUS.IN_PROGRESS,
    });
  }

  async updateSyncLog(logId, data) {
    // If completing, set completedAt
    if (data.status && data.status !== SYNC_STATUS.IN_PROGRESS && !data.completedAt) {
      data.completedAt = new Date();
    }
    
    return SyncLog.findByIdAndUpdate(logId, data, { new: true });
  }

  async incrementMetrics(logId, metrics) {
    const incData = {};
    if (metrics.fetched) incData.totalFetched = metrics.fetched;
    if (metrics.created) incData.totalCreated = metrics.created;
    if (metrics.updated) incData.totalUpdated = metrics.updated;
    if (metrics.failed) incData.totalFailed = metrics.failed;

    return SyncLog.findByIdAndUpdate(
      logId,
      { $inc: incData },
      { new: true }
    );
  }

  async getLastCompletedSync(connectionId) {
    return SyncLog.findOne({
      hubSpotConnectionId: connectionId,
      status: SYNC_STATUS.COMPLETED
    }).sort({ completedAt: -1 });
  }

  async getLogsByConnectionId(connectionId, limit = 10) {
    return SyncLog.find({ hubSpotConnectionId: connectionId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new SyncLogRepository();
