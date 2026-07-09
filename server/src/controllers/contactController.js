import contactService from '../services/contactService.js';
import { successResponse } from '../utils/apiResponse.js';
import { getPaginationMeta } from '../helpers/pagination.js';
import { getContactsQuerySchema } from '../validators/contactValidator.js';

class ContactController {
  async getContacts(req, res) {
    const { query } = getContactsQuerySchema.parse({ query: req.query });

    const { contacts, total } = await contactService.getContacts(query);
    const meta = getPaginationMeta(total, query.page, query.limit);

    return successResponse(res, 200, 'Contacts retrieved', contacts, meta);
  }

  async getContactById(req, res) {

    const { id } = req.params;
    const contact = await contactService.getContactById(id);

    return successResponse(res, 200, 'Contact retrieved', contact);
  }
}

export default new ContactController();
