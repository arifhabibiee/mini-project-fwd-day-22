import { initializeSiteUI } from './site-ui.js';
import { fetchProductById } from './product-api.js';
import { ProductError } from './product-model.js';
import { renderProduct } from './product-ui.js';

const site = initializeSiteUI();
const params = new URLSearchParams(location.search);
let currentRequest;

function showLoading() {
  document.querySelector('#loadHeading').textContent = 'Loading product';
  document.querySelector('#loadMessage').textContent = 'Please wait while product information loads.';
  document.querySelector('#loadPanel').hidden = false;
  document.querySelector('#productContent').hidden = true;
  document.querySelector('#retryButton').hidden = true;
  document.querySelector('#main').setAttribute('aria-busy', 'true');
  document.querySelector('.loading-purchase').hidden = false;
}

function showError(error) {
  const knownError = error instanceof ProductError;
  document.querySelector('#loadHeading').textContent = error.code === 'NOT_FOUND'
    ? 'Product not found' : 'Unable to load product';
  document.querySelector('#loadMessage').textContent = knownError
    ? error.message : 'Unable to load product information. Please retry.';
  document.querySelector('#main').setAttribute('aria-busy', 'false');
  document.querySelector('.loading-purchase').hidden = true;
  document.querySelector('#retryButton').hidden = knownError && !error.recoverable;
  document.querySelector('#retryButton').disabled = false;
}

async function loadProduct() {
  currentRequest?.abort();
  const request = new AbortController();
  currentRequest = request;
  const timeout = setTimeout(() => request.abort(), 10000);
  showLoading();

  try {
    const product = await fetchProductById(params.get('id'), { signal: request.signal });
    if (currentRequest !== request) return;
    renderProduct(product, { openCart: site.openCart, params });
    document.querySelector('#loadPanel').hidden = true;
    document.querySelector('#productContent').hidden = false;
    document.querySelector('#main').setAttribute('aria-busy', 'false');
  } catch (error) {
    if (currentRequest !== request) return;
    const friendlyError = error.name === 'AbortError'
      ? new ProductError('TIMEOUT', 'The request timed out. Please retry.') : error;
    showError(friendlyError);
  } finally {
    clearTimeout(timeout);
  }
}

document.querySelector('#retryButton').addEventListener('click', loadProduct);
loadProduct();
