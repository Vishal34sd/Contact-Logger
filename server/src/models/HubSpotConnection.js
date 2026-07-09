import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';
import { CONNECTION_STATUS } from '../constants/index.js';

const hubSpotConnectionSchema = new mongoose.Schema(
  {
    hubSpotPortalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
      select: false, 
    },
    refreshToken: {
      type: String,
      required: true,
      select: false, 
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    scopes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(CONNECTION_STATUS),
      default: CONNECTION_STATUS.ACTIVE,
      index: true,
    },
    domain: String,
    accountName: String,
  },
  {
    timestamps: true,
  }
);

hubSpotConnectionSchema.pre('save', function (next) {
  if (this.isModified('accessToken')) {
    this.accessToken = encrypt(this.accessToken);
  }
  if (this.isModified('refreshToken')) {
    this.refreshToken = encrypt(this.refreshToken);
  }
  next();
});

hubSpotConnectionSchema.methods.getDecryptedAccessToken = function () {
  return decrypt(this.accessToken);
};

hubSpotConnectionSchema.methods.getDecryptedRefreshToken = function () {
  return decrypt(this.refreshToken);
};

hubSpotConnectionSchema.methods.isTokenExpired = function () {
  const bufferMs = 5 * 60 * 1000;
  return Date.now() >= (this.expiresAt.getTime() - bufferMs);
};

const HubSpotConnection = mongoose.model('HubSpotConnection', hubSpotConnectionSchema);

export default HubSpotConnection;
