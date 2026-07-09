import morgan from 'morgan';
import logger from '../utils/logger.js';
import config from '../config/index.js';

const stream = {
  // Use the http severity
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = config.nodeEnv || 'development';
  return env !== 'development' && env !== 'production';
};

// Build the morgan middleware
const requestLogger = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the morgan library.
  // You can create your custom token to show what do you want from a request.
  ':method :url :status :res[content-length] - :response-time ms',
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

export default requestLogger;
