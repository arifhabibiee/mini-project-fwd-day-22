import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { staticProduct } from '../../frontend/js/product-data.js';
import {
  addCartLine, cartSubtotal, formatMoney,
  quantityBound, validQuantity, validateProduct
} from '../../frontend/js/product-model.js';
import { fetchProductById } from '../../frontend/js/product-api.js';

const readFrontend = name => readFileSync(new URL(`../../frontend/${name}`, import.meta.url), 'utf8');

test('Day 22: both pages provide one editable quantity input and error message', () => {
  for (const name of ['index-hardcoded.html', 'index-api-product.html']) {
    const html = readFrontend(name);
    assert.match(html, /id="quantityValue"/);
    assert.match(html, /aria-describedby="quantityError"/);
    assert.match(html, /id="quantityError"[^>]*role="alert"/);
    assert.match(html, /id="selectionSubtotal"/);
    assert.doesNotMatch(html, /id="quantityValue"[^>]*readonly/);
  }
});

test('Day 22: manual quantity rules accept positives and reject invalid values', () => {
  const product = validateProduct(staticProduct);
  const variant = product.variants[0];
  const limit = quantityBound(product, variant);
  assert.equal(limit, null);
  for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(validQuantity(quantity, limit), false);
  }
  assert.equal(validQuantity(1, limit), true);
  assert.equal(validQuantity(4, limit), true);
  assert.equal(formatMoney(4 * product.priceMinor, product.currency), '$3,000.00');
});

test('Day 22: known-stock fixture caps quantity and cumulative cart, original data unchanged', () => {
  const fixture = validateProduct(staticProduct);
  fixture.variants[0].stockQuantity = 2;
  fixture.quantityPolicy.maxPerOrder = 3;
  const option = fixture.variants[0];
  assert.equal(quantityBound(fixture, option), 2);
  assert.equal(validQuantity(3, quantityBound(fixture, option)), false);
  const cart = addCartLine([], fixture, option, 2, false);
  assert.equal(cartSubtotal(cart, fixture.priceMinor), 150000);
  assert.throws(() => addCartLine(cart, fixture, option, 1, false), error => error.code === 'CART_REJECTED');
  assert.equal(staticProduct.variants[0].stockQuantity, null);
});

test('Day 22: adding items updates cart totals without duplicated product lines', () => {
  const product = validateProduct(staticProduct);
  const option = product.variants[0];
  const cart = addCartLine([], product, option, 1, false);
  const updated = addCartLine(cart, product, option, 2, false);
  assert.equal(updated.length, 1);
  assert.equal(updated[0].quantity, 3);
  assert.equal(cartSubtotal(updated, product.priceMinor), 225000);
});

test('Day 22: API fetch can fail and succeed on a later retry with same endpoint', async () => {
  const product = validateProduct(staticProduct);
  let requests = 0;
  const fetcher = async () => {
    requests++;
    if (requests === 1) return new Response('{}', { status: 503, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ data: product }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  await assert.rejects(fetchProductById(String(product.id), { fetcher }), e => e.code === 'SERVER_ERROR');
  const result = await fetchProductById(String(product.id), { fetcher });
  assert.equal(requests, 2);
  assert.equal(result.name, 'MW75 TUMI');
});
