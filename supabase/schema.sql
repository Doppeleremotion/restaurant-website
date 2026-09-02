-- =========================================================
-- CAMUS FOOD MARKETPLACE - DATABASE SCHEMA
-- =========================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================

do $$ begin
  create type public.user_role as enum ('customer', 'restaurant_owner', 'restaurant_staff', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.restaurant_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'new',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_type as enum ('pickup', 'delivery');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.reservation_status as enum (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum (
    'trial',
    'active',
    'past_due',
    'cancelled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  city text,
  neighborhood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- CITIES
-- =========================================================

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text,
  country text not null default 'Cameroon',
  latitude double precision,
  longitude double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CATEGORIES
-- =========================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- RESTAURANTS
-- =========================================================

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid references public.profiles(id) on delete set null,

  name text not null,
  slug text not null unique,

  description text,

  phone text,
  email text,
  website text,

  logo_url text,
  cover_image_url text,

  cuisine_type text,
  price_range text,

  status public.restaurant_status not null default 'pending',

  is_featured boolean not null default false,
  is_active boolean not null default true,

  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,

  opening_time time,
  closing_time time,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- RESTAURANT STAFF
-- =========================================================

create table if not exists public.restaurant_staff (
  id uuid primary key default gen_random_uuid(),

  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  staff_role text not null default 'staff',

  created_at timestamptz not null default now(),

  unique (restaurant_id, user_id)
);

-- =========================================================
-- RESTAURANT LOCATIONS
-- =========================================================

create table if not exists public.restaurant_locations (
  id uuid primary key default gen_random_uuid(),

  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,

  city text,
  neighborhood text,
  address text,

  latitude double precision,
  longitude double precision,

  delivery_available boolean not null default true,

  created_at timestamptz not null default now(),

  unique (restaurant_id)
);

-- =========================================================
-- DISHES
-- =========================================================

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),

  restaurant_id uuid not null references public.restaurants(id) on delete cascade,

  name text not null,
  slug text not null,

  description text,

  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'XAF',

  image_url text,

  is_available boolean not null default true,
  is_featured boolean not null default false,

  preparation_time integer,

  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (restaurant_id, slug)
);

-- =========================================================
-- DISH CATEGORIES
-- =========================================================

create table if not exists public.dish_categories (
  dish_id uuid not null references public.dishes(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,

  primary key (dish_id, category_id)
);

-- =========================================================
-- ORDERS
-- =========================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,

  order_number text not null unique,

  status public.order_status not null default 'new',
  order_type public.order_type not null default 'pickup',

  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  currency text not null default 'XAF',

  delivery_address text,
  delivery_city text,
  delivery_neighborhood text,

  delivery_latitude double precision,
  delivery_longitude double precision,

  customer_name text,
  customer_phone text,

  customer_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ORDER ITEMS
-- =========================================================

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid references public.dishes(id) on delete set null,

  dish_name text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),

  total_price numeric(12,2) not null,

  created_at timestamptz not null default now()
);

-- =========================================================
-- RESERVATIONS
-- =========================================================

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,

  reservation_date date not null,
  reservation_time time not null,

  guests integer not null check (guests > 0),

  customer_name text,
  customer_phone text,

  note text,

  status public.reservation_status not null default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REVIEWS
-- =========================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,

  rating integer not null check (rating between 1 and 5),
  comment text,

  is_visible boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- FAVORITES
-- =========================================================

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  dish_id uuid references public.dishes(id) on delete cascade,

  created_at timestamptz not null default now(),

  check (
    restaurant_id is not null
    or dish_id is not null
  )
);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  restaurant_id uuid not null references public.restaurants(id) on delete cascade,

  status public.subscription_status not null default 'trial',

  monthly_price numeric(12,2) not null default 0,
  currency text not null default 'XAF',

  trial_start timestamptz,
  trial_end timestamptz,

  current_period_start timestamptz,
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PAYMENTS
-- =========================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,

  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'XAF',

  payment_method text,
  transaction_reference text,

  status text not null default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  message text not null,

  type text,

  is_read boolean not null default false,

  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists restaurants_status_idx
on public.restaurants(status);

create index if not exists restaurants_owner_idx
on public.restaurants(owner_id);

create index if not exists restaurants_name_idx
on public.restaurants(name);

create index if not exists dishes_restaurant_idx
on public.dishes(restaurant_id);

create index if not exists dishes_name_idx
on public.dishes(name);

create index if not exists orders_customer_idx
on public.orders(customer_id);

create index if not exists orders_restaurant_idx
on public.orders(restaurant_id);

create index if not exists orders_status_idx
on public.orders(status);

create index if not exists reservations_customer_idx
on public.reservations(customer_id);

create index if not exists reservations_restaurant_idx
on public.reservations(restaurant_id);

create index if not exists reviews_restaurant_idx
on public.reviews(restaurant_id);

create index if not exists notifications_user_idx
on public.notifications(user_id);

-- =========================================================
-- AUTO CREATE PROFILE WHEN USER SIGNS UP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.update_updated_at();

drop trigger if exists restaurants_updated_at on public.restaurants;
create trigger restaurants_updated_at
before update on public.restaurants
for each row execute procedure public.update_updated_at();

drop trigger if exists dishes_updated_at on public.dishes;
create trigger dishes_updated_at
before update on public.dishes
for each row execute procedure public.update_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute procedure public.update_updated_at();

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
before update on public.reservations
for each row execute procedure public.update_updated_at();

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
before update on public.reviews
for each row execute procedure public.update_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute procedure public.update_updated_at();

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
before update on public.payments
for each row execute procedure public.update_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_staff enable row level security;
alter table public.restaurant_locations enable row level security;
alter table public.dishes enable row level security;
alter table public.dish_categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- =========================================================
-- PUBLIC READ POLICIES
-- =========================================================

create policy "Anyone can view active cities"
on public.cities
for select
using (is_active = true);

create policy "Anyone can view active categories"
on public.categories
for select
using (is_active = true);

create policy "Anyone can view approved restaurants"
on public.restaurants
for select
using (status = 'approved' and is_active = true);

create policy "Anyone can view approved restaurant locations"
on public.restaurant_locations
for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_locations.restaurant_id
    and r.status = 'approved'
    and r.is_active = true
  )
);

create policy "Anyone can view available dishes"
on public.dishes
for select
using (
  is_available = true
  and exists (
    select 1
    from public.restaurants r
    where r.id = dishes.restaurant_id
    and r.status = 'approved'
    and r.is_active = true
  )
);

create policy "Anyone can view dish categories"
on public.dish_categories
for select
using (true);

create policy "Anyone can view visible reviews"
on public.reviews
for select
using (is_visible = true);

-- =========================================================
-- PROFILE POLICIES
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can create own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users can submit restaurants"
on public.restaurants
for insert
with check (auth.uid() = owner_id);

create policy "Owners can update their restaurants"
on public.restaurants
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- =========================================================
-- FAVORITES
-- =========================================================

create policy "Users can view own favorites"
on public.favorites
for select
using (auth.uid() = user_id);

create policy "Users can create own favorites"
on public.favorites
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
on public.favorites
for delete
using (auth.uid() = user_id);

-- =========================================================
-- CUSTOMER ORDERS
-- =========================================================

create policy "Customers can view own orders"
on public.orders
for select
using (auth.uid() = customer_id);

create policy "Customers can create orders"
on public.orders
for insert
with check (auth.uid() = customer_id);

create policy "Customers can view own order items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
    and o.customer_id = auth.uid()
  )
);

create policy "Customers can create order items"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
    and o.customer_id = auth.uid()
  )
);

-- =========================================================
-- RESERVATIONS
-- =========================================================

create policy "Customers can view own reservations"
on public.reservations
for select
using (auth.uid() = customer_id);

create policy "Customers can create reservations"
on public.reservations
for insert
with check (auth.uid() = customer_id);

create policy "Customers can cancel own reservations"
on public.reservations
for update
using (auth.uid() = customer_id)
with check (auth.uid() = customer_id);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

create policy "Users can view own notifications"
on public.notifications
for select
using (auth.uid() = user_id);

create policy "Users can update own notifications"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- REVIEWS
-- =========================================================

create policy "Customers can create reviews"
on public.reviews
for insert
with check (auth.uid() = customer_id);

create policy "Customers can update own reviews"
on public.reviews
for update
using (auth.uid() = customer_id)
with check (auth.uid() = customer_id);

create policy "Customers can delete own reviews"
on public.reviews
for delete
using (auth.uid() = customer_id);

-- =========================================================
-- SEED CAMEROON CITIES
-- =========================================================

insert into public.cities
(name, region, latitude, longitude)
values
('Yaoundé', 'Centre', 3.8480, 11.5021),
('Douala', 'Littoral', 4.0511, 9.7679),
('Buea', 'Southwest', 4.1550, 9.2310),
('Bamenda', 'Northwest', 5.9631, 10.1591),
('Bafoussam', 'West', 5.4781, 10.4177),
('Limbe', 'Southwest', 4.0236, 9.1910),
('Kribi', 'South', 2.9406, 9.9100),
('Ebolowa', 'South', 2.9167, 11.1500),
('Garoua', 'North', 9.3014, 13.3977)
on conflict (name) do nothing;

-- =========================================================
-- SEED FOOD CATEGORIES
-- =========================================================

insert into public.categories
(name, slug, description)
values
('Cameroonian', 'cameroonian', 'Traditional Cameroonian dishes'),
('African', 'african', 'Popular African cuisine'),
('Fast Food', 'fast-food', 'Quick and casual meals'),
('Pizza', 'pizza', 'Pizza and Italian-inspired meals'),
('Burgers', 'burgers', 'Burgers and sandwiches'),
('Chicken', 'chicken', 'Chicken dishes'),
('Seafood', 'seafood', 'Fish and seafood dishes'),
('Breakfast', 'breakfast', 'Breakfast and brunch'),
('Desserts', 'desserts', 'Sweet treats and desserts'),
('Drinks', 'drinks', 'Drinks and refreshments')
on conflict (slug) do nothing;

-- =========================================================
-- DONE
-- =========================================================