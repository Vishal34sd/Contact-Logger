import hubspotClient from '../libs/hubspotClient.js';
import contactRepository from '../repositories/contactRepository.js';
import syncLogRepository from '../repositories/syncLogRepository.js';
import syncCheckpointRepository from '../repositories/syncCheckpointRepository.js';
import logger from '../utils/logger.js';
import { SYNC_STATUS, HUBSPOT_CONTACT_PROPERTIES } from '../constants/index.js';

class SyncService {
    async syncContacts(connectionId) {
    let syncLog = null;
    let metrics = { fetched: 0, created: 0, updated: 0, failed: 0 };

    try {

      syncLog = await syncLogRepository.createSyncLog(connectionId);
      logger.info(`Starting contact sync [Log: ${syncLog._id}]`);

      const checkpoint = await syncCheckpointRepository.getCheckpoint(connectionId, 'contact');
      let after = checkpoint ? checkpoint.cursor : null;

      let hasMore = true;

      while (hasMore) {

        const response = await hubspotClient.getContacts(
          connectionId,
          100, 
          after,
          HUBSPOT_CONTACT_PROPERTIES
        );

        const contacts = response.results;

        if (contacts && contacts.length > 0) {
          metrics.fetched += contacts.length;

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


          try {
            const result = await contactRepository.upsertContacts(mappedContacts);

            metrics.created += result.upsertedCount || 0;
            metrics.updated += result.modifiedCount || 0;
          } catch (dbError) {
            logger.error(`DB upsert error during sync`, { error: dbError.message });
            metrics.failed += contacts.length;


          }


          await syncLogRepository.incrementMetrics(syncLog._id, metrics);

          metrics = { fetched: 0, created: 0, updated: 0, failed: 0 };
        }


        if (response.paging && response.paging.next && response.paging.next.after) {
          after = response.paging.next.after;

          await syncCheckpointRepository.saveCheckpoint(connectionId, 'contact', after);
        } else {
          hasMore = false;
        }
      }

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

      await syncCheckpointRepository.setCheckpointError(connectionId, 'contact');

    }
  }

  async getLastSyncInfo(connectionId) {
    const lastLog = await syncLogRepository.getLastCompletedSync(connectionId);
    return lastLog;
  }
}

export default new SyncService();
