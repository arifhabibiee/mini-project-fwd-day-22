import { readFileSync } from 'node:fs';

// Editorial fixture mirrors the authoritative SQL seed; never reads private env.
const seed = readFileSync(new URL('../../database/seed.sql', import.meta.url), 'utf8');
const content = JSON.parse(seed.match(/\$content\$([\s\S]*?)\$content\$::JSONB/)[1]);

export function productRow() {
  return {
    id: 42, slug: 'mw75-tumi', name: 'MW75 TUMI',
    subtitle: 'Noise-Cancelling Wireless Headphones', description: 'Test description',
    price_minor: 75000, currency: 'USD', min_quantity: 1, max_per_order: null,
    content: structuredClone(content),
    // Deliberately non-1 IDs and reversed ordering to exercise mapping.
    variants: ['silver', 'black'].map((color, index) => ({
      id: index + 70, colorCode: color, label: color === 'black' ? 'Black' : 'Silver',
      referenceVariantId: color === 'black' ? '45871965307072' : null,
      availability: 'available', stockQuantity: null, isDefault: color === 'black',
      position: color === 'black' ? 0 : 1,
      images: [3, 1, 0, 2].map(position => ({
        id: 100 + index * 10 + position, url: `https://www.masterdynamic.com/test-${color}-${position}.png`,
        alt: `${color} view ${position + 1}`, position, fallbackUrl: `/assets/mw75-${color}-fallback.svg`
      }))
    }))
  };
}
