import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const defaultOrigins = [5500, 5173, 8080, 3000].flatMap(port =>
  [`http://localhost:${port}`, `http://127.0.0.1:${port}`]);

function port(value, key, fallback) {
  const raw = value ?? String(fallback);
  if (!/^[1-9][0-9]*$/.test(raw) || Number(raw) > 65535) {
    throw new Error(`Konfigurasi ${key} tidak valid.`);
  }
  return Number(raw);
}

export function parseConfig(env) {
  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
    if (typeof env[key] !== 'string' || !env[key].trim()) {
      throw new Error(`Konfigurasi ${key} wajib diisi.`);
    }
  }
  const origins = env.CORS_ORIGINS === undefined
    ? defaultOrigins : env.CORS_ORIGINS.split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of origins) {
    let url;
    try { url = new URL(origin); } catch { throw new Error('Konfigurasi CORS_ORIGINS tidak valid.'); }
    if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)
        || !['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw new Error('CORS_ORIGINS harus berupa origin localhost atau 127.0.0.1.');
    }
  }
  return {
    port: port(env.PORT, 'PORT', 3000),
    origins,
    database: {
      host: env.DB_HOST,
      port: port(env.DB_PORT, 'DB_PORT', 5434),
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD
    }
  };
}

export function loadConfig() {
  // Only application runtime loads the private file. Never log dotenv's result,
  // environment values, connection strings, or driver error objects.
  dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
  return parseConfig(process.env);
}
