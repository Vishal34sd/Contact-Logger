/**
 * Wraps async route handlers to catch promise rejections and pass them to the express error handler
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
