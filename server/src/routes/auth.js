import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors.js';
import { validateLogin, validateRegister } from '../utils/validate.js';

/**
 * Auth routes:
 *   POST /register  create an account, returns { token, user }
 *   POST /login     returns { token, user }
 *   GET  /me        current user (requires token)
 */
export function authRouter({ store, config, requireAuth }) {
  const router = Router();

  const signToken = (user) =>
    jwt.sign({ sub: String(user.id), email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

  // Never expose the password hash.
  const publicUser = ({ id, name, email }) => ({ id, name, email });

  router.post('/register', async (req, res) => {
    const errors = validateRegister(req.body);
    if (Object.keys(errors).length) throw new HttpError(400, 'Validation failed.', errors);

    const email = req.body.email.trim().toLowerCase();
    if (store.findUserByEmail(email)) {
      throw new HttpError(409, 'An account with this email already exists.', {
        email: 'Email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = store.createUser({ name: req.body.name.trim(), email, passwordHash });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  });

  router.post('/login', async (req, res) => {
    const errors = validateLogin(req.body);
    if (Object.keys(errors).length) throw new HttpError(400, 'Validation failed.', errors);

    const user = store.findUserByEmail(req.body.email.trim());
    // Same message for unknown email and wrong password to avoid user enumeration.
    const valid = user && (await bcrypt.compare(req.body.password, user.passwordHash));
    if (!valid) throw new HttpError(401, 'Invalid email or password.');

    res.json({ token: signToken(user), user: publicUser(user) });
  });

  router.get('/me', requireAuth, (req, res) => {
    const user = store.findUserById(req.user.id);
    if (!user) throw new HttpError(401, 'User no longer exists.');
    res.json({ user: publicUser(user) });
  });

  return router;
}
