-- Apply in Supabase SQL editor.
-- This file is written to be safe to run multiple times where possible.

-- Orders: server-authoritative checkout + tracking token + payment reconciliation
alter table if exists public.orders
  add column if not exists tracking_token text unique,
  add column if not exists payment_status text,
  add column if not exists payment_method text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists promo_code text,
  add column if not exists promo_discount numeric,
  add column if not exists tax_amount numeric,
  add column if not exists subtotal_amount numeric;

-- Products: inventory-aware storefront
alter table if exists public.products
  add column if not exists "inStock" boolean default true;

-- Reviews (if you want product reviews)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  user_id uuid,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz not null default now()
);

-- Wishlist (if not already present)
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Addresses (optional: saved addresses)
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text,
  phone text,
  address text not null,
  created_at timestamptz not null default now()
);

-- Contacts / Inquiries
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

-- Allow anonymous form submissions for contact inquiries
alter table public.contacts enable row level security;
drop policy if exists "Enable insert for anyone" on public.contacts;
create policy "Enable insert for anyone" on public.contacts for insert with check (true);
drop policy if exists "Enable read for everyone" on public.contacts;
create policy "Enable read for everyone" on public.contacts for select using (true);

