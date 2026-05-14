// Catalog types — shared between client and server. No runtime dependencies.

export type Category = {
  id: string;
  slug: string;
  name: string;
  image: string;
  tint: string;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  image: string;
  weight: string;
  price: number;
  mrp: number;
  eta: string;
  rating: number;
  in_stock: boolean;
};
