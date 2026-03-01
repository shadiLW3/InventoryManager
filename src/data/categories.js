export const CATEGORIES = [
  { id: 'produce', name: 'Produce', color: '#4caf6e' },
  { id: 'dairy', name: 'Dairy', color: '#64b5f6' },
  { id: 'meat', name: 'Meat & Seafood', color: '#ef5350' },
  { id: 'bakery', name: 'Bakery', color: '#ffb74d' },
  { id: 'frozen', name: 'Frozen', color: '#81d4fa' },
  { id: 'beverages', name: 'Beverages', color: '#9575cd' },
  { id: 'snacks', name: 'Snacks', color: '#ff8a65' },
  { id: 'household', name: 'Household', color: '#a1887f' },
  { id: 'health', name: 'Health & Beauty', color: '#f48fb1' },
  { id: 'other', name: 'Other', color: '#90a4ae' },
];

export const UNITS = [
  { id: 'each', label: 'each' },
  { id: 'lb', label: 'lb' },
  { id: 'oz', label: 'oz' },
  { id: 'kg', label: 'kg' },
  { id: 'case', label: 'case' },
  { id: 'pack', label: 'pack' },
  { id: 'pallet', label: 'pallet' },
  { id: 'gal', label: 'gal' },
  { id: 'liter', label: 'liter' },
];

export const WASTE_REASONS = [
  { id: 'expired', label: 'Expired' },
  { id: 'damaged', label: 'Damaged' },
  { id: 'spoiled', label: 'Spoiled' },
  { id: 'stolen', label: 'Theft/Shrinkage' },
  { id: 'recalled', label: 'Recalled' },
  { id: 'other', label: 'Other' },
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function expiryStatus(dateStr) {
  const days = daysUntilExpiry(dateStr);
  if (days === null) return null;
  if (days <= 0) return 'expired';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'warning';
  return 'ok';
}
