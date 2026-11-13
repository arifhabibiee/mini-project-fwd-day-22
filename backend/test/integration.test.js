import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { loadConfig } from '../src/config.js';
import { createPool } from '../src/db.js';
import { createApp } from '../src/app.js';

test('real PostgreSQL: readiness, actual generated ID and full product response (SELECT only)', async t => {
  // Private environment is consumed only by runtime; nothing from it is printed.
  const config = loadConfig();
  const pool = createPool(config.database, () => {});
  let server;
  let stage = 'database discovery';
  try {
    const discovery = await pool.query('SELECT id FROM public.products WHERE slug = $1', ['mw75-tumi']);
    assert.equal(discovery.rows.length, 1, 'Seed product must exist');
    const id = discovery.rows[0].id;
    stage = 'runtime role checks';
    const access = await pool.query(`SELECT
      current_setting('default_transaction_read_only') AS read_only,
      (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS superuser,
      has_table_privilege(current_user, 'public.products', 'SELECT') AS can_read,
      has_table_privilege(current_user, 'public.products', 'INSERT,UPDATE,DELETE') AS can_write`);
    assert.equal(access.rows[0].read_only, 'on');
    assert.equal(access.rows[0].superuser, false);
    assert.equal(access.rows[0].can_read, true);
    assert.equal(access.rows[0].can_write, false);
    const permissions = await pool.query(`SELECT table_name,
      has_table_privilege(current_user, format('public.%I', table_name), 'SELECT') AS can_read,
      has_table_privilege(current_user, format('public.%I', table_name), 'INSERT,UPDATE,DELETE') AS can_write
      FROM unnest($1::text[]) AS t(table_name)`,
    [['products', 'product_variants', 'product_images']]);
    assert.equal(permissions.rows.length, 3);
    for (const permission of permissions.rows) {
      assert.equal(permission.can_read, true);
      assert.equal(permission.can_write, false);
    }
    stage = 'HTTP readiness';
    server = createApp({ pool, origins: config.origins, log: () => {} }).listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    stage = 'HTTP product response';
    const response = await fetch(`${base}/api/products/${id}`);
    assert.equal(response.status, 200);
    const { data } = await response.json();
    assert.equal(data.id, id);
    assert.equal(data.slug, 'mw75-tumi');
    assert.equal(data.priceMinor, 75000);
    assert.equal(data.currency, 'USD');
    assert.deepEqual(data.quantityPolicy, { min: 1, maxPerOrder: null });
    assert.equal(data.variants.length, 2);
    assert.equal(data.variants.reduce((sum, v) => sum + v.images.length, 0), 8);
    assert.equal(data.variants.find(v => v.id === data.defaultVariantId).colorCode, 'black');
    for (const variant of data.variants) {
      assert.equal(variant.availability, 'available');
      assert.equal(variant.purchasable, true);
      assert.equal(variant.stockQuantity, null);
      assert.deepEqual(variant.images.map(image => image.position), [0, 1, 2, 3]);
    }
    assert.equal(data.content.features.length, 6);
    assert.equal(data.content.specGroups.length, 3);
    assert.equal(data.content.boxItems.length, 7);
    stage = 'HTTP input and not-found checks';
    assert.equal((await fetch(`${base}/api/products/01`)).status, 400);
    const missing = await pool.query(`SELECT candidate AS id FROM generate_series(1, 100) AS candidate
      WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = candidate) LIMIT 1`);
    assert.equal(missing.rows.length, 1);
    assert.equal((await fetch(`${base}/api/products/${missing.rows[0].id}`)).status, 404);
    t.diagnostic(`Verified public product ID: ${id}; 2 variants, 8 images; runtime role is non-superuser/read-only.`);
  } catch (error) {
    // Never allow an uncaught pg/dotenv error to expose configuration in test output.
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]{2,32}$/.test(error.code)
      ? error.code : 'UNCLASSIFIED';
    assert.fail(`Integration verification failed at ${stage} (${code}). No private details logged.`);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await pool.end().catch(() => {});
  }
});
