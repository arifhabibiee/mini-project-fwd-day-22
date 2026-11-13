import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openapi from '../openapi.json' with { type: 'json' };
import { fileURLToPath } from 'node:url';
import { findProduct, parseProductId } from './products.js';
import { HttpError, errorBody } from './errors.js';

export function createApp({ pool, origins = [], log = console.error }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('etag', false);
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.vary('Origin');
    const origin = req.get('Origin');
    if (origin && !origins.includes(origin)) {
      return next(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origin tidak diizinkan.'));
    }
    if (origin) res.set('Access-Control-Allow-Origin', origin);
    if (req.method === 'OPTIONS') {
      if (origin) {
        res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Accept');
      }
      return res.status(204).end();
    }
    next();
  });

  app.get('/api/health', async (_req, res) => {
    try {
      // Check DB reachability and SELECT access to all required tables, even empty.
      await pool.query(`SELECT
        EXISTS(SELECT 1 FROM public.products LIMIT 1),
        EXISTS(SELECT 1 FROM public.product_variants LIMIT 1),
        EXISTS(SELECT 1 FROM public.product_images LIMIT 1)`);
      res.json({ data: { status: 'ok', application: 'ready', database: 'ready' } });
    } catch {
      log('DATABASE_READINESS_FAILED');
      res.status(503).json({ data: { status: 'degraded', application: 'ready', database: 'unavailable' },
        ...errorBody(new HttpError(503, 'DATABASE_UNAVAILABLE', 'Database sementara tidak tersedia.')) });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    const id = parseProductId(req.params.id);
    const product = await findProduct(pool, id);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Produk tidak ditemukan.');
    res.json({ data: product });
  });
  const methodNotAllowed = (_req, res, next) => {
    res.set('Allow', 'GET, HEAD, OPTIONS');
    next(new HttpError(405, 'METHOD_NOT_ALLOWED', 'Method tidak diizinkan.'));
  };
  app.all('/api/health', methodNotAllowed);
  app.all('/api/products/:id', methodNotAllowed);
  app.get('/api/openapi.json', (_req, res) => res.json(openapi));
  // Only bundled documentation assets; never expose backend/root directories.
  app.get(/^\/api\/docs$/, (_req, res) => res.redirect(302, '/api/docs/'));
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs/', swaggerUi.setup(null, {
    customSiteTitle: 'Independent Product API Documentation',
    swaggerOptions: {
      url: '/api/openapi.json', validatorUrl: null,
      supportedSubmitMethods: ['get'], persistAuthorization: false
    }
  }));
  app.get('/', (_req, res) => res.redirect(302, '/index-hardcoded.html'));
  // Browser files live only in frontend; never mount the root or legacy archive.
  const frontendDirectory = fileURLToPath(new URL('../../frontend/', import.meta.url));
  app.use(express.static(frontendDirectory, { dotfiles: 'deny', index: false, redirect: false }));
  app.use((_req, _res, next) => next(new HttpError(404, 'ROUTE_NOT_FOUND', 'Route tidak ditemukan.')));
  app.use((error, _req, res, _next) => {
    const safeError = error instanceof HttpError ? error
      : new HttpError(error instanceof URIError ? 400 : 500,
        error instanceof URIError ? 'INVALID_REQUEST' : 'INTERNAL_ERROR',
        error instanceof URIError ? 'Request tidak valid.' : 'Terjadi kesalahan internal.');
    // Never pass raw Error objects/messages, request URLs or configuration to logs.
    if (safeError.status >= 500) log(safeError.code);
    res.status(safeError.status).json(errorBody(safeError));
  });
  return app;
}
