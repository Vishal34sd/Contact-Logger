import authService from '../services/authService.js';
import syncService from '../services/syncService.js';
import hubspotConnectionRepository from '../repositories/hubspotConnectionRepository.js';
import { successResponse } from '../utils/apiResponse.js';
import { authCallbackSchema } from '../validators/authValidator.js';
import config from '../config/index.js';

class AuthController {
  getAuthUrl(req, res) {
    const url = authService.getAuthorizationUrl();
    return successResponse(res, 200, 'Authorization URL generated', { url });
  }

  async handleCallback(req, res) {
    // Validate callback query
    const { query } = authCallbackSchema.parse({ query: req.query });

    await authService.handleCallback(query.code);

    // Redirect to frontend or send success response depending on architecture
    // Assuming frontend closes popup or redirects based on this response
    if (config.isDevelopment) {
      return res.redirect(`${config.client.url}?auth=success`);
    }
    
    return successResponse(res, 200, 'HubSpot connected successfully');
  }

  async disconnect(req, res) {
    await authService.disconnect();
    return successResponse(res, 200, 'HubSpot disconnected successfully');
  }

  async getStatus(req, res) {
    const status = await authService.getConnectionStatus();
    
    let syncInfo = null;
    if (status.isConnected) {
      const connection = await hubspotConnectionRepository.getActiveConnection();
      syncInfo = await syncService.getLastSyncInfo(connection._id);
    }

    return successResponse(res, 200, 'Connection status retrieved', {
      ...status,
      lastSync: syncInfo ? {
        status: syncInfo.status,
        completedAt: syncInfo.completedAt,
        metrics: {
          fetched: syncInfo.totalFetched,
          created: syncInfo.totalCreated,
          updated: syncInfo.totalUpdated,
          failed: syncInfo.totalFailed,
        }
      } : null
    });
  }
}

export default new AuthController();
