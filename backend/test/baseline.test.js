import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { staticProduct } from '../../frontend/js/product-data.js';
import { fetchProductById } from '../../frontend/js/product-api.js';
import { ProductError, validateProduct, quantityBound, validQuantity,
  addCartLine, formatMoney, cartSubtotal } from '../../frontend/js/product-model.js';

const html = name => readFileSync(new URL(`../../frontend/${name}`, import.meta.url), 'utf8');
const source = name => readFileSync(new URL(`../../frontend/js/${name}`, import.meta.url), 'utf8');

test('two complete semantic HTML documents share consistent structure', () => {
  const staticHtml = html('index-hardcoded.html');
  const apiHtml = html('index-api-product.html');
  for (const text of [staticHtml, apiHtml]) {
    for (const tag of ['header', 'nav', 'main', 'section', 'footer', 'fieldset', 'legend', 'details', 'summary']) {
      assert.match(text, new RegExp(`<${tag}(\\s|>)`));
    }
    for (const id of ['productContent', 'productTitle', 'productPrice', 'galleryImageSlot',
      'swatches', 'addToCart', 'quantityValue', 'techSpecs']) {
      // techSpecs is dynamically rendered but the others belong in semantic HTML.
      if (id !== 'techSpecs') assert.match(text, new RegExp(`id="${id}"`));
    }
    assert.doesNotMatch(text, /project-notice|Static page|API page|product-template/);
    assert.match(text, /<script type="module" src="\.\/js\//);
  }
  assert.match(staticHtml, /src="\.\/js\/hardcoded-page\.js"/);
  assert.match(apiHtml, /src="\.\/js\/api-page\.js"/);
  assert.doesNotMatch(source('api-page.js'), /product-data|staticProduct/);
  assert.doesNotMatch(source('product-api.js'), /product-data|staticProduct/);
});

test('hardcoded dataset keeps baseline content with demo stock 5/10 and unknown max order', () => {
  const product = validateProduct(staticProduct);
  assert.equal(product.name, 'MW75 TUMI');
  assert.equal(product.priceMinor, 75000);
  assert.deepEqual(product.variants.map(v => v.colorCode), ['black', 'silver']);
  assert.equal(product.variants.reduce((sum, v) => sum + v.images.length, 0), 8);
  assert.deepEqual(product.variants.map(v => v.stockQuantity), [5, 10]);
  assert.equal(product.quantityPolicy.maxPerOrder, null);
  assert.equal(product.content.features.length, 6);
  assert.equal(product.content.benefits.length, 3);
  assert.equal(product.content.stories.length, 2);
  assert.equal(product.content.specGroups.length, 3);
  assert.equal(product.content.boxItems.length, 7);
});

test('hardcoded quantity/cart math respects Black stock of five', () => {
  const product = validateProduct(staticProduct);
  const variant = product.variants[0];
  assert.equal(quantityBound(product, variant), 5);
  assert.equal(validQuantity(2, 5), true);
  assert.equal(validQuantity(0, 5), false);
  assert.equal(validQuantity(1.5, 5), false);
  assert.equal(validQuantity(6, 5), false);
  const cart = addCartLine([], product, variant, 2, false);
  assert.equal(cartSubtotal(cart, product.priceMinor), 150000);
  assert.equal(formatMoney(150000, 'USD'), '$1,500.00');
});

test('API module validates success, status, JSON and product ID', async () => {
  const validProduct = validateProduct(staticProduct);
  const mock = (status, body, type = 'application/json') => async () =>
    new Response(body, { status, headers: { 'content-type': type } });
  const ok = await fetchProductById('1', { fetcher: mock(200, JSON.stringify({ data: validProduct })) });
  assert.equal(ok.name, 'MW75 TUMI');
  await assert.rejects(fetchProductById('1', { fetcher: mock(404, '{}') }), e => e.code === 'NOT_FOUND');
  await assert.rejects(fetchProductById('1', { fetcher: mock(503, '{}') }), e => e.code === 'SERVER_ERROR');
  await assert.rejects(fetchProductById('1', { fetcher: mock(200, 'bad json') }), e => e.code === 'INVALID_PAYLOAD');
  await assert.rejects(fetchProductById('0', { fetcher: mock(200, '{}') }), e => e.code === 'INVALID_ID');
  await assert.rejects(fetchProductById('1', { fetcher: mock(200, JSON.stringify({ data: { ...validProduct, id: 2 } })) }),
    e => e.code === 'INVALID_PAYLOAD');
  await assert.rejects(fetchProductById('1', { fetcher: async () => { throw Error('network'); } }),
    e => e.code === 'NETWORK_ERROR');
});
