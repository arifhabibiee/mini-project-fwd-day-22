import { ProductError, parseProductId, validateProduct } from './product-model.js';

// API-driven page never imports the hardcoded product dataset.
export async function fetchProductById(rawId, { signal, fetcher = fetch } = {}) {
  const id = parseProductId(rawId);
  let response;

  try {
    response = await fetcher(`/api/products/${id}`, {
      signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ProductError('NETWORK_ERROR', 'Unable to connect. Check your connection and retry.');
  }

  if (response.status === 404) {
    throw new ProductError('NOT_FOUND', 'The requested product was not found.', false);
  }
  if (response.status === 400) {
    throw new ProductError('INVALID_ID', 'The product ID was rejected by the server.', false);
  }
  if (!response.ok) {
    throw new ProductError('SERVER_ERROR', 'Product information is temporarily unavailable. Please retry.');
  }
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new ProductError('INVALID_PAYLOAD', 'The server returned an unexpected response format.');
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ProductError('INVALID_PAYLOAD', 'The server returned invalid JSON.');
  }

  const product = validateProduct(body?.data);
  if (product.id !== id) {
    throw new ProductError('INVALID_PAYLOAD', 'The response does not match the requested product.');
  }
  return product;
}
