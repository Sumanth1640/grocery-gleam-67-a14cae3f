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

export const furnitureItems: FurnitureItem[] = [
  {
    id: "f1",
    slug: "sheesham-coffee-table",
    name: "Sheesham Coffee Table",
    category: "living",
    wood: "Sheesham",
    price: 8499,
    mrp: 12999,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
    blurb: "Hand-finished solid sheesham with brass inlay.",
    dimensions: 'L 42" × W 24" × H 18"',
  },
  {
    id: "f2",
    slug: "teak-3seater-sofa",
    name: "Teak 3-Seater Sofa",
    category: "living",
    wood: "Teak",
    price: 28999,
    mrp: 39999,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop",
    blurb: "Timeless teak frame with linen upholstery.",
    dimensions: 'L 78" × W 32" × H 34"',
  },
  {
    id: "f3",
    slug: "mango-wood-bed",
    name: "Mango Wood Queen Bed",
    category: "bedroom",
    wood: "Mango",
    price: 24999,
    mrp: 34999,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop",
    blurb: "Chunky mango wood frame with slatted headboard.",
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
    blurb: "Spacious wardrobe with soft-close oak doors.",
    dimensions: 'L 60" × W 22" × H 78"',
  },
  {
    id: "f5",
    slug: "sheesham-dining-set",
    name: "Sheesham 6-Seater Dining Set",
    category: "dining",
    wood: "Sheesham",
    price: 38999,
    mrp: 54999,
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop",
    blurb: "Solid sheesham table with six cushioned chairs.",
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
    blurb: "Minimal walnut desk with cable channel and drawer.",
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
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop",
    blurb: "Five-tier leaning shelf in honey teak finish.",
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
    blurb: "Rustic TV console with iron accents.",
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
    image: "https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800&auto=format&fit=crop",
    blurb: "Compact two-drawer nightstand in natural oak.",
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
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop",
    blurb: "Three-tier shoe rack with seating top.",
    dimensions: 'L 36" × W 12" × H 20"',
  },
];
