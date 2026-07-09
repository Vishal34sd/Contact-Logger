import { ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse.js';
import { AppError } from '../errors/index.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

const handleZodError = (err, res) => {
  const errors = err.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return errorResponse(res, 400, 'Validation Error', errors);
};

const handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return errorResponse(res, 400, message);
};

const handleDuplicateFieldsDB = (err, res) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return errorResponse(res, 409, message);
};

const handleValidationErrorDB = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return errorResponse(res, 400, message);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return errorResponse(res, err.statusCode, err.message, err.errors || null);
  }
  
  // B) Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  return errorResponse(res, 500, 'Something went very wrong!');
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.isDevelopment) {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.assign(err);
    error.message = err.message;

    if (error instanceof ZodError) return handleZodError(error, res);
    if (error.name === 'CastError') error = handleCastErrorDB(error, res);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, res);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error, res);
    
    sendErrorProd(error, req, res);
  }
};
