import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    hubSpotContactId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hubSpotConnectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HubSpotConnection',
      required: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    lifecycleStage: String,
    leadStatus: String,
    properties: {
      type: mongoose.Schema.Types.Mixed, // Store raw properties for flexibility
      default: {},
    },
    hubSpotCreatedAt: Date,
    hubSpotUpdatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for querying contacts by connection
contactSchema.index({ hubSpotConnectionId: 1, hubSpotContactId: 1 });
// Compound index for search
contactSchema.index({ hubSpotConnectionId: 1, email: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Virtual for notes count (to be populated)
contactSchema.virtual('notes', {
  ref: 'ContactNote',
  localField: '_id',
  foreignField: 'contactId',
  count: true
});

contactSchema.set('toObject', { virtuals: true });
contactSchema.set('toJSON', { virtuals: true });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
