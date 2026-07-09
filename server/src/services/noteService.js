import contactNoteRepository from '../repositories/contactNoteRepository.js';
import contactRepository from '../repositories/contactRepository.js';
import hubspotConnectionRepository from '../repositories/hubspotConnectionRepository.js';
import hubspotClient from '../libs/hubspotClient.js';
import { NOTE_SYNC_STATUS, MAX_RETRY_COUNT } from '../constants/index.js';
import { NotFoundError, AppError } from '../errors/index.js';
import logger from '../utils/logger.js';

class NoteService {
  async createNote(contactId, body) {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      throw new AppError('No active HubSpot connection.', 400);
    }

    const contact = await contactRepository.getContactById(contactId, connection._id);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    // 1. Save locally as pending
    const note = await contactNoteRepository.createNote({
      contactId,
      body,
      syncStatus: NOTE_SYNC_STATUS.PENDING,
    });

    // 2. Try to sync to HubSpot asynchronously (don't block the client response)
    this._syncNoteToHubSpot(note._id, contact.hubSpotContactId, connection._id, body)
      .catch(err => logger.error(`Initial note sync failed`, { noteId: note._id, error: err.message }));

    return note;
  }

  async _syncNoteToHubSpot(noteId, hubSpotContactId, connectionId, body) {
    try {
      // Create in HubSpot
      const hsNote = await hubspotClient.createNote(connectionId, hubSpotContactId, body);

      // Update local note with HS ID and success status
      await contactNoteRepository.updateNote(noteId, {
        hubSpotNoteId: hsNote.id,
        syncStatus: NOTE_SYNC_STATUS.SYNCED,
        lastAttempt: new Date(),
        errorMessage: null,
      });

      logger.info(`Note ${noteId} synced successfully to HubSpot`);
    } catch (error) {
      logger.error(`Note sync failed for ${noteId}`, { error: error.message });

      // Record failure and increment retry
      await contactNoteRepository.updateNote(noteId, {
        syncStatus: NOTE_SYNC_STATUS.FAILED,
        lastAttempt: new Date(),
        errorMessage: error.message,
        $inc: { retryCount: 1 },
      });
      
      throw error; // Let caller catch if awaited
    }
  }

  async getNotes(contactId, options) {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      throw new AppError('No active HubSpot connection.', 400);
    }

    // Basic verification contact exists
    const contact = await contactRepository.getContactById(contactId, connection._id);
    if (!contact) throw new NotFoundError('Contact');

    return contactNoteRepository.getNotesByContactId(contactId, options);
  }

  /**
   * Manual retry method that can be triggered via API or scheduled task later.
   */
  async retryFailedNotes() {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) return { status: 'skipped', message: 'No active connection' };

    const failedNotes = await contactNoteRepository.getRetryableNotes(MAX_RETRY_COUNT, 20);
    if (failedNotes.length === 0) return { status: 'success', message: 'No notes to retry' };

    let successCount = 0;
    let failCount = 0;

    for (const note of failedNotes) {
      const contact = await contactRepository.getContactById(note.contactId, connection._id);
      
      if (!contact) {
        // Contact deleted? Mark note as perm-fail
        await contactNoteRepository.updateNote(note._id, { retryCount: MAX_RETRY_COUNT, errorMessage: 'Contact not found' });
        failCount++;
        continue;
      }

      try {
        await this._syncNoteToHubSpot(note._id, contact.hubSpotContactId, connection._id, note.body);
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    return { status: 'completed', retried: failedNotes.length, success: successCount, failed: failCount };
  }
}

export default new NoteService();
