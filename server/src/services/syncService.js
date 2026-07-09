import hubspotClient from '../libs/hubspotClient.js';
import contactRepository from '../repositories/contactRepository.js';
import syncLogRepository from '../repositories/syncLogRepository.js';
import syncCheckpointRepository from '../repositories/syncCheckpointRepository.js';
import logger from '../utils/logger.js';
import { SYNC_STATUS, HUBSPOT_CONTACT_PROPERTIES } from '../constants/index.js';

class SyncService {
  /**
   * Orchestrates the synchronization of contacts from HubSpot.
   * Designed to be idempotent and resumable.
   * Can be easily plugged into a background worker queue like BullMQ later.
   *
   * @param {string} connectionId - The HubSpotConnection document ID
   */
  async syncContacts(connectionId) {
    let syncLog = null;
    let metrics = { fetched: 0, created: 0, updated: 0, failed: 0 };

    try {
      // 1. Create a SyncLog entry
      syncLog = await syncLogRepository.createSyncLog(connectionId);
      logger.info(`Starting contact sync [Log: ${syncLog._id}]`);

      // 2. Check for existing checkpoint to resume
      const checkpoint = await syncCheckpointRepository.getCheckpoint(connectionId, 'contact');
      let after = checkpoint ? checkpoint.cursor : null;

      let hasMore = true;

      // 3. Loop through pagination
      while (hasMore) {
        // Fetch page from HubSpot
        const response = await hubspotClient.getContacts(
          connectionId,
          100, // MAX_PAGE_SIZE
          after,
          HUBSPOT_CONTACT_PROPERTIES
        );

        const contacts = response.results;
        
        if (contacts && contacts.length > 0) {
          metrics.fetched += contacts.length;

          // Map to local format
          const mappedContacts = contacts.map(c => ({
            hubSpotContactId: c.id,
            hubSpotConnectionId: connectionId,
            email: c.properties.email || '',
            firstName: c.properties.firstname || '',
            lastName: c.properties.lastname || '',
            phone: c.properties.phone || '',
            company: c.properties.company || '',
            jobTitle: c.properties.jobtitle || '',
            lifecycleStage: c.properties.lifecyclestage || '',
            leadStatus: c.properties.hs_lead_status || '',
            properties: c.properties,
            hubSpotCreatedAt: c.createdAt,
            hubSpotUpdatedAt: c.updatedAt,
          }));

          // Upsert to DB
          try {
            const result = await contactRepository.upsertContacts(mappedContacts);
            // Mongoose bulkWrite returns upsertedCount and modifiedCount
            metrics.created += result.upsertedCount || 0;
            metrics.updated += result.modifiedCount || 0;
          } catch (dbError) {
            logger.error(`DB upsert error during sync`, { error: dbError.message });
            metrics.failed += contacts.length;
            // Depending on strictness, might want to throw here. 
            // For resilience, we count as failed and continue.
          }

          // Update metrics in DB periodically (every page)
          await syncLogRepository.incrementMetrics(syncLog._id, metrics);
          // Reset local metrics counter so we only increment the diff next time
          metrics = { fetched: 0, created: 0, updated: 0, failed: 0 };
        }

        // Handle pagination
        if (response.paging && response.paging.next && response.paging.next.after) {
          after = response.paging.next.after;
          // Save checkpoint for resume if crash happens
          await syncCheckpointRepository.saveCheckpoint(connectionId, 'contact', after);
        } else {
          hasMore = false;
        }
      }

      // 4. Sync completed successfully
      await syncCheckpointRepository.clearCheckpoint(connectionId, 'contact');
      await syncLogRepository.updateSyncLog(syncLog._id, { status: SYNC_STATUS.COMPLETED });
      logger.info(`Contact sync completed successfully [Log: ${syncLog._id}]`);

    } catch (error) {
      logger.error(`Contact sync failed`, { error: error.message, stack: error.stack });
      
      if (syncLog) {
        await syncLogRepository.updateSyncLog(syncLog._id, { 
          status: SYNC_STATUS.FAILED,
          errorMessage: error.message,
          errorDetails: error.response?.data || null
        });
      }

      // Mark checkpoint as error so it can be manually retried if needed
      await syncCheckpointRepository.setCheckpointError(connectionId, 'contact');
      
      // We don't throw here if this is running un-awaited in the background.
      // If plugged into BullMQ, you WOULD throw here to trigger queue retry mechanisms.
    }
  }

  async getLastSyncInfo(connectionId) {
    const lastLog = await syncLogRepository.getLastCompletedSync(connectionId);
    return lastLog;
  }
}

export default new SyncService();
