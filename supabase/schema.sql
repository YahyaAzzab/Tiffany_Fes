-- Tiffany Fès
-- À coller dans Supabase → SQL Editor → Run.
-- Ensuite : Authentication → Users → Add user (e-mail + mot de passe).
-- Puis remplissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  description text not null default '',
  details text not null default '',
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  category text not null,
  stock integer not null default 0,
  unit text not null default 'pot',
  featured boolean not null default false,
  published boolean not null default true,
  badge text,
  inquire boolean not null default false,
  flavors text[] not null default '{}',
  seo_title text not null default '',
  seo_description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort integer not null default 0,
  fit text not null default 'contain' check (fit in ('contain', 'cover'))
);

create table if not exists public.orders (
  id uuid primary key,
  number text unique not null,
  customer_name text not null,
  phone text not null,
  email text not null default '',
  city text not null default 'Fès',
  address text not null default '',
  notes text not null default '',
  fulfillment text not null check (fulfillment in ('livraison', 'retrait')),
  status text not null default 'nouvelle' check (status in ('nouvelle', 'confirmee', 'preparation', 'livree', 'annulee')),
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  flavor text,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0 and quantity <= 12),
  image_url text not null default '',
  inquire boolean not null default false
);

create table if not exists public.messages (
  id uuid primary key,
  name text not null,
  phone text not null,
  email text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.products, public.product_images to authenticated;
grant insert on public.orders, public.order_items, public.messages to anon, authenticated;
grant select, update on public.orders, public.order_items to authenticated;
grant select on public.messages to authenticated;

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select to anon using (published = true);

drop policy if exists "products admin read" on public.products;
create policy "products admin read" on public.products
  for select to authenticated using (true);

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists "images public read" on public.product_images;
create policy "images public read" on public.product_images
  for select to anon using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

drop policy if exists "images admin" on public.product_images;
create policy "images admin" on public.product_images
  for all to authenticated using (true) with check (true);

drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders
  for insert to anon, authenticated with check (true);

drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders
  for select to authenticated using (true);

drop policy if exists "orders update" on public.orders;
create policy "orders update" on public.orders
  for update to authenticated using (true) with check (true);

drop policy if exists "items insert" on public.order_items;
create policy "items insert" on public.order_items
  for insert to anon, authenticated with check (true);

drop policy if exists "items admin" on public.order_items;
create policy "items admin" on public.order_items
  for select to authenticated using (true);

drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages
  for insert to anon, authenticated with check (true);

drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages
  for select to authenticated using (true);

create or replace function public.decrement_stock(target_id uuid, amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if amount is null or amount < 1 or amount > 12 then
    raise exception 'Quantité invalide';
  end if;
  update public.products
  set stock = greatest(0, stock - amount), updated_at = now()
  where id = target_id;
end;
$$;

revoke all on function public.decrement_stock(uuid, integer) from public;
grant execute on function public.decrement_stock(uuid, integer) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select to public using (bucket_id = 'product-images');

drop policy if exists "Auth upload product images" on storage.objects;
create policy "Auth upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Auth update product images" on storage.objects;
create policy "Auth update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "Auth delete product images" on storage.objects;
create policy "Auth delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
