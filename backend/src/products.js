import { HttpError, databaseError } from './errors.js';

export function parseProductId(raw) {
  if (typeof raw !== 'string' || !/^[1-9][0-9]*$/.test(raw)
      || raw.length > 10 || Number(raw) > 2147483647) {
    throw new HttpError(400, 'INVALID_PRODUCT_ID', 'ID produk harus integer positif yang valid.');
  }
  return Number(raw);
}

// One statement provides a consistent snapshot; correlated aggregates avoid
// multiplying variants/images in a flat join. Identifiers come from the DB.
export const productQuery = `
  SELECT p.id, p.slug, p.name, p.subtitle, p.description, p.price_minor,
         p.currency, p.min_quantity, p.max_per_order, p.content,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'id', v.id, 'colorCode', v.color_code, 'label', v.label,
             'referenceVariantId', v.reference_variant_id,
             'availability', v.availability, 'stockQuantity', v.stock_quantity,
             'isDefault', v.is_default, 'position', v.position,
             'images', COALESCE((
               SELECT jsonb_agg(jsonb_build_object(
                 'id', i.id, 'url', i.url, 'alt', i.alt,
                 'fallbackUrl', i.fallback_url, 'position', i.position
               ) ORDER BY i.position, i.id)
               FROM public.product_images AS i WHERE i.variant_id = v.id
             ), '[]'::jsonb)
           ) ORDER BY v.position, v.id)
           FROM public.product_variants AS v WHERE v.product_id = p.id
         ), '[]'::jsonb) AS variants
  FROM public.products AS p
  WHERE p.id = $1
`;

function requireData(condition) {
  if (!condition) throw new HttpError(500, 'INVALID_PRODUCT_DATA', 'Data produk tidak valid.');
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const integer = (value, min = 0) => Number.isInteger(value) && value >= min && value <= 2147483647;
const nullableInteger = (value, min) => value === null || integer(value, min);
const nullableText = value => value === null || text(value);
const array = (value, count) => Array.isArray(value) && (count === undefined ? value.length > 0 : value.length === count);

export function safeUrl(value) {
  if (!text(value)) return false;
  if (/^\/assets\/[a-zA-Z0-9_-]+\.svg$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password
      && ['www.masterdynamic.com', 'support.masterdynamic.com'].includes(url.hostname)
      && !url.port && !/[\u0000-\u0020\u007f]/.test(value);
  } catch { return false; }
}
function media(value) {
  requireData(object(value) && safeUrl(value.url) && text(value.alt)
    && (value.fallbackUrl === null || safeUrl(value.fallbackUrl)));
}
function link(value) {
  requireData(object(value) && text(value.label) && safeUrl(value.url));
}
function validateContent(content) {
  requireData(object(content) && text(content.eyebrow));
  requireData(array(content.features, 6) && array(content.benefits, 3)
    && array(content.stories, 2) && array(content.specGroups, 3) && array(content.boxItems, 7));
  const icons = ['anc', 'materials', 'drivers', 'battery', 'bluetooth', 'microphones'];
  for (const feature of content.features) {
    requireData(object(feature) && text(feature.title) && text(feature.text) && icons.includes(feature.iconKey));
  }
  for (const benefit of content.benefits) requireData(object(benefit) && text(benefit.title) && text(benefit.text));
  requireData(object(content.protection) && text(content.protection.title) && text(content.protection.note));
  for (const story of content.stories) {
    requireData(object(story) && text(story.eyebrow) && text(story.title)
      && array(story.paragraphs) && story.paragraphs.every(text) && Array.isArray(story.links));
    media(story.media);
    story.links.forEach(link);
  }
  for (const group of content.specGroups) {
    requireData(object(group) && text(group.title) && array(group.rows));
    for (const row of group.rows) requireData(object(row) && text(row.label) && text(row.value));
  }
  for (const item of content.boxItems) {
    requireData(object(item) && text(item.label));
    media(item.media);
  }
  requireData(object(content.support) && text(content.support.eyebrow)
    && text(content.support.title) && text(content.support.text));
  media(content.support.media);
  link(content.support.link);
}

export function mapProduct(row) {
  requireData(object(row) && integer(row.id, 1) && text(row.slug) && text(row.name)
    && text(row.subtitle) && text(row.description) && integer(row.price_minor)
    && row.currency === 'USD' && row.min_quantity === 1 && nullableInteger(row.max_per_order, 1));
  validateContent(row.content);
  requireData(array(row.variants, 2));
  const ids = new Set();
  const colors = new Set();
  const positions = new Set();
  const imageIds = new Set();
  const references = new Set();
  const variants = row.variants.map(variant => {
    requireData(object(variant) && integer(variant.id, 1) && !ids.has(variant.id)
      && ['black', 'silver'].includes(variant.colorCode) && !colors.has(variant.colorCode)
      && integer(variant.position) && !positions.has(variant.position)
      && text(variant.label) && nullableText(variant.referenceVariantId)
      && ['available', 'unavailable', 'unknown'].includes(variant.availability)
      && nullableInteger(variant.stockQuantity, 0) && typeof variant.isDefault === 'boolean'
      && !(variant.availability === 'available' && variant.stockQuantity === 0)
      && array(variant.images, 4));
    if (variant.referenceVariantId !== null) {
      requireData(!references.has(variant.referenceVariantId));
      references.add(variant.referenceVariantId);
    }
    ids.add(variant.id); colors.add(variant.colorCode); positions.add(variant.position);
    const imagePositions = new Set();
    const images = variant.images.map(image => {
      media(image);
      requireData(integer(image.id, 1) && !imageIds.has(image.id)
        && integer(image.position) && !imagePositions.has(image.position));
      imageIds.add(image.id); imagePositions.add(image.position);
      return { id: image.id, url: image.url, alt: image.alt, position: image.position, fallbackUrl: image.fallbackUrl };
    }).sort((a, b) => a.position - b.position);
    return {
      id: variant.id, colorCode: variant.colorCode, label: variant.label,
      referenceVariantId: variant.referenceVariantId, availability: variant.availability,
      stockQuantity: variant.stockQuantity, isDefault: variant.isDefault, position: variant.position,
      purchasable: variant.availability === 'available'
        && (variant.stockQuantity === null || variant.stockQuantity > 0), images
    };
  }).sort((a, b) => a.position - b.position);
  const defaults = variants.filter(variant => variant.isDefault);
  requireData(defaults.length === 1);
  return {
    id: row.id, slug: row.slug, name: row.name, subtitle: row.subtitle, description: row.description,
    priceMinor: row.price_minor, currency: row.currency, defaultVariantId: defaults[0].id,
    quantityPolicy: { min: row.min_quantity, maxPerOrder: row.max_per_order },
    variants, content: row.content
  };
}

export async function findProduct(pool, id) {
  let result;
  try { result = await pool.query(productQuery, [id]); }
  catch (error) { throw databaseError(error); }
  return result.rows.length ? mapProduct(result.rows[0]) : null;
}
