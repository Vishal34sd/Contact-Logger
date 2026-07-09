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

// Global Middlewares
// Custom CORS middleware to guarantee '*' is never sent
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Setup Request logging
app.use(requestLogger);

// Parse JSON bodies (as sent by API clients)
app.use(express.json({ limit: '10kb' }));
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Compress response bodies
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Apply rate limiter to all api routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
