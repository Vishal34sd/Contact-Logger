import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    logger.debug('=> using existing database connection');
    return;
  }

  try {
    const db = await mongoose.connect(config.mongodb.uri);
    isConnected = db.connections[0].readyState === 1;
    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
  isConnected = true;
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to application termination');
  process.exit(0);
});
