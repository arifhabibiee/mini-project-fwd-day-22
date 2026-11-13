import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { loadConfig } from '../src/config.js';
import { createPool } from '../src/db.js';
import { createApp } from '../src/app.js';
import { fetchProductById } from '../../frontend/js/product-api.js';
import { validateProduct } from '../../frontend/js/product-model.js';
import { staticProduct } from '../../frontend/js/product-data.js';

// Real integration test: requires Docker PostgreSQL and a configured .env.
test('real PostgreSQL -> Express API -> frontend product mapping', async t => {
  const config = loadConfig();
  const pool = createPool(config.database, () => {});
  let server;
  try {
    const rows = await pool.query('SELECT id FROM public.products WHERE slug = $1', ['mw75-tumi']);
    assert.equal(rows.rows.length, 1);
    const id = rows.rows[0].id;
    server = createApp({ pool, origins: config.origins, log: () => {} }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const path of ['/', '/index-hardcoded.html', `/index-api-product.html?id=${id}`,
      '/styles.css', '/js/product-api.js', '/assets/mw75-black-fallback.svg']) {
      assert.equal((await fetch(base + path)).status, 200);
    }
    const product = await fetchProductById(String(id), {
      fetcher: (path, options) => fetch(base + path, options)
    });
    const local = validateProduct(staticProduct);
    for (const key of ['slug', 'name', 'subtitle', 'description', 'priceMinor', 'currency', 'content']) {
      assert.deepEqual(product[key], local[key]);
    }
    assert.deepEqual(product.variants.map(variant => variant.colorCode),
      local.variants.map(variant => variant.colorCode));
    assert.deepEqual(product.variants.map(variant => variant.stockQuantity), [5, 10]);
    assert.equal(product.quantityPolicy.maxPerOrder, null);
    assert.equal(product.variants.reduce((sum, variant) => sum + variant.images.length, 0), 8);
    t.diagnostic(`Read-only API integration verified for product ID ${id}`);
  } catch (error) {
    // Keep private driver/configuration details out of the test report.
    assert.fail(`API/DB integration failed: ${error.code || error.name || 'UNKNOWN'}`);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await pool.end().catch(() => {});
  }
});
