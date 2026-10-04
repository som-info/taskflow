import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';

/**
 * Build the Express application. The data store and config are injected,
 * which keeps the app easy to test with an in-memory store.
 */
export function createApp({ store, config }) {
  const app = express();
  const auth = requireAuth(config.jwtSecret);

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  app.use('/api/auth', authRouter({ store, config, requireAuth: auth }));
  app.use('/api/tasks', auth, tasksRouter({ store }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
