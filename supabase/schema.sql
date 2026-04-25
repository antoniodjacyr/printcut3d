-- Print & Cut 3D - Initial Supabase schema
-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'in_production', 'shipped');
  end if;
end$$;

-- Stores
create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null,
  name text not null,
  logo_url text,
  bio text,
  social_links jsonb not null default '{}'::jsonb,
  commission_rate numeric(5,2) not null default 8.00,
  is_admin_store boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title jsonb not null,
  description jsonb not null,
  price_usd numeric(12,2) not null check (price_usd > 0),
  weight_lbs numeric(10,3),
  dimensions_in jsonb not null default '{}'::jsonb,
  has_customization boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_title_languages check (title ? 'en' and title ? 'pt' and title ? 'es'),
  constraint product_description_languages check (description ? 'en' and description ? 'pt' and description ? 'es')
);

-- Product photos
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_user_id uuid not null,
  store_id uuid not null references public.stores(id) on delete restrict,
  status order_status not null default 'pending',
  subtotal_usd numeric(12,2) not null default 0,
  commission_rate_applied numeric(5,2) not null default 8.00,
  commission_amount_usd numeric(12,2) not null default 0,
  stripe_payment_intent_id text,
  shipping_state_us text,
  buyer_locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_usd numeric(12,2) not null,
  customization_text text
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  reviewer_user_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Abandoned carts (for recovery emails)
create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  email text,
  recovered_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  customization_text text
);

-- Admin audit logs
create table if not exists public.admin_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_user_id uuid not null,
  actor_email text not null,
  target_user_id uuid not null,
  target_email text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);

-- Updated_at helper trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_stores_updated_at on public.stores;
create trigger trg_stores_updated_at
before update on public.stores
for each row execute function public.handle_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.handle_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.handle_updated_at();

-- Commission policy helper (0% for admin store, else store rate)
create or replace function public.resolve_commission_rate(p_store_id uuid)
returns numeric as $$
declare
  v_rate numeric(5,2);
  v_admin boolean;
begin
  select commission_rate, is_admin_store
    into v_rate, v_admin
  from public.stores
  where id = p_store_id;

  if v_admin then
    return 0.00;
  end if;

  return coalesce(v_rate, 8.00);
end;
$$ language plpgsql stable;

-- Basic analytics views
create or replace view public.sales_by_us_state as
select
  shipping_state_us,
  count(*) as orders_count,
  sum(subtotal_usd) as gross_sales_usd
from public.orders
where status in ('in_production', 'shipped')
group by shipping_state_us;

create or replace view public.sales_by_language as
select
  buyer_locale,
  count(*) as orders_count,
  sum(subtotal_usd) as gross_sales_usd
from public.orders
group by buyer_locale;
