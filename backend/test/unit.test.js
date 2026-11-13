import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { parseConfig } from '../src/config.js';
import { parseProductId, mapProduct, findProduct, productQuery, safeUrl } from '../src/products.js';
import { databaseError } from '../src/errors.js';
import { productRow } from './fixture.js';

async function withApp(pool, action) {
  const server = createApp({ pool, origins: ['http://localhost:5500'], log: () => {} }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await action(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('IDs: canonical positive PostgreSQL integer only', () => {
  assert.equal(parseProductId('42'), 42);
  assert.equal(parseProductId('2147483647'), 2147483647);
  for (const value of ['0', '-1', '+1', '01', '1.0', '1e2', ' 1', '1 ', '2147483648', '9'.repeat(100), '1 OR 1=1', undefined]) {
    assert.throws(() => parseProductId(value), error => error.status === 400);
  }
});

test('mapping: generated IDs, order, null stock/limit, full editorial data', () => {
  const row = productRow();
  const product = mapProduct(row);
  assert.equal(product.id, 42);
  assert.equal(product.defaultVariantId, 71);
  assert.equal(product.priceMinor, 75000);
  assert.deepEqual(product.quantityPolicy, { min: 1, maxPerOrder: null });
  assert.deepEqual(product.variants.map(v => v.colorCode), ['black', 'silver']);
  for (const variant of product.variants) {
    assert.equal(variant.purchasable, true);
    assert.equal(variant.stockQuantity, null);
    assert.deepEqual(variant.images.map(i => i.position), [0, 1, 2, 3]);
  }
  assert.deepEqual(product.content, row.content);
});

test('mapping: unknown/unavailable stays a valid non-purchasable product', () => {
  const row = productRow();
  row.variants[0].availability = 'unknown';
  row.variants[1].availability = 'unavailable';
  row.variants[1].stockQuantity = 0;
  assert.ok(mapProduct(row).variants.every(v => !v.purchasable));
});

test('mapping rejects incomplete, contradictory or unsafe database data', () => {
  const mutations = [
    r => { r.variants[0].stockQuantity = 0; },
    r => { r.content.stories[0].media.url = 'javascript:alert(1)'; },
    r => { delete r.content.support.link; },
    r => { r.content.specGroups[0].rows = []; },
    r => { r.content.features[0].iconKey = 'unknown'; },
    r => { r.variants[0].images.pop(); },
    r => { r.variants[0].images[0].position = r.variants[0].images[1].position; },
    r => { r.variants[0].images[0].id = r.variants[1].images[0].id; },
    r => { r.variants[0].isDefault = true; },
    r => { r.variants[1].isDefault = false; },
    r => { r.variants[0].colorCode = 'black'; },
    r => { r.max_per_order = 0; },
    r => { r.price_minor = -1; }
  ];
  for (const mutate of mutations) {
    const row = productRow(); mutate(row);
    assert.throws(() => mapProduct(row), error => error.code === 'INVALID_PRODUCT_DATA');
  }
});

test('safe URLs: only allowed HTTPS hosts or local SVG assets', () => {
  for (const url of ['javascript:alert(1)', 'data:image/svg+xml,x', '//evil.example/x',
    'https://www.masterdynamic.com.evil.example/x', 'https://user:pass@www.masterdynamic.com/x',
    '/assets/../.env', 'http://www.masterdynamic.com/x']) assert.equal(safeUrl(url), false);
  assert.equal(safeUrl('/assets/item-fallback.svg'), true);
  assert.equal(safeUrl('https://support.masterdynamic.com/'), true);
});

test('query is parameterized, not-found is null, DB errors are sanitized', async () => {
  const pool = { query: async (sql, values) => {
    assert.equal(sql, productQuery); assert.deepEqual(values, [42]); return { rows: [] };
  } };
  assert.equal(await findProduct(pool, 42), null);
  assert.match(productQuery, /WHERE p\.id = \$1/);
  for (const code of ['ECONNREFUSED', '57014', '57P01', '28P01', '3D000']) {
    assert.equal(databaseError({ code, message: 'PRIVATE DRIVER DETAIL' }).status, 503);
  }
  assert.equal(databaseError({ code: '42P01' }).status, 500);
});

test('configuration validation is pure and does not expose values', () => {
  const env = { DB_HOST: '127.0.0.1', DB_NAME: 'fixture', DB_USER: 'fixture', DB_PASSWORD: 'UNIT_TEST_ONLY' };
  assert.equal(parseConfig(env).port, 3000);
  assert.equal(parseConfig(env).database.port, 5434);
  assert.throws(() => parseConfig({ ...env, DB_PASSWORD: '' }), /DB_PASSWORD/);
  assert.throws(() => parseConfig({ ...env, PORT: '70000' }), /PORT/);
  assert.throws(() => parseConfig({ ...env, CORS_ORIGINS: '*' }), /CORS_ORIGINS/);
  assert.throws(() => parseConfig({ ...env, CORS_ORIGINS: 'https://evil.example' }), /CORS_ORIGINS/);
});

test('HTTP success, health, input validation before query, not-found, method and route errors', async () => {
  let queries = 0;
  const pool = { query: async (_sql, values) => {
    queries++;
    return { rows: values?.[0] === 42 ? [productRow()] : [] };
  } };
  await withApp(pool, async base => {
    const response = await fetch(`${base}/api/products/42`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.equal((await response.json()).data.id, 42);
    const before = queries;
    for (const id of ['01', '0', '2147483648', '1%20OR%201%3D1', '%E0%A4%A']) {
      assert.equal((await fetch(`${base}/api/products/${id}`)).status, 400);
    }
    assert.equal(queries, before);
    const missing = await fetch(`${base}/api/products/100`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'PRODUCT_NOT_FOUND');
    const post = await fetch(`${base}/api/products/42`, { method: 'POST' });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('allow'), 'GET, HEAD, OPTIONS');
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    for (const path of ['/.env', '/database/seed.sql', '/compose.yaml', '/package.json', '/unknown']) {
      assert.equal((await fetch(base + path)).status, 404);
    }
    const head = await fetch(`${base}/api/products/42`, { method: 'HEAD' });
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
  });
});

test('HTTP: DB outage and internal errors never leak driver details', async () => {
  for (const code of ['ECONNREFUSED', '42P01']) {
    await withApp({ query: async () => { throw Object.assign(new Error('PRIVATE_DRIVER_DETAIL'), { code }); } }, async base => {
      const product = await fetch(`${base}/api/products/42`);
      assert.equal(product.status, code === 'ECONNREFUSED' ? 503 : 500);
      assert.ok(!(await product.text()).includes('PRIVATE_DRIVER_DETAIL'));
      const health = await fetch(`${base}/api/health`);
      assert.equal(health.status, 503);
      assert.equal((await health.json()).data.database, 'unavailable');
    });
  }
});

test('HTTP: invalid editorial payload returns INVALID_PRODUCT_DATA', async () => {
  const row = productRow(); row.content = {};
  await withApp({ query: async () => ({ rows: [row] }) }, async base => {
    const response = await fetch(`${base}/api/products/42`);
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error.code, 'INVALID_PRODUCT_DATA');
  });
});

test('CORS: explicit local allowlist, no wildcard/credentials, GET preflight', async () => {
  await withApp({ query: async () => ({ rows: [] }) }, async base => {
    const response = await fetch(`${base}/api/health`, { headers: { Origin: 'http://localhost:5500' } });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5500');
    assert.equal(response.headers.get('access-control-allow-credentials'), null);
    const denied = await fetch(`${base}/api/health`, { headers: { Origin: 'https://evil.example' } });
    assert.equal(denied.status, 403);
    const preflight = await fetch(`${base}/api/products/42`, {
      method: 'OPTIONS', headers: { Origin: 'http://localhost:5500', 'Access-Control-Request-Method': 'GET' }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-methods'), 'GET, HEAD, OPTIONS');
  });
});
