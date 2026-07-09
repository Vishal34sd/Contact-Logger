import noteService from '../services/noteService.js';
import { successResponse } from '../utils/apiResponse.js';
import { getPaginationMeta } from '../helpers/pagination.js';
import { createNoteSchema, getNotesQuerySchema } from '../validators/noteValidator.js';

class NoteController {
  async getNotes(req, res) {
    const { params, query } = getNotesQuerySchema.parse({
      params: req.params,
      query: req.query,
    });

    const { notes, total } = await noteService.getNotes(params.id, query);
    const meta = getPaginationMeta(total, query.page, query.limit);

    return successResponse(res, 200, 'Notes retrieved', notes, meta);
  }

  async createNote(req, res) {
    const { params, body } = createNoteSchema.parse({
      params: req.params,
      body: req.body,
    });

    const note = await noteService.createNote(params.id, body.body);

    return successResponse(res, 201, 'Note created and sync initiated', note);
  }

  async retryFailed(req, res) {
    const result = await noteService.retryFailedNotes();
    return successResponse(res, 200, 'Retry task completed', result);
  }
}

export default new NoteController();
