const TIERS = {
  premium:  { name: 'Premium',  price: 70, color: '#7c3aed' },
  standard: { name: 'Standard', price: 55, color: '#0d9488' },
  value:    { name: 'Value',    price: 40, color: '#db2777' },
  gallery:  { name: 'Gallery',  price: 30, color: '#f59e0b' }
};

const rows = (letters, tier) => [...letters].map((label) => ({ label, tier }));

const range = (section, row, from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${section}-${row}${from + i}`);

const orchestraRows = [
  ...rows('ABC', 'premium'),
  ...rows('DEFG', 'standard'),
  ...rows('HIJ', 'value')
];

const galleryRows = rows('KLMN', 'gallery');

const SECTIONS = [
  { id: 'ORL', name: 'Orchestra Left',       rows: orchestraRows, seatsPerRow: 10 },
  { id: 'ORR', name: 'Orchestra Right',      rows: orchestraRows, seatsPerRow: 10 },
  { id: 'GLL', name: 'Gallery Left',         rows: galleryRows,   seatsPerRow: 8 },
  { id: 'GCL', name: 'Gallery Center-Left',  rows: galleryRows,   seatsPerRow: 5 },
  { id: 'GCR', name: 'Gallery Center-Right', rows: galleryRows,   seatsPerRow: 5 },
  { id: 'GRR', name: 'Gallery Right',        rows: galleryRows,   seatsPerRow: 8 }
];

const ZONES = [
  { id: 'orchestra', name: 'Orchestra',             columns: ['ORL', 'AISLE', 'ORR'] },
  { id: 'gallery',   name: 'Raised gallery (rear)', columns: ['GLL', 'GCL', 'AISLE', 'GCR', 'GRR'] }
];

const UNAVAILABLE = [
  'ORL-A1', 'ORL-A2', 'ORL-A3', 'ORL-B1', 'ORL-E7', 'ORR-A10',
  ...range('ORL', 'I', 1, 5),
  ...range('ORL', 'J', 1, 6),
  ...range('ORR', 'I', 6, 10),
  ...range('ORR', 'J', 5, 10)
];
