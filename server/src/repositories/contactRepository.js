import Contact from '../models/Contact.js';

class ContactRepository {
  async upsertContacts(contactsData) {
    const bulkOps = contactsData.map(contact => ({
      updateOne: {
        filter: { 
          hubSpotContactId: contact.hubSpotContactId,
          hubSpotConnectionId: contact.hubSpotConnectionId
        },
        update: { $set: contact },
        upsert: true,
      }
    }));

    if (bulkOps.length === 0) return { modifiedCount: 0, upsertedCount: 0 };

    return Contact.bulkWrite(bulkOps);
  }

  async findContacts(connectionId, query = {}, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt', search = '' } = options;
    const skip = (page - 1) * limit;

    const filter = { hubSpotConnectionId: connectionId, ...query };

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(filter)
    ]);

    return { contacts, total };
  }

  async getContactById(contactId, connectionId) {
    return Contact.findOne({ _id: contactId, hubSpotConnectionId: connectionId })
      .populate('notes');
  }

  async getContactByHubSpotId(hubSpotContactId, connectionId) {
    return Contact.findOne({ hubSpotContactId, hubSpotConnectionId });
  }
}

export default new ContactRepository();
