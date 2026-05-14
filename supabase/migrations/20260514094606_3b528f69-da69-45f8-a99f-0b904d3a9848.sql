-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  pincode text not null,
  type text not null default 'Home',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

alter table public.addresses enable row level security;

create policy "addresses_select_own" on public.addresses
  for select to authenticated using (auth.uid() = user_id);
create policy "addresses_insert_own" on public.addresses
  for insert to authenticated with check (auth.uid() = user_id);
create policy "addresses_update_own" on public.addresses
  for update to authenticated using (auth.uid() = user_id);
create policy "addresses_delete_own" on public.addresses
  for delete to authenticated using (auth.uid() = user_id);

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null,
  address jsonb not null,
  payment text not null,
  subtotal integer not null,
  delivery integer not null default 0,
  total integer not null,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

create index orders_user_id_created_idx on public.orders(user_id, created_at desc);

alter table public.orders enable row level security;

create policy "orders_select_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders
  for insert to authenticated with check (auth.uid() = user_id);

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();