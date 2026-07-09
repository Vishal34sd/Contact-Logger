import contactRepository from '../repositories/contactRepository.js';
import hubspotConnectionRepository from '../repositories/hubspotConnectionRepository.js';
import { NotFoundError, AppError } from '../errors/index.js';

class ContactService {
  async getContacts(options) {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      throw new AppError('No active HubSpot connection. Please connect first.', 400);
    }

    return contactRepository.findContacts(connection._id, {}, options);
  }

  async getContactById(id) {
    const connection = await hubspotConnectionRepository.getActiveConnection();
    if (!connection) {
      throw new AppError('No active HubSpot connection. Please connect first.', 400);
    }

    const contact = await contactRepository.getContactById(id, connection._id);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    return contact;
  }
}

export default new ContactService();
