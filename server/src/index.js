/**
 * TaskFlow API entry point.
 */
import { createApp } from './app.js';
import { config } from './config.js';
import { createStore } from './store.js';

const store = createStore(config.dataFile);
const app = createApp({ store, config });

const server = app.listen(config.port, () => {
  console.log(`TaskFlow API running at http://localhost:${config.port}`);
});

// Close the HTTP server cleanly on shutdown.
function shutdown() {
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
