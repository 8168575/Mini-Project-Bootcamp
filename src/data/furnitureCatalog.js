/**
 * @typedef {'seating'|'tables'|'storage'|'bed'|'office'|'decor'} FurnitureCategory
 *
 * @typedef {Object} FurnitureCatalogItem
 * @property {string} id
 * @property {string} name
 * @property {FurnitureCategory} category
 * @property {number} defaultWidthCm
 * @property {number} defaultDepthCm
 * @property {string} icon - simple SVG/shape representation, top-down view
 * @property {string} color
 */

const makeIcon = (body) =>
  `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

/**
 * Static catalog scaffold for the later drag-and-drop steps.
 * The shapes are intentionally flat and top-down so they can be rendered directly in the catalog
 * and reused on the canvas without introducing perspective distortion.
 *
 * @type {FurnitureCatalogItem[]}
 */
export const furnitureCatalog = [
  {
    id: 'sofa-3-seat',
    name: '3-seat sofa',
    category: 'seating',
    defaultWidthCm: 220,
    defaultDepthCm: 90,
    color: '#8f7561',
    icon: makeIcon(`
      <rect x="16" y="28" width="64" height="34" rx="12" fill="#8f7561"/>
      <rect x="20" y="20" width="56" height="18" rx="8" fill="#a68973"/>
      <rect x="22" y="36" width="14" height="18" rx="6" fill="#c7b19f" opacity="0.9"/>
      <rect x="60" y="36" width="14" height="18" rx="6" fill="#c7b19f" opacity="0.9"/>
    `),
  },
  {
    id: 'loveseat',
    name: 'Loveseat',
    category: 'seating',
    defaultWidthCm: 170,
    defaultDepthCm: 88,
    color: '#9b7e6a',
    icon: makeIcon(`
      <rect x="22" y="30" width="52" height="30" rx="12" fill="#9b7e6a"/>
      <rect x="26" y="22" width="44" height="16" rx="8" fill="#b39582"/>
      <rect x="32" y="36" width="12" height="14" rx="5" fill="#d7c8bb"/>
      <rect x="52" y="36" width="12" height="14" rx="5" fill="#d7c8bb"/>
    `),
  },
  {
    id: 'armchair',
    name: 'Armchair',
    category: 'seating',
    defaultWidthCm: 92,
    defaultDepthCm: 88,
    color: '#b08a73',
    icon: makeIcon(`
      <rect x="28" y="30" width="40" height="28" rx="12" fill="#b08a73"/>
      <rect x="34" y="22" width="28" height="14" rx="7" fill="#c7a38f"/>
      <rect x="22" y="34" width="8" height="18" rx="4" fill="#d9c4b6"/>
      <rect x="66" y="34" width="8" height="18" rx="4" fill="#d9c4b6"/>
    `),
  },
  {
    id: 'accent-chair',
    name: 'Accent chair',
    category: 'seating',
    defaultWidthCm: 82,
    defaultDepthCm: 82,
    color: '#6c8673',
    icon: makeIcon(`
      <rect x="30" y="28" width="36" height="26" rx="12" fill="#6c8673"/>
      <rect x="34" y="20" width="28" height="12" rx="6" fill="#86a094"/>
      <circle cx="25" cy="42" r="5" fill="#d8e0d8"/>
      <circle cx="71" cy="42" r="5" fill="#d8e0d8"/>
    `),
  },
  {
    id: 'ottoman',
    name: 'Ottoman',
    category: 'seating',
    defaultWidthCm: 70,
    defaultDepthCm: 50,
    color: '#a89279',
    icon: makeIcon(`
      <rect x="22" y="28" width="52" height="32" rx="14" fill="#a89279"/>
      <rect x="30" y="34" width="36" height="20" rx="10" fill="#c4b299" opacity="0.8"/>
    `),
  },
  {
    id: 'coffee-table-rect',
    name: 'Coffee table',
    category: 'tables',
    defaultWidthCm: 120,
    defaultDepthCm: 60,
    color: '#7d5f4b',
    icon: makeIcon(`
      <rect x="18" y="30" width="60" height="28" rx="10" fill="#7d5f4b"/>
      <line x1="18" y1="20" x2="78" y2="20" stroke="#ccb7a6" stroke-width="4" stroke-linecap="round"/>
      <line x1="20" y1="68" x2="28" y2="60" stroke="#ccb7a6" stroke-width="4" stroke-linecap="round"/>
      <line x1="76" y1="68" x2="68" y2="60" stroke="#ccb7a6" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'side-table',
    name: 'Side table',
    category: 'tables',
    defaultWidthCm: 50,
    defaultDepthCm: 50,
    color: '#8a6f5f',
    icon: makeIcon(`
      <rect x="28" y="28" width="40" height="40" rx="10" fill="#8a6f5f"/>
      <circle cx="48" cy="48" r="12" fill="#b99d89" opacity="0.8"/>
    `),
  },
  {
    id: 'dining-table-4',
    name: 'Dining table 4-seat',
    category: 'tables',
    defaultWidthCm: 140,
    defaultDepthCm: 90,
    color: '#81614d',
    icon: makeIcon(`
      <rect x="18" y="28" width="60" height="32" rx="10" fill="#81614d"/>
      <rect x="12" y="22" width="12" height="12" rx="4" fill="#ccb7a6"/>
      <rect x="72" y="22" width="12" height="12" rx="4" fill="#ccb7a6"/>
      <rect x="12" y="54" width="12" height="12" rx="4" fill="#ccb7a6"/>
      <rect x="72" y="54" width="12" height="12" rx="4" fill="#ccb7a6"/>
    `),
  },
  {
    id: 'dining-table-6',
    name: 'Dining table 6-seat',
    category: 'tables',
    defaultWidthCm: 180,
    defaultDepthCm: 95,
    color: '#7d5e4a',
    icon: makeIcon(`
      <rect x="14" y="26" width="68" height="36" rx="12" fill="#7d5e4a"/>
      <rect x="8" y="20" width="10" height="10" rx="3" fill="#ccb7a6"/>
      <rect x="78" y="20" width="10" height="10" rx="3" fill="#ccb7a6"/>
      <rect x="8" y="58" width="10" height="10" rx="3" fill="#ccb7a6"/>
      <rect x="78" y="58" width="10" height="10" rx="3" fill="#ccb7a6"/>
      <rect x="28" y="14" width="12" height="12" rx="3" fill="#ccb7a6"/>
      <rect x="52" y="62" width="12" height="12" rx="3" fill="#ccb7a6"/>
    `),
  },
  {
    id: 'console-table',
    name: 'Console table',
    category: 'tables',
    defaultWidthCm: 120,
    defaultDepthCm: 35,
    color: '#9c7b62',
    icon: makeIcon(`
      <rect x="18" y="36" width="60" height="18" rx="8" fill="#9c7b62"/>
      <line x1="24" y1="54" x2="24" y2="74" stroke="#ccb7a6" stroke-width="4" stroke-linecap="round"/>
      <line x1="72" y1="54" x2="72" y2="74" stroke="#ccb7a6" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'nightstand',
    name: 'Nightstand',
    category: 'storage',
    defaultWidthCm: 50,
    defaultDepthCm: 45,
    color: '#8a6d5b',
    icon: makeIcon(`
      <rect x="28" y="24" width="40" height="44" rx="10" fill="#8a6d5b"/>
      <rect x="34" y="34" width="28" height="6" rx="3" fill="#cfb7a2"/>
      <rect x="34" y="46" width="28" height="6" rx="3" fill="#cfb7a2"/>
    `),
  },
  {
    id: 'wardrobe-2-door',
    name: '2-door wardrobe',
    category: 'storage',
    defaultWidthCm: 120,
    defaultDepthCm: 60,
    color: '#8c7462',
    icon: makeIcon(`
      <rect x="20" y="18" width="56" height="60" rx="10" fill="#8c7462"/>
      <line x1="48" y1="18" x2="48" y2="78" stroke="#d8c7b8" stroke-width="3"/>
      <circle cx="39" cy="48" r="2.8" fill="#d8c7b8"/>
      <circle cx="57" cy="48" r="2.8" fill="#d8c7b8"/>
    `),
  },
  {
    id: 'bookshelf-wide',
    name: 'Bookshelf',
    category: 'storage',
    defaultWidthCm: 90,
    defaultDepthCm: 30,
    color: '#7d6656',
    icon: makeIcon(`
      <rect x="24" y="18" width="48" height="60" rx="8" fill="#7d6656"/>
      <line x1="30" y1="34" x2="66" y2="34" stroke="#d8c7b8" stroke-width="4" stroke-linecap="round"/>
      <line x1="30" y1="48" x2="66" y2="48" stroke="#d8c7b8" stroke-width="4" stroke-linecap="round"/>
      <line x1="30" y1="62" x2="66" y2="62" stroke="#d8c7b8" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'media-console',
    name: 'TV stand',
    category: 'storage',
    defaultWidthCm: 150,
    defaultDepthCm: 40,
    color: '#8a6f5b',
    icon: makeIcon(`
      <rect x="16" y="34" width="64" height="24" rx="10" fill="#8a6f5b"/>
      <rect x="28" y="38" width="18" height="8" rx="4" fill="#cfb7a2"/>
      <rect x="50" y="38" width="18" height="8" rx="4" fill="#cfb7a2"/>
    `),
  },
  {
    id: 'dresser-6',
    name: 'Dresser',
    category: 'storage',
    defaultWidthCm: 120,
    defaultDepthCm: 50,
    color: '#91735f',
    icon: makeIcon(`
      <rect x="20" y="24" width="56" height="48" rx="10" fill="#91735f"/>
      <line x1="28" y1="34" x2="68" y2="34" stroke="#d9cabc" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="48" x2="68" y2="48" stroke="#d9cabc" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="62" x2="68" y2="62" stroke="#d9cabc" stroke-width="3" stroke-linecap="round"/>
    `),
  },
  {
    id: 'queen-bed',
    name: 'Queen bed',
    category: 'bed',
    defaultWidthCm: 160,
    defaultDepthCm: 210,
    color: '#7d6a84',
    icon: makeIcon(`
      <rect x="20" y="22" width="56" height="54" rx="12" fill="#7d6a84"/>
      <rect x="24" y="28" width="48" height="18" rx="8" fill="#a291ab"/>
      <rect x="24" y="48" width="18" height="22" rx="8" fill="#d2cad6"/>
      <rect x="50" y="48" width="22" height="22" rx="8" fill="#d2cad6"/>
    `),
  },
  {
    id: 'king-bed',
    name: 'King bed',
    category: 'bed',
    defaultWidthCm: 195,
    defaultDepthCm: 210,
    color: '#7c6480',
    icon: makeIcon(`
      <rect x="14" y="20" width="68" height="56" rx="12" fill="#7c6480"/>
      <rect x="20" y="26" width="56" height="18" rx="8" fill="#9d8aa3"/>
      <rect x="20" y="46" width="24" height="24" rx="8" fill="#d6cfd9"/>
      <rect x="48" y="46" width="28" height="24" rx="8" fill="#d6cfd9"/>
    `),
  },
  {
    id: 'twin-bed',
    name: 'Twin bed',
    category: 'bed',
    defaultWidthCm: 100,
    defaultDepthCm: 200,
    color: '#7f6a8a',
    icon: makeIcon(`
      <rect x="26" y="22" width="44" height="54" rx="12" fill="#7f6a8a"/>
      <rect x="30" y="28" width="36" height="16" rx="8" fill="#a595ab"/>
      <rect x="32" y="46" width="30" height="22" rx="8" fill="#ded8e2"/>
    `),
  },
  {
    id: 'platform-bed',
    name: 'Platform bed',
    category: 'bed',
    defaultWidthCm: 150,
    defaultDepthCm: 205,
    color: '#7b6570',
    icon: makeIcon(`
      <rect x="18" y="26" width="60" height="50" rx="12" fill="#7b6570"/>
      <rect x="22" y="52" width="52" height="18" rx="8" fill="#d9d0d5"/>
      <rect x="28" y="32" width="40" height="12" rx="6" fill="#a8979e"/>
    `),
  },
  {
    id: 'desk-rectangular',
    name: 'Desk',
    category: 'office',
    defaultWidthCm: 140,
    defaultDepthCm: 70,
    color: '#6f7c8d',
    icon: makeIcon(`
      <rect x="16" y="32" width="64" height="24" rx="10" fill="#6f7c8d"/>
      <rect x="26" y="56" width="12" height="18" rx="5" fill="#d4dbe3"/>
      <rect x="58" y="56" width="12" height="18" rx="5" fill="#d4dbe3"/>
    `),
  },
  {
    id: 'office-chair',
    name: 'Office chair',
    category: 'office',
    defaultWidthCm: 70,
    defaultDepthCm: 70,
    color: '#63717d',
    icon: makeIcon(`
      <circle cx="48" cy="42" r="18" fill="#63717d"/>
      <circle cx="48" cy="42" r="8" fill="#dbe2e8" opacity="0.85"/>
      <rect x="42" y="56" width="12" height="10" rx="4" fill="#dbe2e8"/>
      <circle cx="28" cy="68" r="4" fill="#dbe2e8"/>
      <circle cx="68" cy="68" r="4" fill="#dbe2e8"/>
    `),
  },
  {
    id: 'filing-cabinet',
    name: 'Filing cabinet',
    category: 'office',
    defaultWidthCm: 45,
    defaultDepthCm: 60,
    color: '#74818e',
    icon: makeIcon(`
      <rect x="30" y="18" width="34" height="60" rx="9" fill="#74818e"/>
      <line x1="36" y1="34" x2="58" y2="34" stroke="#d8e0e8" stroke-width="4" stroke-linecap="round"/>
      <line x1="36" y1="48" x2="58" y2="48" stroke="#d8e0e8" stroke-width="4" stroke-linecap="round"/>
      <line x1="36" y1="62" x2="58" y2="62" stroke="#d8e0e8" stroke-width="4" stroke-linecap="round"/>
    `),
  },
  {
    id: 'round-rug-large',
    name: 'Large rug',
    category: 'decor',
    defaultWidthCm: 240,
    defaultDepthCm: 180,
    color: '#b79d83',
    icon: makeIcon(`
      <ellipse cx="48" cy="48" rx="30" ry="22" fill="#b79d83"/>
      <ellipse cx="48" cy="48" rx="20" ry="14" fill="#dfcfbf" opacity="0.8"/>
    `),
  },
  {
    id: 'round-rug-small',
    name: 'Small rug',
    category: 'decor',
    defaultWidthCm: 160,
    defaultDepthCm: 120,
    color: '#c4aa90',
    icon: makeIcon(`
      <ellipse cx="48" cy="48" rx="24" ry="18" fill="#c4aa90"/>
      <ellipse cx="48" cy="48" rx="15" ry="10" fill="#f1e5d8" opacity="0.75"/>
    `),
  },
  {
    id: 'floor-plant',
    name: 'Floor plant',
    category: 'decor',
    defaultWidthCm: 55,
    defaultDepthCm: 55,
    color: '#6f8b6d',
    icon: makeIcon(`
      <circle cx="48" cy="36" r="14" fill="#6f8b6d"/>
      <circle cx="38" cy="30" r="7" fill="#86a384"/>
      <circle cx="58" cy="30" r="7" fill="#86a384"/>
      <rect x="38" y="48" width="20" height="16" rx="6" fill="#b89f7f"/>
    `),
  },
];

export const furnitureCategories = [
  { value: 'seating', label: 'Seating' },
  { value: 'tables', label: 'Tables' },
  { value: 'storage', label: 'Storage' },
  { value: 'bed', label: 'Beds' },
  { value: 'office', label: 'Office' },
  { value: 'decor', label: 'Decor' },
];
