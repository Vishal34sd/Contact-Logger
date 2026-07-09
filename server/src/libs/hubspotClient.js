import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { HubSpotApiError } from '../errors/index.js';
import hubspotConnectionRepository from '../repositories/hubspotConnectionRepository.js';

class HubSpotClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.hubspot.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this._setupInterceptors();
  }

  _setupInterceptors() {
    // Inject token before every request
    this.client.interceptors.request.use(
      async (requestConfig) => {
        // Only inject token if connectionId is provided in config
        if (requestConfig.connectionId) {
          const connection = await hubspotConnectionRepository.getConnectionById(requestConfig.connectionId);
          
          if (!connection) {
            throw new Error('HubSpot connection not found');
          }

          let accessToken = connection.getDecryptedAccessToken();

          // Proactive refresh if expired
          if (connection.isTokenExpired()) {
            logger.info(`Proactive token refresh for portal ${connection.hubSpotPortalId}`);
            accessToken = await this.refreshAccessToken(connection);
          }

          requestConfig.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return requestConfig;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 Unauthorized (Reactive refresh)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.connectionId) {
          originalRequest._retry = true;
          logger.info(`Reactive token refresh triggered by 401`);

          try {
            const connection = await hubspotConnectionRepository.getConnectionById(originalRequest.connectionId);
            const newAccessToken = await this.refreshAccessToken(connection);
            
            // Retry request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            logger.error('Token refresh failed during 401 retry', { error: refreshError.message });
            return Promise.reject(new HubSpotApiError('Authentication failed', 401));
          }
        }

        return this._handleError(error);
      }
    );
  }

  async refreshAccessToken(connection) {
    try {
      const refreshToken = connection.getDecryptedRefreshToken();
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', config.hubspot.clientId);
      params.append('client_secret', config.hubspot.clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await axios.post(
        'https://api.hubapi.com/oauth/v1/token', // Standard token endpoint
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const { access_token, refresh_token: new_refresh_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      await hubspotConnectionRepository.updateTokens(
        connection._id,
        access_token,
        new_refresh_token || refreshToken, // API might not always return a new refresh token
        expiresAt
      );

      return access_token;
    } catch (error) {
      logger.error('Token refresh error:', error.response?.data || error.message);
      // Mark connection as error/expired
      await hubspotConnectionRepository.updateConnectionStatus(connection._id, 'expired');
      throw new HubSpotApiError('Failed to refresh access token', 401, error);
    }
  }

  _handleError(error) {
    if (error instanceof HubSpotApiError) return Promise.reject(error);

    const status = error.response?.status || 502;
    const message = error.response?.data?.message || error.message || 'HubSpot API Error';
    const details = error.response?.data || null;

    logger.error(`HubSpot API Error [${status}]: ${message}`, { details });
    
    return Promise.reject(new HubSpotApiError(message, status, details));
  }

  // --- API Methods ---

  async getContacts(connectionId, limit = 100, after = null, properties = []) {
    const params = { limit, properties: properties.join(',') };
    if (after) params.after = after;

    const response = await this.client.get('/crm/v3/objects/contacts', {
      connectionId,
      params,
    });

    return response.data;
  }

  async createNote(connectionId, contactId, body, timestamp = new Date().toISOString()) {
    const payload = {
      properties: {
        hs_note_body: body,
        hs_timestamp: timestamp,
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202, // Contact to Note association
            },
          ],
        },
      ],
    };

    const response = await this.client.post('/crm/v3/objects/notes', payload, {
      connectionId,
    });

    return response.data;
  }
}

export default new HubSpotClient();
