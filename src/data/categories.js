// Single source of truth for category / subcategory data, shared by the
// Dashboard scroll rows, the Favourites page, the Subcategory page, and
// (eventually) the View-All Category page.

export const CATEGORIES = {
  'policy-explainer': {
    title: 'Policy Explainer',
    items: [
      { title: 'March Benefits', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600' },
      { title: 'Endowment Policy', image: 'https://images.unsplash.com/photo-1553729784-e91953dec042?w=600' },
      { title: 'Children Plans', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600' },
      { title: 'Term Plans', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600' },
      { title: 'ULIP Plans', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600' },
      { title: 'Money Back', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600' },
    ],
  },
  'plan-based': {
    title: 'Plan Based',
    items: [
      { title: 'Retirement', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600' },
      { title: 'Child Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600' },
      { title: 'Health', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
      { title: 'Term Insurance', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600' },
      { title: 'Children Marriage', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600' },
      { title: 'Endowment', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600' },
      { title: 'Joint Life', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600' },
      { title: 'Women Insurance', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600' },
    ],
  },
  'insurance-concepts': {
    title: 'Insurance Concepts',
    items: [
      { title: 'Need of Insurance', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600' },
      { title: 'Inflation', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600' },
      { title: 'Plan Life', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600' },
      { title: 'Tax Benefits', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600' },
      { title: 'Risk Coverage', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600' },
      { title: 'Compounding', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600' },
    ],
  },
  seasonal: {
    title: 'Seasonal Greetings',
    items: [
      { title: 'Named Days', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
      { title: 'National Holidays', image: 'https://images.unsplash.com/photo-1530021232320-687d8e3dba54?w=600' },
      { title: 'World Days', image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600' },
      { title: 'Summer Wishes', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600' },
      { title: 'Monsoon Greetings', image: 'https://images.unsplash.com/photo-1501691223387-dd0506c89d2d?w=600' },
    ],
  },
  festival: {
    title: 'Festival Greetings',
    items: [
      { title: 'Shivratri', image: 'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600' },
      { title: 'Holi', image: 'https://images.unsplash.com/photo-1583309217394-d669a01c5dc4?w=600' },
      { title: 'Diwali', image: 'https://images.unsplash.com/photo-1604668915840-580c30026e5f?w=600' },
      { title: 'Eid', image: 'https://images.unsplash.com/photo-1601562276548-a3e3f97a6f3a?w=600' },
      { title: 'Christmas', image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600' },
      { title: 'Onam', image: 'https://images.unsplash.com/photo-1601275487303-ee5d29a87cef?w=600' },
      { title: 'Navratri', image: 'https://images.unsplash.com/photo-1604608672601-d4d36c1d1edb?w=600' },
    ],
  },
  event: {
    title: 'Event Greetings',
    items: [
      { title: 'Thank You', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600' },
      { title: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600' },
      { title: 'Anniversary', image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600' },
      { title: 'Wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600' },
      { title: 'Graduation', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600' },
      { title: 'Promotion', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600' },
    ],
  },
};

// Order used by Dashboard and Favourites rows.
export const CATEGORY_ORDER = [
  'policy-explainer',
  'plan-based',
  'insurance-concepts',
  'seasonal',
  'festival',
  'event',
];

export function categoryLink(catKey) {
  return `/category/${encodeURIComponent(catKey)}`;
}

// Some parent categories have sub-items that live on their own dedicated
// pages (e.g. the `free_templates` category points at /free-videos and
// /my-videos rather than the generic /category/.../subcategory/... route).
// Anything not listed here falls back to the generic nested URL.
// Real subcategorykey values from /dashboardnew under the free_templates parent:
//   { categorykey: "my_videos",       categoryname: "My Videos"   } → /my-videos
//   { categorykey: "free_templates",  categoryname: "Free Videos" } → /free-videos
const SUB_ROUTE_OVERRIDES = {
  free_templates: {
    my_videos:      '/my-videos',
    free_templates: '/free-videos',
  },
};

export function subLink(catKey, sub) {
  const override = SUB_ROUTE_OVERRIDES[catKey]?.[sub];
  if (override) return override;
  return `/category/${encodeURIComponent(catKey)}/subcategory/${encodeURIComponent(sub)}`;
}
