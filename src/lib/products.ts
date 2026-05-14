import vegImg from "@/assets/cat-vegetables.jpg";
import fruitsImg from "@/assets/cat-fruits.jpg";
import dairyImg from "@/assets/cat-dairy.jpg";
import snacksImg from "@/assets/cat-snacks.jpg";
import bevImg from "@/assets/cat-beverages.jpg";
import bakeryImg from "@/assets/cat-bakery.jpg";
import householdImg from "@/assets/cat-household.jpg";
import careImg from "@/assets/cat-personalcare.jpg";

export type Category = {
  slug: string;
  name: string;
  image: string;
  tint: string;
};

export const categories: Category[] = [
  { slug: "vegetables", name: "Vegetables", image: vegImg, tint: "oklch(0.95 0.08 145)" },
  { slug: "fruits", name: "Fresh Fruits", image: fruitsImg, tint: "oklch(0.95 0.1 50)" },
  { slug: "dairy", name: "Dairy & Eggs", image: dairyImg, tint: "oklch(0.96 0.08 95)" },
  { slug: "bakery", name: "Bakery", image: bakeryImg, tint: "oklch(0.95 0.08 70)" },
  { slug: "snacks", name: "Snacks", image: snacksImg, tint: "oklch(0.94 0.1 30)" },
  { slug: "beverages", name: "Beverages", image: bevImg, tint: "oklch(0.95 0.1 95)" },
  { slug: "household", name: "Household", image: householdImg, tint: "oklch(0.95 0.05 230)" },
  { slug: "personal-care", name: "Personal Care", image: careImg, tint: "oklch(0.95 0.07 170)" },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  weight: string;
  price: number;
  mrp: number;
  eta: string;
  rating: number;
};

const mk = (
  id: string,
  name: string,
  category: string,
  image: string,
  weight: string,
  price: number,
  mrp: number,
): Product => ({ id, name, category, image, weight, price, mrp, eta: "11 mins", rating: 4.5 });

export const products: Product[] = [
  mk("p1", "Fresh Tomatoes", "vegetables", vegImg, "500 g", 28, 40),
  mk("p2", "Broccoli", "vegetables", vegImg, "1 pc", 65, 80),
  mk("p3", "Carrot", "vegetables", vegImg, "500 g", 32, 45),
  mk("p4", "Bell Pepper Mix", "vegetables", vegImg, "300 g", 75, 95),
  mk("p5", "Banana Robusta", "fruits", fruitsImg, "1 dozen", 49, 60),
  mk("p6", "Royal Gala Apple", "fruits", fruitsImg, "4 pcs", 159, 199),
  mk("p7", "Strawberry Box", "fruits", fruitsImg, "200 g", 89, 120),
  mk("p8", "Sweet Orange", "fruits", fruitsImg, "1 kg", 119, 150),
  mk("p9", "Amul Toned Milk", "dairy", dairyImg, "1 L", 68, 70),
  mk("p10", "Farm Eggs", "dairy", dairyImg, "6 pcs", 72, 90),
  mk("p11", "Greek Yogurt", "dairy", dairyImg, "400 g", 110, 140),
  mk("p12", "Block Cheese", "dairy", dairyImg, "200 g", 199, 240),
  mk("p13", "Brown Bread", "bakery", bakeryImg, "400 g", 45, 55),
  mk("p14", "Butter Croissant", "bakery", bakeryImg, "2 pcs", 99, 120),
  mk("p15", "Pav Buns", "bakery", bakeryImg, "6 pcs", 35, 40),
  mk("p16", "Lays Classic", "snacks", snacksImg, "52 g", 20, 20),
  mk("p17", "Dark Chocolate", "snacks", snacksImg, "100 g", 175, 220),
  mk("p18", "Oat Cookies", "snacks", snacksImg, "200 g", 60, 80),
  mk("p19", "Cola Can", "beverages", bevImg, "300 ml", 40, 45),
  mk("p20", "Fresh Orange Juice", "beverages", bevImg, "1 L", 149, 180),
  mk("p21", "Sparkling Water", "beverages", bevImg, "750 ml", 60, 75),
  mk("p22", "Dish Wash Liquid", "household", householdImg, "750 ml", 169, 199),
  mk("p23", "Floor Cleaner", "household", householdImg, "1 L", 189, 220),
  mk("p24", "Body Wash", "personal-care", careImg, "250 ml", 220, 280),
  mk("p25", "Toothpaste", "personal-care", careImg, "150 g", 95, 115),
];

export const findProduct = (id: string) => products.find((p) => p.id === id);
export const productsByCategory = (slug: string) =>
  products.filter((p) => p.category === slug);
