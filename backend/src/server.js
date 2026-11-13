import { loadConfig } from './config.js';
import { createPool } from './db.js';
import { createApp } from './app.js';

let config;
try { config = loadConfig(); }
catch { console.error('STARTUP_CONFIGURATION_INVALID: periksa konfigurasi environment yang diperlukan.'); process.exit(1); }

const pool = createPool(config.database);
const app = createApp({ pool, origins: config.origins });
const server = app.listen(config.port, '127.0.0.1', () => {
  const baseUrl = `http://127.0.0.1:${config.port}`;
  console.log(`MW75 TUMI backend running at ${baseUrl}`);
  console.log(`Hardcoded page: ${baseUrl}/index-hardcoded.html`);
  console.log(`API-driven page: ${baseUrl}/index-api-product.html?id=1`);
  console.log(`Product endpoint: ${baseUrl}/api/products/1`);
  console.log(`Swagger UI: ${baseUrl}/api/docs/`);
});
server.requestTimeout = 10000;
server.headersTimeout = 10000;
server.on('error', async () => {
  console.error('HTTP_SERVER_START_FAILED');
  await pool.end().catch(() => {});
  process.exitCode = 1;
});

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => {
    console.error('SHUTDOWN_TIMEOUT');
    process.exit(1);
  }, 10000);
  deadline.unref();
  await new Promise(resolve => server.close(resolve));
  await pool.end().catch(() => { console.error('DATABASE_POOL_CLOSE_FAILED'); process.exitCode = 1; });
  clearTimeout(deadline);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
