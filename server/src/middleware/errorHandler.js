import { HttpError } from '../utils/errors.js';

/** 404 handler for unknown routes. */
export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error handler – returns consistent JSON error responses. */
export function errorHandler(err, _req, res, _next) {
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);

  return res.status(status).json({
    error: status === 500 ? 'Internal server error.' : err.message,
    ...(err.details && { details: err.details }),
  });
}
