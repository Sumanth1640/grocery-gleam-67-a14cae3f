-- ===== Roles =====
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "user_roles_select_own_or_admin"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "user_roles_admin_manage"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ===== Categories =====
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image text not null,
  tint text not null default 'oklch(0.95 0.05 145)',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (true);
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ===== Products =====
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  image text not null,
  weight text not null,
  price int not null check (price >= 0),
  mrp int not null check (mrp >= 0),
  eta text not null default '11 mins',
  rating numeric(2,1) not null default 4.5,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_slug);
create index products_name_idx on public.products using gin (to_tsvector('simple', name));

alter table public.products enable row level security;

create policy "products_public_read" on public.products
  for select to anon, authenticated using (true);
create policy "products_admin_write" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ===== Seed categories =====
insert into public.categories (slug, name, image, tint, sort_order) values
  ('vegetables', 'Vegetables', '/cat-vegetables.jpg', 'oklch(0.95 0.08 145)', 1),
  ('fruits', 'Fresh Fruits', '/cat-fruits.jpg', 'oklch(0.95 0.1 50)', 2),
  ('dairy', 'Dairy & Eggs', '/cat-dairy.jpg', 'oklch(0.96 0.08 95)', 3),
  ('bakery', 'Bakery', '/cat-bakery.jpg', 'oklch(0.95 0.08 70)', 4),
  ('snacks', 'Snacks', '/cat-snacks.jpg', 'oklch(0.94 0.1 30)', 5),
  ('beverages', 'Beverages', '/cat-beverages.jpg', 'oklch(0.95 0.1 95)', 6),
  ('household', 'Household', '/cat-household.jpg', 'oklch(0.95 0.05 230)', 7),
  ('personal-care', 'Personal Care', '/cat-personalcare.jpg', 'oklch(0.95 0.07 170)', 8);

-- ===== Seed products =====
insert into public.products (slug, name, category_slug, image, weight, price, mrp) values
  ('p1', 'Fresh Tomatoes', 'vegetables', '/cat-vegetables.jpg', '500 g', 28, 40),
  ('p2', 'Broccoli', 'vegetables', '/cat-vegetables.jpg', '1 pc', 65, 80),
  ('p3', 'Carrot', 'vegetables', '/cat-vegetables.jpg', '500 g', 32, 45),
  ('p4', 'Bell Pepper Mix', 'vegetables', '/cat-vegetables.jpg', '300 g', 75, 95),
  ('p5', 'Banana Robusta', 'fruits', '/cat-fruits.jpg', '1 dozen', 49, 60),
  ('p6', 'Royal Gala Apple', 'fruits', '/cat-fruits.jpg', '4 pcs', 159, 199),
  ('p7', 'Strawberry Box', 'fruits', '/cat-fruits.jpg', '200 g', 89, 120),
  ('p8', 'Sweet Orange', 'fruits', '/cat-fruits.jpg', '1 kg', 119, 150),
  ('p9', 'Amul Toned Milk', 'dairy', '/cat-dairy.jpg', '1 L', 68, 70),
  ('p10', 'Farm Eggs', 'dairy', '/cat-dairy.jpg', '6 pcs', 72, 90),
  ('p11', 'Greek Yogurt', 'dairy', '/cat-dairy.jpg', '400 g', 110, 140),
  ('p12', 'Block Cheese', 'dairy', '/cat-dairy.jpg', '200 g', 199, 240),
  ('p13', 'Brown Bread', 'bakery', '/cat-bakery.jpg', '400 g', 45, 55),
  ('p14', 'Butter Croissant', 'bakery', '/cat-bakery.jpg', '2 pcs', 99, 120),
  ('p15', 'Pav Buns', 'bakery', '/cat-bakery.jpg', '6 pcs', 35, 40),
  ('p16', 'Lays Classic', 'snacks', '/cat-snacks.jpg', '52 g', 20, 20),
  ('p17', 'Dark Chocolate', 'snacks', '/cat-snacks.jpg', '100 g', 175, 220),
  ('p18', 'Oat Cookies', 'snacks', '/cat-snacks.jpg', '200 g', 60, 80),
  ('p19', 'Cola Can', 'beverages', '/cat-beverages.jpg', '300 ml', 40, 45),
  ('p20', 'Fresh Orange Juice', 'beverages', '/cat-beverages.jpg', '1 L', 149, 180),
  ('p21', 'Sparkling Water', 'beverages', '/cat-beverages.jpg', '750 ml', 60, 75),
  ('p22', 'Dish Wash Liquid', 'household', '/cat-household.jpg', '750 ml', 169, 199),
  ('p23', 'Floor Cleaner', 'household', '/cat-household.jpg', '1 L', 189, 220),
  ('p24', 'Body Wash', 'personal-care', '/cat-personalcare.jpg', '250 ml', 220, 280),
  ('p25', 'Toothpaste', 'personal-care', '/cat-personalcare.jpg', '150 g', 95, 115);
