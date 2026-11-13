import { formatMoney, cartSubtotal } from './product-model.js';
import { createProductImage } from './product-gallery.js';

export function renderCart(product, cart) {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector('#cartCount').textContent = String(count);
  document.querySelector('#cartButton').setAttribute(
    'aria-label', `Open cart, ${count} item${count === 1 ? '' : 's'}`
  );
  const container = document.querySelector('#cartContents');
  if (!cart.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Your cart is empty.';
    container.replaceChildren(emptyMessage);
    return;
  }

  const lines = cart.map(item => {
    const variant = product.variants.find(option => option.id === item.variantId);
    const line = document.createElement('div');
    line.className = 'cart-line';
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = product.name;
    const detail = document.createElement('small');
    detail.textContent = `${variant.label} · Qty ${item.quantity}`;
    const protection = document.createElement('small');
    protection.textContent = item.protection ? 'Protection selected' : 'Protection not selected';
    const amount = document.createElement('strong');
    amount.textContent = formatMoney(product.priceMinor * item.quantity, product.currency);
    info.append(title, detail, protection);
    line.append(createProductImage(variant.images[0], '', false), info, amount);
    return line;
  });

  const subtotal = document.createElement('div');
  subtotal.className = 'cart-total';
  const subtotalLabel = document.createElement('span');
  subtotalLabel.textContent = 'Subtotal';
  const subtotalAmount = document.createElement('strong');
  subtotalAmount.textContent = formatMoney(cartSubtotal(cart, product.priceMinor), product.currency);
  subtotal.append(subtotalLabel, subtotalAmount);
  const note = document.createElement('p');
  note.className = 'cart-note';
  note.textContent = 'Local cart only. No transaction has been submitted.';
  container.replaceChildren(...lines, subtotal, note);
}
