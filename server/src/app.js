import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';

import config from './config/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { NotFoundError } from './errors/index.js';
import routes from './routes/index.js';

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin || config.client.url;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(requestLogger);

app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use(compression());

app.use(mongoSanitize());

app.use('/api', apiLimiter);

app.use('/api', routes);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;
