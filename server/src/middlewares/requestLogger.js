import morgan from 'morgan';
import logger from '../utils/logger.js';
import config from '../config/index.js';

const stream = {

  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = config.nodeEnv || 'development';
  return env !== 'development' && env !== 'production';
};

const requestLogger = morgan(

  ':method :url :status :res[content-length] - :response-time ms',

  { stream, skip }
);

export default requestLogger;
