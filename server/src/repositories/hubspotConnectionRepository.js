import HubSpotConnection from '../models/HubSpotConnection.js';
import { CONNECTION_STATUS } from '../constants/index.js';

class HubSpotConnectionRepository {
  async getActiveConnection() {

    return HubSpotConnection.findOne({ status: CONNECTION_STATUS.ACTIVE })
      .select('+accessToken +refreshToken');
  }

  async getConnectionById(id) {
    return HubSpotConnection.findById(id).select('+accessToken +refreshToken');
  }

  async upsertConnection(portalId, data) {
    return HubSpotConnection.findOneAndUpdate(
      { hubSpotPortalId: portalId },
      { ...data, status: CONNECTION_STATUS.ACTIVE },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async updateConnectionStatus(id, status) {
    return HubSpotConnection.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }

  async updateTokens(id, accessToken, refreshToken, expiresAt) {
    const connection = await HubSpotConnection.findById(id).select('+accessToken +refreshToken');
    if (!connection) return null;

    connection.accessToken = accessToken;
    connection.refreshToken = refreshToken;
    connection.expiresAt = expiresAt;

    return connection.save();
  }
}

export default new HubSpotConnectionRepository();
