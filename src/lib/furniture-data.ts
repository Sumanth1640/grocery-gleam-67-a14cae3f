export type FurnitureCategory = {
  slug: string;
  name: string;
  tint: string;
};

export type FurnitureItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  wood: string;
  price: number;
  mrp: number;
  image: string;
  blurb: string;
  dimensions: string;
};

export const furnitureCategories: FurnitureCategory[] = [
  { slug: "living", name: "Living Room", tint: "oklch(0.93 0.04 60)" },
  { slug: "bedroom", name: "Bedroom", tint: "oklch(0.92 0.05 30)" },
  { slug: "dining", name: "Dining", tint: "oklch(0.93 0.05 90)" },
  { slug: "study", name: "Study & Office", tint: "oklch(0.92 0.04 250)" },
  { slug: "storage", name: "Storage", tint: "oklch(0.93 0.04 145)" },
];

// All images are 100% solid-wood pieces — no fabric, cushions, or upholstery.
export const furnitureItems: FurnitureItem[] = [
  {
    id: "f1",
    slug: "sheesham-coffee-table",
    name: "Sheesham Coffee Table",
    category: "living",
    wood: "Sheesham",
    price: 8499,
    mrp: 12999,
    image: "/furniture/sheesham-coffee-table.jpg",
    blurb: "Hand-finished solid sheesham, all wood — no fabric.",
    dimensions: 'L 42" × W 24" × H 18"',
  },
  {
    id: "f2",
    slug: "teak-side-table",
    name: "Teak Side Table",
    category: "living",
    wood: "Teak",
    price: 6999,
    mrp: 9999,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop",
    blurb: "Solid teak side table with hand-rubbed oil finish.",
    dimensions: 'L 20" × W 20" × H 24"',
  },
  {
    id: "f3",
    slug: "mango-wood-bed",
    name: "Mango Wood Queen Bed",
    category: "bedroom",
    wood: "Mango",
    price: 24999,
    mrp: 34999,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop",
    blurb: "Chunky mango wood frame with slatted wooden headboard.",
    dimensions: 'L 84" × W 64" × H 42"',
  },
  {
    id: "f4",
    slug: "oak-wardrobe",
    name: "Oak 3-Door Wardrobe",
    category: "storage",
    wood: "Oak",
    price: 32499,
    mrp: 44999,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop",
    blurb: "Spacious all-wood wardrobe with soft-close oak doors.",
    dimensions: 'L 60" × W 22" × H 78"',
  },
  {
    id: "f5",
    slug: "sheesham-dining-table",
    name: "Sheesham 6-Seater Dining Table",
    category: "dining",
    wood: "Sheesham",
    price: 38999,
    mrp: 54999,
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop",
    blurb: "All-wood sheesham dining table with matching wooden chairs.",
    dimensions: 'L 72" × W 36" × H 30"',
  },
  {
    id: "f6",
    slug: "walnut-study-desk",
    name: "Walnut Study Desk",
    category: "study",
    wood: "Walnut",
    price: 14499,
    mrp: 19999,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop",
    blurb: "Minimal solid walnut desk with cable channel and drawer.",
    dimensions: 'L 48" × W 24" × H 30"',
  },
  {
    id: "f7",
    slug: "teak-bookshelf",
    name: "Teak Ladder Bookshelf",
    category: "study",
    wood: "Teak",
    price: 9999,
    mrp: 13999,
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop",
    blurb: "Five-tier solid teak leaning shelf, honey finish.",
    dimensions: 'L 24" × W 16" × H 72"',
  },
  {
    id: "f8",
    slug: "mango-tv-unit",
    name: "Mango Wood TV Unit",
    category: "living",
    wood: "Mango",
    price: 18999,
    mrp: 26999,
    image: "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=800&auto=format&fit=crop",
    blurb: "Rustic all-wood TV console in solid mango.",
    dimensions: 'L 60" × W 16" × H 22"',
  },
  {
    id: "f9",
    slug: "oak-nightstand",
    name: "Oak Bedside Nightstand",
    category: "bedroom",
    wood: "Oak",
    price: 5499,
    mrp: 7999,
    image: "https://images.unsplash.com/photo-1617104678098-de229db51175?w=800&auto=format&fit=crop",
    blurb: "Compact two-drawer nightstand in natural solid oak.",
    dimensions: 'L 18" × W 16" × H 24"',
  },
  {
    id: "f10",
    slug: "sheesham-shoe-rack",
    name: "Sheesham Shoe Rack",
    category: "storage",
    wood: "Sheesham",
    price: 6999,
    mrp: 9499,
    image: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&auto=format&fit=crop",
    blurb: "Three-tier solid sheesham shoe rack — all wood.",
    dimensions: 'L 36" × W 12" × H 20"',
  },
];
