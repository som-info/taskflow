import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors.js';

/**
 * Express middleware that requires a valid `Authorization: Bearer <token>` header.
 * On success, `req.user` is set to `{ id, email }`.
 */
export function requireAuth(secret) {
  return (req, _res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new HttpError(401, 'Authentication required.'));
    }

    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: Number(payload.sub), email: payload.email };
      return next();
    } catch {
      return next(new HttpError(401, 'Invalid or expired token.'));
    }
  };
}
