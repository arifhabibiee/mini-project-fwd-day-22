import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import SwaggerParser from '@apidevtools/swagger-parser';
import spec from '../openapi.json' with { type: 'json' };
import { createApp } from '../src/app.js';
import { mapProduct } from '../src/products.js';
import { productRow } from './fixture.js';

// Assertions for the small schema subset used in this specification. Document
// validity/$ref resolution is independently checked by SwaggerParser below.
function assertResponse(value, schema, path = 'response') {
  if (schema.$ref) return assertResponse(value, spec.components.schemas[schema.$ref.split('/').at(-1)], path);
  if (value === null && schema.nullable) return;
  if (schema.allOf) schema.allOf.forEach(part => assertResponse(value, part, path));
  if (schema.anyOf) {
    assert.ok(schema.anyOf.some(part => {
      try { assertResponse(value, part, path); return true; } catch { return false; }
    }), `${path}: anyOf`);
  }
  if (schema.type === 'object') {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), path);
    for (const key of schema.required ?? []) assert.ok(Object.hasOwn(value, key), `${path}.${key} required`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) assertResponse(value[key], child, `${path}.${key}`);
    }
  }
  if (schema.type === 'array') {
    assert.ok(Array.isArray(value), path);
    if (schema.minItems !== undefined) assert.ok(value.length >= schema.minItems, path);
    if (schema.maxItems !== undefined) assert.ok(value.length <= schema.maxItems, path);
    value.forEach((item, i) => assertResponse(item, schema.items, `${path}[${i}]`));
  }
  if (schema.type === 'string') assert.equal(typeof value, 'string', path);
  if (schema.type === 'boolean') assert.equal(typeof value, 'boolean', path);
  if (schema.type === 'integer') assert.ok(Number.isInteger(value), path);
  if (schema.enum) assert.ok(schema.enum.includes(value), path);
  if (typeof value === 'string') {
    if (schema.minLength) assert.ok(value.length >= schema.minLength, path);
    if (schema.pattern) assert.match(value, new RegExp(schema.pattern), path);
    if (schema.format === 'uri') assert.doesNotThrow(() => new URL(value), path);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined) assert.ok(value >= schema.minimum, path);
    if (schema.maximum !== undefined) assert.ok(value <= schema.maximum, path);
  }
}

async function withApp(pool, action) {
  const server = createApp({ pool, log: () => {} }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await action(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('OpenAPI 3.0.3 document and all local refs validate; only actual GET endpoints', async () => {
  await SwaggerParser.validate(structuredClone(spec), { resolve: { external: false }, dereference: { circular: false } });
  assert.equal(spec.openapi, '3.0.3');
  assert.deepEqual(Object.keys(spec.paths).sort(), ['/api/health', '/api/products/{id}']);
  assert.deepEqual(spec.servers.map(server => server.url), ['/']);
  for (const item of Object.values(spec.paths)) assert.deepEqual(Object.keys(item), ['get']);
  const parameter = spec.paths['/api/products/{id}'].get.parameters[0];
  assert.equal(parameter.schema.type, 'integer');
  assert.equal(parameter.schema.minimum, 1);
  assert.equal(parameter.schema.maximum, 2147483647);
});

test('documented examples and actual mapping satisfy nested response schemas', () => {
  for (const path of Object.values(spec.paths)) {
    for (const response of Object.values(path.get.responses)) {
      const content = response.content['application/json'];
      if (content.example) assertResponse(content.example, content.schema);
      for (const example of Object.values(content.examples ?? {})) assertResponse(example.value, content.schema);
    }
  }
  const productSchema = spec.paths['/api/products/{id}'].get.responses['200'].content['application/json'].schema;
  const actual = { data: mapProduct(productRow()) };
  assertResponse(actual, productSchema);
  assert.notEqual(actual.data.defaultVariantId, 1);
  actual.data.variants[0].referenceVariantId = null;
  actual.data.variants[0].images[0].fallbackUrl = null;
  assertResponse(actual, productSchema);
  const broken = structuredClone(actual); delete broken.data.content.support;
  assert.throws(() => assertResponse(broken, productSchema));
});

test('Swagger HTML, local assets and public JSON work without any DB query', async () => {
  let calls = 0;
  await withApp({ query: async () => { calls++; throw new Error('DB must not be queried for docs'); } }, async base => {
    const redirect = await fetch(`${base}/api/docs`, { redirect: 'manual' });
    assert.equal(redirect.status, 302); assert.equal(redirect.headers.get('location'), '/api/docs/');
    const page = await fetch(`${base}/api/docs/`);
    assert.equal(page.status, 200); assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /swagger-ui/);
    for (const asset of ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js']) {
      const response = await fetch(`${base}/api/docs/${asset}`);
      assert.equal(response.status, 200);
      await response.arrayBuffer();
    }
    const init = await (await fetch(`${base}/api/docs/swagger-ui-init.js`)).text();
    assert.match(init, /\/api\/openapi\.json/);
    assert.match(init, /"validatorUrl": null/);
    assert.match(init, /"supportedSubmitMethods": \[\s*"get"\s*\]/);
    const json = await fetch(`${base}/api/openapi.json`);
    assert.equal(json.status, 200); assert.match(json.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await json.json(), spec);
    assert.equal(calls, 0);
    for (const path of ['/.env', '/backend/src/config.js', '/backend/openapi.json', '/backend/node_modules/swagger-ui-express/index.js', '/database/seed.sql', '/context-prd/PRD_MW75_TUMI_Fullstack.md', '/api/docs/.env']) {
      assert.equal((await fetch(base + path)).status, 404, path);
    }
  });
});

test('documented successful and error HTTP responses match preserved API behavior', async () => {
  await withApp({ query: async (_sql, values) => ({ rows: values?.[0] === 42 ? [productRow()] : [] }) }, async base => {
    for (const [path, operation, status] of [
      ['/api/health', '/api/health', 200],
      ['/api/products/42', '/api/products/{id}', 200],
      ['/api/products/01', '/api/products/{id}', 400],
      ['/api/products/99', '/api/products/{id}', 404]
    ]) {
      const response = await fetch(base + path);
      assert.equal(response.status, status);
      assertResponse(await response.json(), spec.paths[operation].get.responses[String(status)].content['application/json'].schema);
    }
  });
  await withApp({ query: async () => { throw Object.assign(new Error('PRIVATE_DRIVER_DETAILS'), { code: 'ECONNREFUSED' }); } }, async base => {
    for (const path of ['/api/health', '/api/products/42']) {
      const response = await fetch(base + path); assert.equal(response.status, 503);
      const body = await response.json();
      assert.ok(!JSON.stringify(body).includes('PRIVATE_DRIVER_DETAILS'));
      assertResponse(body, spec.paths[path === '/api/health' ? path : '/api/products/{id}'].get.responses['503'].content['application/json'].schema);
    }
  });
});
