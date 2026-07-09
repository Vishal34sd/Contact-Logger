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
      select: false, // Don't return by default
    },
    refreshToken: {
      type: String,
      required: true,
      select: false, // Don't return by default
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

// Encrypt tokens before saving
hubSpotConnectionSchema.pre('save', function (next) {
  if (this.isModified('accessToken')) {
    this.accessToken = encrypt(this.accessToken);
  }
  if (this.isModified('refreshToken')) {
    this.refreshToken = encrypt(this.refreshToken);
  }
  next();
});

// Decrypt tokens when needed
hubSpotConnectionSchema.methods.getDecryptedAccessToken = function () {
  return decrypt(this.accessToken);
};

hubSpotConnectionSchema.methods.getDecryptedRefreshToken = function () {
  return decrypt(this.refreshToken);
};

// Check if token is expired (adding 5 min buffer)
hubSpotConnectionSchema.methods.isTokenExpired = function () {
  const bufferMs = 5 * 60 * 1000;
  return Date.now() >= (this.expiresAt.getTime() - bufferMs);
};

const HubSpotConnection = mongoose.model('HubSpotConnection', hubSpotConnectionSchema);

export default HubSpotConnection;
