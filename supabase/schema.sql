-- CAMUS marketplace schema. Run in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'restaurant_owner', 'staff', 'admin');
create type public.restaurant_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.order_status as enum ('new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled');
create type public.reservation_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now()
);
create table public.cities (id bigint generated always as identity primary key, name text not null unique, country text not null default 'Cameroon');
create table public.categories (id bigint generated always as identity primary key, name text not null unique, slug text not null unique);
create table public.restaurants (
  id uuid primary key default gen_random_uuid(), owner_id uuid references public.profiles(id) on delete set null,
  name text not null, slug text not null unique, description text, cuisine text, status public.restaurant_status not null default 'pending',
  logo_url text, cover_url text, phone text, email text, opening_hours jsonb not null default '{}'::jsonb,
  trial_start date, trial_end date, created_at timestamptz not null default now()
);
create table public.restaurant_locations (
  restaurant_id uuid primary key references public.restaurants(id) on delete cascade, city_id bigint references public.cities(id),
  neighborhood text, address text, latitude numeric(9,6), longitude numeric(9,6), country text not null default 'Cameroon'
);
create table public.dishes (
  id uuid primary key default gen_random_uuid(), restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id bigint references public.categories(id), name text not null, description text, price_fcfa integer not null check (price_fcfa >= 0),
  image_url text, is_available boolean not null default true, created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), restaurant_id uuid not null references public.restaurants(id),
  status public.order_status not null default 'new', fulfillment_type text not null check (fulfillment_type in ('pickup','delivery')),
  delivery_address text, delivery_city text, delivery_neighborhood text, delivery_instructions text, notes text,
  subtotal_fcfa integer not null check (subtotal_fcfa >= 0), delivery_fee_fcfa integer not null default 0 check (delivery_fee_fcfa >= 0), total_fcfa integer not null check (total_fcfa >= 0), created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, dish_id uuid references public.dishes(id) on delete set null,
  dish_name text not null, quantity integer not null check (quantity > 0), unit_price_fcfa integer not null check (unit_price_fcfa >= 0)
);
create table public.reservations (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), restaurant_id uuid not null references public.restaurants(id),
  reservation_date date not null, reservation_time time not null, guests integer not null check (guests > 0), guest_name text not null, phone text not null, special_request text,
  status public.reservation_status not null default 'pending', created_at timestamptz not null default now()
);
create table public.reviews (id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.profiles(id), restaurant_id uuid not null references public.restaurants(id), order_id uuid references public.orders(id), rating integer not null check (rating between 1 and 5), body text, created_at timestamptz not null default now());
create table public.favorites (customer_id uuid references public.profiles(id) on delete cascade, restaurant_id uuid references public.restaurants(id) on delete cascade, dish_id uuid references public.dishes(id) on delete cascade, primary key (customer_id, restaurant_id, dish_id));
create table public.subscriptions (id uuid primary key default gen_random_uuid(), restaurant_id uuid not null unique references public.restaurants(id) on delete cascade, plan_name text not null default 'CAMUS Business', monthly_price_fcfa integer not null default 10000, trial_start date, trial_end date, status text not null default 'trialing', payment_status text not null default 'pending');
create table public.payments (id uuid primary key default gen_random_uuid(), subscription_id uuid references public.subscriptions(id), order_id uuid references public.orders(id), amount_fcfa integer not null, provider text, provider_reference text, status text not null default 'pending', created_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, title text not null, body text, read_at timestamptz, created_at timestamptz not null default now());

insert into public.cities (name) values ('Yaoundé'), ('Douala'), ('Buea'), ('Bamenda'), ('Bafoussam'), ('Limbe'), ('Kribi'), ('Ebolowa'), ('Garoua') on conflict do nothing;
insert into public.categories (name, slug) values ('Cameroonian', 'cameroonian'), ('Fast Food', 'fast-food'), ('Grills & Suya', 'grills'), ('Seafood', 'seafood'), ('Drinks', 'drinks'), ('Desserts', 'desserts') on conflict do nothing;

create table if not exists public.restaurant_staff (restaurant_id uuid references public.restaurants(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, primary key (restaurant_id, user_id));
alter table public.profiles enable row level security; alter table public.cities enable row level security; alter table public.categories enable row level security; alter table public.restaurants enable row level security; alter table public.restaurant_locations enable row level security; alter table public.dishes enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.reservations enable row level security; alter table public.reviews enable row level security; alter table public.favorites enable row level security; alter table public.subscriptions enable row level security; alter table public.notifications enable row level security; alter table public.restaurant_staff enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create or replace function public.owns_restaurant(target uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.restaurants where id = target and owner_id = auth.uid()) or exists(select 1 from public.restaurant_staff where restaurant_id = target and user_id = auth.uid()); $$;
create policy "public reads approved restaurants" on public.restaurants for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "owners create restaurants" on public.restaurants for insert with check (owner_id = auth.uid()); create policy "owners update restaurants" on public.restaurants for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "public reads restaurant locations" on public.restaurant_locations for select using (exists(select 1 from public.restaurants r where r.id = restaurant_id and (r.status = 'approved' or r.owner_id = auth.uid() or public.is_admin())));
create policy "public reads available dishes" on public.dishes for select using (is_available = true or public.owns_restaurant(restaurant_id) or public.is_admin());
create policy "users manage own profile" on public.profiles for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "public reads reference data" on public.cities for select using (true); create policy "public reads categories" on public.categories for select using (true);
create policy "customers create reservations" on public.reservations for insert with check (customer_id = auth.uid()); create policy "reservation participants read" on public.reservations for select using (customer_id = auth.uid() or public.owns_restaurant(restaurant_id) or public.is_admin()); create policy "restaurant manages reservations" on public.reservations for update using (public.owns_restaurant(restaurant_id) or public.is_admin());
create policy "customers create orders" on public.orders for insert with check (customer_id = auth.uid()); create policy "order participants read" on public.orders for select using (customer_id = auth.uid() or public.owns_restaurant(restaurant_id) or public.is_admin()); create policy "restaurant updates orders" on public.orders for update using (public.owns_restaurant(restaurant_id) or public.is_admin());
create policy "customers manage order items" on public.order_items for all using (exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())) with check (exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "customers manage favorites" on public.favorites for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "public reads reviews" on public.reviews for select using (true); create policy "customers create reviews" on public.reviews for insert with check (customer_id = auth.uid());
