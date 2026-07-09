import ContactNote from '../models/ContactNote.js';

class ContactNoteRepository {
  async createNote(data) {
    return ContactNote.create(data);
  }

  async updateNote(noteId, data) {
    return ContactNote.findByIdAndUpdate(noteId, data, { new: true });
  }

  async getNotesByContactId(contactId, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      ContactNote.find({ contactId })
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      ContactNote.countDocuments({ contactId })
    ]);

    return { notes, total };
  }

  async getNotesByStatus(syncStatus, limit = 50) {
    return ContactNote.find({ syncStatus })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  async getRetryableNotes(maxRetries, limit = 50) {
    return ContactNote.find({
      syncStatus: 'failed',
      retryCount: { $lt: maxRetries }
    })
      .sort({ lastAttempt: 1 }) // Older attempts first
      .limit(limit);
  }
}

export default new ContactNoteRepository();
