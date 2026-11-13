export class ProductError extends Error {
  constructor(code, message, recoverable = true) {
    super(message);
    this.code = code;
    this.recoverable = recoverable;
  }
}

export function parseProductId(raw) {
  if (
    typeof raw !== "string" ||
    !/^[1-9][0-9]*$/.test(raw) ||
    raw.length > 10 ||
    Number(raw) > 2147483647
  ) {
    throw new ProductError(
      "INVALID_ID",
      "A canonical positive product ID is required in the URL.",
      false,
    );
  }
  return Number(raw);
}
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v) => typeof v === "string" && v.trim().length > 0;
const integer = (v, min = 0) =>
  Number.isInteger(v) && v >= min && v <= 2147483647;
const optionalInteger = (v, min = 0) => v === null || integer(v, min);
function valid(condition) {
  if (!condition)
    throw new ProductError(
      "INVALID_PAYLOAD",
      "The server returned invalid product information.",
    );
}
function list(value, size) {
  valid(
    Array.isArray(value) &&
      (size === undefined ? value.length > 0 : value.length === size),
  );
}

export function safeUrl(value) {
  if (!text(value)) return false;
  if (/^\/assets\/[a-zA-Z0-9_-]+\.svg$/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      ["www.masterdynamic.com", "support.masterdynamic.com"].includes(
        url.hostname,
      ) &&
      !/[\u0000-\u0020\u007f]/.test(value)
    );
  } catch {
    return false;
  }
}
function media(item) {
  valid(
    object(item) &&
      safeUrl(item.url) &&
      text(item.alt) &&
      (item.fallbackUrl === null || safeUrl(item.fallbackUrl)),
  );
}
function link(item) {
  valid(object(item) && text(item.label) && safeUrl(item.url));
}

export function validateProduct(product) {
  valid(
    object(product) &&
      integer(product.id, 1) &&
      text(product.slug) &&
      text(product.name) &&
      text(product.subtitle) &&
      text(product.description) &&
      integer(product.priceMinor) &&
      product.currency === "USD" &&
      integer(product.defaultVariantId, 1) &&
      object(product.quantityPolicy) &&
      product.quantityPolicy.min === 1 &&
      optionalInteger(product.quantityPolicy.maxPerOrder, 1),
  );
  list(product.variants, 2);
  const ids = new Set(),
    colors = new Set(),
    positions = new Set(),
    imageIds = new Set(),
    references = new Set();
  for (const variant of product.variants) {
    valid(
      object(variant) &&
        integer(variant.id, 1) &&
        !ids.has(variant.id) &&
        ["black", "silver"].includes(variant.colorCode) &&
        !colors.has(variant.colorCode) &&
        text(variant.label) &&
        integer(variant.position) &&
        !positions.has(variant.position) &&
        (variant.referenceVariantId === null ||
          text(variant.referenceVariantId)) &&
        ["available", "unavailable", "unknown"].includes(
          variant.availability,
        ) &&
        optionalInteger(variant.stockQuantity) &&
        typeof variant.isDefault === "boolean" &&
        typeof variant.purchasable === "boolean" &&
        !(
          variant.availability === "available" && variant.stockQuantity === 0
        ) &&
        variant.purchasable ===
          (variant.availability === "available" &&
            (variant.stockQuantity === null || variant.stockQuantity > 0)),
    );
    if (variant.referenceVariantId !== null) {
      valid(!references.has(variant.referenceVariantId));
      references.add(variant.referenceVariantId);
    }
    ids.add(variant.id);
    colors.add(variant.colorCode);
    positions.add(variant.position);
    list(variant.images, 4);
    const imagePositions = new Set();
    for (const image of variant.images) {
      media(image);
      valid(
        integer(image.id, 1) &&
          !imageIds.has(image.id) &&
          integer(image.position) &&
          !imagePositions.has(image.position),
      );
      imageIds.add(image.id);
      imagePositions.add(image.position);
    }
  }
  const defaults = product.variants.filter((v) => v.isDefault);
  valid(defaults.length === 1 && defaults[0].id === product.defaultVariantId);
  const c = product.content;
  valid(object(c) && text(c.eyebrow));
  list(c.features, 6);
  list(c.benefits, 3);
  list(c.stories, 2);
  list(c.specGroups, 3);
  list(c.boxItems, 7);
  for (const f of c.features)
    valid(
      object(f) &&
        text(f.title) &&
        text(f.text) &&
        [
          "anc",
          "materials",
          "drivers",
          "battery",
          "bluetooth",
          "microphones",
        ].includes(f.iconKey),
    );
  for (const b of c.benefits) valid(object(b) && text(b.title) && text(b.text));
  valid(
    object(c.protection) && text(c.protection.title) && text(c.protection.note),
  );
  for (const story of c.stories) {
    valid(
      object(story) &&
        text(story.eyebrow) &&
        text(story.title) &&
        Array.isArray(story.links),
    );
    list(story.paragraphs);
    valid(story.paragraphs.every(text));
    media(story.media);
    story.links.forEach(link);
  }
  for (const group of c.specGroups) {
    valid(object(group) && text(group.title));
    list(group.rows);
    group.rows.forEach((row) =>
      valid(object(row) && text(row.label) && text(row.value)),
    );
  }
  for (const item of c.boxItems) {
    valid(object(item) && text(item.label));
    media(item.media);
  }
  valid(
    object(c.support) &&
      text(c.support.eyebrow) &&
      text(c.support.title) &&
      text(c.support.text),
  );
  media(c.support.media);
  link(c.support.link);
  const normalized = structuredClone(product);
  normalized.variants.sort((a, b) => a.position - b.position);
  normalized.variants.forEach((v) =>
    v.images.sort((a, b) => a.position - b.position),
  );
  return normalized;
}

export function selectInitialVariant(product, params) {
  const byReference = product.variants.find(
    (v) =>
      v.referenceVariantId !== null &&
      v.referenceVariantId === params.get("variant"),
  );
  const byColor = product.variants.find(
    (v) => v.colorCode === params.get("color"),
  );
  return {
    variant:
      byReference ??
      byColor ??
      product.variants.find((v) => v.id === product.defaultVariantId),
    warning:
      (params.has("variant") && !byReference) ||
      (params.has("color") && !byColor)
        ? "Unrecognized selection; the valid selection or default variant is shown."
        : "",
  };
}

// null means a business/stock limit is not known, never unlimited inventory.
export function quantityBound(product, variant) {
  const known = [
    product.quantityPolicy.maxPerOrder,
    variant.stockQuantity,
  ].filter((v) => v !== null);
  return known.length ? Math.min(...known) : null;
}
export function validQuantity(quantity, bound) {
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    (bound === null || quantity <= bound)
  );
}
export function formatMoney(minor, currency) {
  if (!Number.isSafeInteger(minor) || minor < 0)
    throw new ProductError(
      "INVALID_TOTAL",
      "The amount is outside the supported range.",
    );
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    minor / 100,
  );
}
export function cartSubtotal(cart, priceMinor) {
  const total = cart.reduce((sum, line) => sum + line.quantity * priceMinor, 0);
  if (!Number.isSafeInteger(total) || total < 0)
    throw new ProductError(
      "INVALID_TOTAL",
      "The cart amount is outside the supported range.",
    );
  return total;
}
export function addCartLine(cart, product, variant, quantity, protection) {
  const bound = quantityBound(product, variant);
  const cumulative =
    cart
      .filter(
        (line) =>
          line.productId === product.id && line.variantId === variant.id,
      )
      .reduce((sum, line) => sum + line.quantity, 0) + quantity;
  if (
    !variant.purchasable ||
    !validQuantity(quantity, bound) ||
    !validQuantity(cumulative, bound)
  ) {
    throw new ProductError(
      "CART_REJECTED",
      "This selection is unavailable or exceeds the known quantity limit.",
    );
  }
  const next = cart.map((line) => ({ ...line }));
  const existing = next.find(
    (line) =>
      line.productId === product.id &&
      line.variantId === variant.id &&
      line.protection === protection,
  );
  if (existing) existing.quantity += quantity;
  else
    next.push({
      productId: product.id,
      variantId: variant.id,
      quantity,
      protection,
    });
  if (
    !Number.isSafeInteger(next.reduce((sum, line) => sum + line.quantity, 0))
  ) {
    throw new ProductError(
      "CART_REJECTED",
      "The cart quantity is outside the supported range.",
    );
  }
  cartSubtotal(next, product.priceMinor);
  return next;
}
