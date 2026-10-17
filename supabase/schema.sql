-- ============================================================
-- Supabase Schema for Budget-Based Product Bundle Builder (C07)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Products Table
create table if not exists public.products (
  id text primary key,
  sku text,
  name text not null,
  category text not null,
  slot_type text not null,
  base_price numeric not null,
  landed_price numeric not null,
  rating numeric default 4.5,
  reviews_count integer default 0,
  in_stock boolean default true,
  stock_count integer default 100,
  lead_time_days integer default 2,
  specs jsonb default '{}'::jsonb,
  is_hero boolean default false,
  badge text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Saved Bundles Table
create table if not exists public.saved_bundles (
  id text primary key,
  name text not null,
  activity_id text not null,
  budget numeric not null,
  landed_price numeric not null,
  items jsonb not null default '{}'::jsonb,
  validation jsonb default '{}'::jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Shopper Experiment Records (MBA UX Research Field Trials)
create table if not exists public.shopper_records (
  id text primary key,
  participant_id text not null,
  target_shopper_category text not null,
  approach_date text,
  contact_outcome text,
  task_completion text,
  time_taken text,
  budget_compliance text,
  compatibility_errors text,
  landed_price_understanding text,
  verbatim_feedback text,
  researcher_observations text,
  improvement_identified text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Project Evidence Records (C07 Audit Trails)
create table if not exists public.evidence_records (
  id text primary key,
  evidence_id text not null,
  feature_tested text not null,
  test_procedure text not null,
  expected_outcome text not null,
  actual_outcome text not null,
  status text not null,
  reference_file text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.saved_bundles enable row level security;
alter table public.shopper_records enable row level security;
alter table public.evidence_records enable row level security;

-- 7. Public Read & Write Policies for Anon Key (Development & Prototyping)
drop policy if exists "Allow public read access on products" on public.products;
create policy "Allow public read access on products" on public.products for select using (true);

drop policy if exists "Allow public insert/update on products" on public.products;
create policy "Allow public insert/update on products" on public.products for all using (true);

drop policy if exists "Allow public all access on saved_bundles" on public.saved_bundles;
create policy "Allow public all access on saved_bundles" on public.saved_bundles for all using (true);

drop policy if exists "Allow public all access on shopper_records" on public.shopper_records;
create policy "Allow public all access on shopper_records" on public.shopper_records for all using (true);

drop policy if exists "Allow public all access on evidence_records" on public.evidence_records;
create policy "Allow public all access on evidence_records" on public.evidence_records for all using (true);
