// Seeded food delivery data — restaurants, dishes, coupons.
// In-memory; no DB changes. Easy to swap later.

export type AddOn = { id: string; name: string; price: number };
export type Variant = { id: string; name: string; price: number };

export type Dish = {
  id: string;
  name: string;
  desc: string;
  image: string;
  price: number; // base price (₹)
  mrp?: number;
  veg: boolean;
  spicy?: boolean;
  bestseller?: boolean;
  rating?: number;
  section: string; // e.g. "Starters", "Mains"
  variants?: Variant[]; // optional sizes
  addons?: AddOn[];
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisines: string[];
  image: string;
  cover: string;
  rating: number;
  reviewsCount: number;
  etaMins: number; // delivery ETA
  costForTwo: number;
  veg: boolean; // pure veg restaurant
  priceTier: 1 | 2 | 3; // ₹ ₹₹ ₹₹₹
  offer?: string; // e.g. "50% OFF up to ₹100"
  area: string;
  distanceKm: number;
  menu: Dish[];
};

export const CUISINES = [
  "North Indian", "South Indian", "Chinese", "Italian", "Pizza",
  "Burgers", "Biryani", "Desserts", "Healthy", "Mughlai",
];

const img = (q: string, w = 600) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=${w}&q=70`;

// Common addons reused across dishes
const sodaAddons: AddOn[] = [
  { id: "coke", name: "Coke (250ml)", price: 40 },
  { id: "sprite", name: "Sprite (250ml)", price: 40 },
];
const cheeseAddon: AddOn = { id: "extra-cheese", name: "Extra cheese", price: 60 };
const dipAddons: AddOn[] = [
  { id: "mayo", name: "Garlic mayo dip", price: 30 },
  { id: "schezwan", name: "Schezwan dip", price: 30 },
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r1", slug: "spice-route",
    name: "Spice Route",
    cuisines: ["North Indian", "Mughlai", "Biryani"],
    image: img("photo-1565557623262-b51c2513a641"),
    cover: img("photo-1601050690597-df0568f70950", 1400),
    rating: 4.4, reviewsCount: 1820,
    etaMins: 32, costForTwo: 450, veg: false, priceTier: 2,
    offer: "50% OFF up to ₹100",
    area: "Indiranagar", distanceKm: 1.8,
    menu: [
      { id: "r1d1", name: "Butter Chicken", desc: "Tandoor-grilled chicken in silky tomato-butter gravy.", image: img("photo-1603894584373-5ac82b2ae398"), price: 320, mrp: 380, veg: false, spicy: true, bestseller: true, rating: 4.6, section: "Mains",
        variants: [{ id: "h", name: "Half", price: 320 }, { id: "f", name: "Full", price: 540 }],
        addons: [cheeseAddon, ...sodaAddons] },
      { id: "r1d2", name: "Paneer Tikka Masala", desc: "Smoky paneer cubes simmered in onion-tomato masala.", image: img("photo-1631452180519-c014fe946bc7"), price: 280, veg: true, spicy: true, bestseller: true, rating: 4.5, section: "Mains" },
      { id: "r1d3", name: "Chicken Biryani", desc: "Long-grain basmati layered with tender chicken and saffron.", image: img("photo-1563379091339-03b21ab4a4f8"), price: 260, mrp: 300, veg: false, bestseller: true, rating: 4.7, section: "Biryani",
        variants: [{ id: "r", name: "Regular", price: 260 }, { id: "j", name: "Jumbo", price: 360 }] },
      { id: "r1d4", name: "Veg Biryani", desc: "Aromatic rice tossed with vegetables and whole spices.", image: img("photo-1633945274405-b6c8069047b0"), price: 220, veg: true, rating: 4.3, section: "Biryani" },
      { id: "r1d5", name: "Garlic Naan", desc: "Hand-stretched naan brushed with garlic butter.", image: img("photo-1565557623262-b51c2513a641"), price: 60, veg: true, rating: 4.4, section: "Breads" },
      { id: "r1d6", name: "Gulab Jamun (2 pcs)", desc: "Warm milk dumplings soaked in cardamom syrup.", image: img("photo-1601925260368-ae2f83cf8b7f"), price: 90, veg: true, rating: 4.5, section: "Desserts" },
    ],
  },
  {
    id: "r2", slug: "sliced-stone-pizza",
    name: "Sliced Stone Pizza",
    cuisines: ["Pizza", "Italian"],
    image: img("photo-1513104890138-7c749659a591"),
    cover: img("photo-1565299624946-b28f40a0ae38", 1400),
    rating: 4.3, reviewsCount: 945,
    etaMins: 28, costForTwo: 600, veg: false, priceTier: 2,
    offer: "Buy 1 Get 1 Free",
    area: "Koramangala", distanceKm: 2.4,
    menu: [
      { id: "r2d1", name: "Margherita", desc: "Fresh mozzarella, basil, San Marzano tomato.", image: img("photo-1604068549290-dea0e4a305ca"), price: 220, veg: true, bestseller: true, rating: 4.5, section: "Veg Pizzas",
        variants: [{ id: "s", name: "Small (7\")", price: 220 }, { id: "m", name: "Medium (10\")", price: 380 }, { id: "l", name: "Large (13\")", price: 540 }],
        addons: [cheeseAddon, ...sodaAddons] },
      { id: "r2d2", name: "Farmhouse", desc: "Onion, capsicum, tomato, mushroom, mozzarella.", image: img("photo-1593504049359-74330189a345"), price: 320, veg: true, rating: 4.4, section: "Veg Pizzas" },
      { id: "r2d3", name: "Pepperoni", desc: "Loaded pepperoni slices over melty mozzarella.", image: img("photo-1565299624946-b28f40a0ae38"), price: 380, mrp: 440, veg: false, bestseller: true, rating: 4.6, section: "Non-veg Pizzas" },
      { id: "r2d4", name: "BBQ Chicken", desc: "Smoky BBQ chicken, onion, jalapeño.", image: img("photo-1571066811602-716837d681de"), price: 420, veg: false, spicy: true, rating: 4.5, section: "Non-veg Pizzas" },
      { id: "r2d5", name: "Garlic Bread", desc: "Crisp baguette with garlic-herb butter.", image: img("photo-1573140247632-f8fd74997d5c"), price: 140, veg: true, rating: 4.2, section: "Sides", addons: dipAddons },
      { id: "r2d6", name: "Choco Lava Cake", desc: "Warm chocolate cake with molten centre.", image: img("photo-1606313564200-e75d5e30476c"), price: 130, veg: true, bestseller: true, rating: 4.7, section: "Desserts" },
    ],
  },
  {
    id: "r3", slug: "wok-and-roll",
    name: "Wok & Roll",
    cuisines: ["Chinese", "Asian"],
    image: img("photo-1585032226651-759b368d7246"),
    cover: img("photo-1552611052-33e04de081de", 1400),
    rating: 4.2, reviewsCount: 612,
    etaMins: 36, costForTwo: 500, veg: false, priceTier: 2,
    offer: "20% OFF",
    area: "HSR Layout", distanceKm: 3.1,
    menu: [
      { id: "r3d1", name: "Veg Hakka Noodles", desc: "Stir-fried noodles tossed with crunchy veggies.", image: img("photo-1585032226651-759b368d7246"), price: 180, veg: true, rating: 4.3, section: "Noodles", addons: dipAddons },
      { id: "r3d2", name: "Chicken Manchurian", desc: "Crispy chicken in tangy soy-garlic sauce.", image: img("photo-1623689043725-b6f80b5fb6f9"), price: 240, veg: false, spicy: true, bestseller: true, rating: 4.4, section: "Mains" },
      { id: "r3d3", name: "Schezwan Fried Rice", desc: "Wok-tossed rice with spicy schezwan masala.", image: img("photo-1626804475297-41608ea09aeb"), price: 200, veg: true, spicy: true, rating: 4.2, section: "Rice" },
      { id: "r3d4", name: "Crispy Honey Chilli Potato", desc: "Crackling potato batons glazed in honey-chilli.", image: img("photo-1599974579688-8dbdd335c77f"), price: 180, veg: true, bestseller: true, rating: 4.5, section: "Starters" },
      { id: "r3d5", name: "Chilli Chicken (Dry)", desc: "Crispy chicken tossed with capsicum & onion.", image: img("photo-1603133872878-684f208fb84b"), price: 260, veg: false, spicy: true, rating: 4.4, section: "Starters" },
    ],
  },
  {
    id: "r4", slug: "burger-barn",
    name: "Burger Barn",
    cuisines: ["Burgers", "American"],
    image: img("photo-1568901346375-23c9450c58cd"),
    cover: img("photo-1571091718767-18b5b1457add", 1400),
    rating: 4.5, reviewsCount: 2210,
    etaMins: 24, costForTwo: 350, veg: false, priceTier: 1,
    offer: "Free fries on ₹299+",
    area: "Whitefield", distanceKm: 1.2,
    menu: [
      { id: "r4d1", name: "Classic Cheeseburger", desc: "Beef-style patty, cheddar, pickles, house sauce.", image: img("photo-1568901346375-23c9450c58cd"), price: 220, veg: false, bestseller: true, rating: 4.6, section: "Burgers", addons: [cheeseAddon, { id: "bacon", name: "Bacon", price: 70 }] },
      { id: "r4d2", name: "Crispy Chicken Burger", desc: "Buttermilk-fried chicken thigh, slaw, sriracha mayo.", image: img("photo-1571091718767-18b5b1457add"), price: 240, veg: false, spicy: true, bestseller: true, rating: 4.7, section: "Burgers" },
      { id: "r4d3", name: "Veggie Crunch Burger", desc: "Crispy paneer-corn patty, lettuce, herb mayo.", image: img("photo-1550547660-d9450f859349"), price: 180, veg: true, rating: 4.3, section: "Burgers" },
      { id: "r4d4", name: "Loaded Fries", desc: "Cheese sauce, jalapeños, crispy onions.", image: img("photo-1573080496219-bb080dd4f877"), price: 180, veg: true, rating: 4.4, section: "Sides" },
      { id: "r4d5", name: "Chocolate Milkshake", desc: "Thick milkshake topped with whipped cream.", image: img("photo-1572490122747-3968b75cc699"), price: 160, veg: true, rating: 4.5, section: "Beverages" },
    ],
  },
  {
    id: "r5", slug: "south-yard",
    name: "South Yard",
    cuisines: ["South Indian"],
    image: img("photo-1668236543090-82eba5ee5976"),
    cover: img("photo-1610192244261-3f33de3f55e4", 1400),
    rating: 4.6, reviewsCount: 1340,
    etaMins: 22, costForTwo: 300, veg: true, priceTier: 1,
    area: "Jayanagar", distanceKm: 0.9,
    menu: [
      { id: "r5d1", name: "Masala Dosa", desc: "Crisp dosa with potato masala, chutneys, sambar.", image: img("photo-1668236543090-82eba5ee5976"), price: 120, veg: true, bestseller: true, rating: 4.7, section: "Dosa" },
      { id: "r5d2", name: "Idli Vada Combo", desc: "Two idlis, one vada with sambar & coconut chutney.", image: img("photo-1589301760014-d929f3979dbc"), price: 90, veg: true, rating: 4.5, section: "Tiffin" },
      { id: "r5d3", name: "Filter Coffee", desc: "Strong south-Indian filter coffee in a steel tumbler.", image: img("photo-1559496417-e7f25cb247f3"), price: 50, veg: true, bestseller: true, rating: 4.6, section: "Beverages" },
      { id: "r5d4", name: "Mini Meals", desc: "Rice, sambar, rasam, two curries, papad, curd.", image: img("photo-1610192244261-3f33de3f55e4"), price: 180, veg: true, rating: 4.4, section: "Meals" },
      { id: "r5d5", name: "Mysore Pak", desc: "Ghee-laden gram-flour fudge.", image: img("photo-1601925260368-ae2f83cf8b7f"), price: 60, veg: true, rating: 4.5, section: "Sweets" },
    ],
  },
  {
    id: "r6", slug: "sweet-spoon",
    name: "Sweet Spoon",
    cuisines: ["Desserts", "Bakery"],
    image: img("photo-1551024506-0bccd828d307"),
    cover: img("photo-1488477181946-6428a0291777", 1400),
    rating: 4.7, reviewsCount: 880,
    etaMins: 26, costForTwo: 250, veg: true, priceTier: 1,
    offer: "Flat ₹50 OFF",
    area: "MG Road", distanceKm: 2.0,
    menu: [
      { id: "r6d1", name: "Chocolate Truffle Pastry", desc: "Layered chocolate sponge with rich ganache.", image: img("photo-1551024506-0bccd828d307"), price: 130, veg: true, bestseller: true, rating: 4.7, section: "Pastries" },
      { id: "r6d2", name: "Red Velvet Cupcake", desc: "Cocoa-rich sponge with cream-cheese frosting.", image: img("photo-1486427944299-d1955d23e34d"), price: 110, veg: true, rating: 4.5, section: "Pastries" },
      { id: "r6d3", name: "Tiramisu Cup", desc: "Coffee-soaked sponge with mascarpone cream.", image: img("photo-1571877227200-a0d98ea607e9"), price: 180, veg: true, bestseller: true, rating: 4.8, section: "Desserts" },
      { id: "r6d4", name: "Cinnamon Roll", desc: "Buttery roll glazed with vanilla icing.", image: img("photo-1509365465985-25d11c17e812"), price: 90, veg: true, rating: 4.4, section: "Bakery" },
    ],
  },
  {
    id: "r7", slug: "green-bowl",
    name: "Green Bowl",
    cuisines: ["Healthy", "Salads"],
    image: img("photo-1546069901-ba9599a7e63c"),
    cover: img("photo-1490645935967-10de6ba17061", 1400),
    rating: 4.4, reviewsCount: 510,
    etaMins: 30, costForTwo: 400, veg: true, priceTier: 2,
    area: "Koramangala", distanceKm: 1.6,
    menu: [
      { id: "r7d1", name: "Mediterranean Bowl", desc: "Quinoa, chickpeas, hummus, olives, feta.", image: img("photo-1546069901-ba9599a7e63c"), price: 280, veg: true, bestseller: true, rating: 4.5, section: "Bowls" },
      { id: "r7d2", name: "Caesar Salad", desc: "Crisp romaine, parmesan, garlic croutons, classic dressing.", image: img("photo-1551248429-40975aa4de74"), price: 240, veg: true, rating: 4.3, section: "Salads" },
      { id: "r7d3", name: "Avocado Toast", desc: "Sourdough, smashed avocado, chilli flakes, lime.", image: img("photo-1525351484163-7529414344d8"), price: 220, veg: true, rating: 4.4, section: "Toasts" },
      { id: "r7d4", name: "Cold-pressed Juice", desc: "Beet, carrot, ginger, apple.", image: img("photo-1622597467836-f3e6c64b7e1e"), price: 160, veg: true, rating: 4.2, section: "Beverages" },
    ],
  },
  {
    id: "r8", slug: "biryani-house",
    name: "Biryani House",
    cuisines: ["Biryani", "Mughlai"],
    image: img("photo-1633945274405-b6c8069047b0"),
    cover: img("photo-1563379091339-03b21ab4a4f8", 1400),
    rating: 4.5, reviewsCount: 3120,
    etaMins: 38, costForTwo: 400, veg: false, priceTier: 2,
    offer: "Free dessert on ₹499+",
    area: "Bellandur", distanceKm: 4.2,
    menu: [
      { id: "r8d1", name: "Hyderabadi Chicken Biryani", desc: "Dum-cooked basmati layered with marinated chicken.", image: img("photo-1563379091339-03b21ab4a4f8"), price: 280, veg: false, bestseller: true, rating: 4.7, section: "Biryani",
        variants: [{ id: "r", name: "Regular", price: 280 }, { id: "j", name: "Jumbo", price: 380 }] },
      { id: "r8d2", name: "Mutton Biryani", desc: "Slow-cooked mutton with saffron-scented rice.", image: img("photo-1631452180519-c014fe946bc7"), price: 360, veg: false, bestseller: true, rating: 4.6, section: "Biryani" },
      { id: "r8d3", name: "Veg Dum Biryani", desc: "Layered vegetable biryani with mint and fried onions.", image: img("photo-1633945274405-b6c8069047b0"), price: 220, veg: true, rating: 4.3, section: "Biryani" },
      { id: "r8d4", name: "Chicken 65", desc: "Spicy deep-fried chicken with curry leaves.", image: img("photo-1626777553635-43a9adf30bb6"), price: 240, veg: false, spicy: true, rating: 4.5, section: "Starters" },
      { id: "r8d5", name: "Phirni", desc: "Slow-cooked rice pudding with rose & pistachio.", image: img("photo-1601925260368-ae2f83cf8b7f"), price: 100, veg: true, rating: 4.4, section: "Desserts" },
    ],
  },
];

export function findRestaurant(slug: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.slug === slug);
}
