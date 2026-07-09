import axios from 'axios';
import config from '../config/index.js';
import hubspotConnectionRepository from '../repositories/hubspotConnectionRepository.js';
import syncService from './syncService.js';
import { AppError } from '../errors/index.js';
import logger from '../utils/logger.js';

class AuthService {
  getAuthorizationUrl() {
    const scopes = config.hubspot.scopes.join(' ');
    return `${config.hubspot.authUrl}?client_id=${config.hubspot.clientId}&redirect_uri=${config.hubspot.redirectUri}&scope=${scopes}`;
  }

  async handleCallback(code) {
    try {

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', config.hubspot.clientId);
      params.append('client_secret', config.hubspot.clientSecret);
      params.append('redirect_uri', config.hubspot.redirectUri);
      params.append('code', code);

      const tokenResponse = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      const infoResponse = await axios.get('https://api.hubapi.com/oauth/v1/access-tokens/' + access_token);
      const portalId = infoResponse.data.hub_id.toString();

      const connectionData = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scopes: infoResponse.data.scopes || [],
        domain: infoResponse.data.app_domain,
      };

      const connection = await hubspotConnectionRepository.upsertConnection(portalId, connectionData);

      syncService.syncContacts(connection._id).catch(err => {
        logger.error(`Initial sync failed for portal ${portalId}`, { error: err.message });
      });

      return connection;
    } catch (error) {
      logger.error('HubSpot OAuth Error:', error.response?.data || error.message);
      throw new AppError('Failed to authorize with HubSpot', 400);
    }
  }

  async disconnect() {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      throw new AppError('No active connection found', 404);
    }

    try {

      const updated = await hubspotConnectionRepository.updateConnectionStatus(connection._id, 'inactive');
      return updated;
    } catch (error) {
      logger.error('Error disconnecting HubSpot:', error);
      throw new AppError('Failed to disconnect', 500);
    }
  }

  async getConnectionStatus() {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      return { isConnected: false };
    }

    return {
      isConnected: connection.status === 'active',
      portalId: connection.hubSpotPortalId,
      expiresAt: connection.expiresAt,
      scopes: connection.scopes,
    };
  }
}

export default new AuthService();
