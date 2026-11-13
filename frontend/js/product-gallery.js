// Handles gallery images and thumbnails. Other product UI logic stays in product-ui.js.
export function createProductImage(media, className = '', lazy = true) {
  const image = document.createElement('img');
  image.className = className;
  image.alt = media.alt;
  image.decoding = 'async';
  if (lazy) image.loading = 'lazy';

  let usedFallback = false;
  image.onerror = () => {
    if (!usedFallback && media.fallbackUrl && media.fallbackUrl !== media.url) {
      usedFallback = true;
      image.src = media.fallbackUrl.replace(/^\/assets\//, './assets/');
      return;
    }
    image.onerror = null;
    image.removeAttribute('src');
    image.alt = `Image unavailable. ${media.alt}`;
    image.classList.add('media-unavailable');
  };
  image.src = media.url.replace(/^\/assets\//, './assets/');
  return image;
}

export function renderGallery(variant, imageIndex, onSelect) {
  const images = variant.images;
  document.querySelector('#galleryImageSlot').replaceChildren(
    createProductImage(images[imageIndex], 'product-image', false)
  );
  document.querySelector('#galleryIndex').textContent = `${imageIndex + 1} / ${images.length}`;

  const row = document.querySelector('#thumbnailRow');
  const needsNewThumbnails = row.children.length !== images.length
    || row.firstElementChild?.dataset.variantId !== String(variant.id);

  if (needsNewThumbnails) {
    const thumbnails = images.map((image, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thumbnail';
      button.dataset.variantId = String(variant.id);
      button.setAttribute('aria-label', `View image ${index + 1} of ${variant.label}`);
      const thumbnail = createProductImage(image, '', false);
      thumbnail.alt = '';
      button.append(thumbnail);
      button.addEventListener('click', () => onSelect(index));
      return button;
    });
    row.replaceChildren(...thumbnails);
  }

  // Changing the active picture must not remove the focused thumbnail button.
  [...row.children].forEach((button, index) => {
    const selected = index === imageIndex;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}
