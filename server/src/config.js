/**
 * Centralised configuration loaded from environment variables (.env).
 */
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set in production.');
  }
  // Development fallback: random per process (tokens reset on restart).
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[config] JWT_SECRET not set – using a temporary random secret.');
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dataFile: process.env.DATA_FILE || 'data/db.json',
  clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
};
