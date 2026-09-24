# CAMUS Database Seeding & Setup Guide

## Overview

Before the CAMUS marketplace can function, the Supabase database needs to be populated with essential data. This guide walks through setting up cities, categories, and sample restaurant data.

## Prerequisites

- Supabase account and project created
- Database schema imported (run `supabase/schema.sql`)
- Access to Supabase SQL Editor

## Step 1: Add Cities

These are the primary service areas for CAMUS.

```sql
-- Insert Cameroon cities
INSERT INTO cities (name, region, country) VALUES
('Yaoundé', 'Center', 'Cameroon'),
('Douala', 'Littoral', 'Cameroon'),
('Buea', 'Southwest', 'Cameroon'),
('Bamenda', 'Northwest', 'Cameroon'),
('Bafoussam', 'West', 'Cameroon'),
('Limbe', 'Southwest', 'Cameroon'),
('Kribi', 'South', 'Cameroon'),
('Ebolowa', 'South', 'Cameroon'),
('Garoua', 'North', 'Cameroon');

-- Verify insertion
SELECT COUNT(*) as city_count FROM cities;
```

## Step 2: Add Food Categories

These allow customers to browse by cuisine type.

```sql
-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Cameroonian', 'cameroonian', 'Traditional Cameroonian cuisine'),
('Fast Food', 'fast-food', 'Quick meals and snacks'),
('Grills & Suya', 'grills', 'Grilled and smoked meats'),
('Seafood', 'seafood', 'Fresh fish and seafood dishes'),
('Drinks & Juices', 'drinks', 'Beverages and fresh juices'),
('Breakfast', 'breakfast', 'Morning meals and pastries'),
('Desserts', 'desserts', 'Sweet treats and pastries'),
('Vegetarian', 'vegetarian', 'Meat-free and vegan options');

-- Verify insertion
SELECT COUNT(*) as category_count FROM categories;
```

## Step 3: Create Admin User (Optional - for testing)

```sql
-- First, create a user in Supabase Auth (do this in Auth section of Supabase)
-- Then add their profile with admin role:

INSERT INTO profiles (id, email, full_name, phone, role, city)
VALUES ('ADMIN_USER_ID', 'admin@camus.cm', 'Admin User', '+237673689052', 'admin', 'Yaoundé');
```

## Step 4: Create Sample Restaurant Owner

```sql
-- Create a restaurant owner user in Supabase Auth first
-- Then add their profile:

INSERT INTO profiles (id, email, full_name, phone, role, city)
VALUES ('OWNER_USER_ID', 'owner@camus.cm', 'Owner Name', '+237670000000', 'restaurant_owner', 'Yaoundé');
```

## Step 5: Add Sample Restaurants

```sql
-- Add first sample restaurant
INSERT INTO restaurants (
  owner_id, 
  name, 
  slug, 
  description, 
  cuisine_type, 
  phone, 
  email, 
  website,
  cover_image_url,
  logo_url,
  opening_time,
  closing_time,
  is_active,
  is_featured,
  rating,
  status
) VALUES (
  'OWNER_USER_ID',
  'CAMUS Kitchen',
  'camus-kitchen',
  'Modern Cameroonian cuisine in the heart of Yaoundé. We serve authentic dishes with a contemporary twist.',
  'Cameroonian',
  '+237673689052',
  'kitchen@camus.cm',
  'https://camus.cm',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=200&q=85',
  '11:00:00',
  '22:00:00',
  true,
  true,
  4.8,
  'approved'
);

-- Add second restaurant
INSERT INTO restaurants (
  owner_id,
  name,
  slug,
  description,
  cuisine_type,
  phone,
  email,
  website,
  cover_image_url,
  logo_url,
  opening_time,
  closing_time,
  is_active,
  is_featured,
  rating,
  status
) VALUES (
  'OWNER_USER_ID',
  'La Terrasse Grill',
  'la-terrasse-grill',
  'Premium grilled meats and fresh seafood. Enjoy dinner with a view of Yaoundé.',
  'Grills & Suya',
  '+237670000000',
  'terrasse@camus.cm',
  NULL,
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=85',
  NULL,
  '12:00:00',
  '23:00:00',
  true,
  false,
  4.7,
  'approved'
);

-- Add third restaurant
INSERT INTO restaurants (
  owner_id,
  name,
  slug,
  description,
  cuisine_type,
  phone,
  email,
  cover_image_url,
  opening_time,
  closing_time,
  is_active,
  rating,
  status
) VALUES (
  'OWNER_USER_ID',
  'Fast Bite Yaoundé',
  'fast-bite-yaounde',
  'Quick, delicious fast food. Perfect for lunch breaks.',
  'Fast Food',
  '+237671000000',
  'fastbite@camus.cm',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85',
  '10:00:00',
  '21:00:00',
  true,
  4.6,
  'approved'
);

-- Verify restaurants
SELECT id, name, slug, status FROM restaurants;
```

## Step 6: Add Restaurant Locations

```sql
-- Replace RESTAURANT_ID with actual IDs from previous insert

-- CAMUS Kitchen - Bastos location
INSERT INTO restaurant_locations (restaurant_id, city, neighborhood, address, is_primary)
VALUES ((SELECT id FROM restaurants WHERE slug = 'camus-kitchen'), 'Yaoundé', 'Bastos', 'Avenue Foch, Yaoundé', true);

-- La Terrasse - Mvan location
INSERT INTO restaurant_locations (restaurant_id, city, neighborhood, address, is_primary)
VALUES ((SELECT id FROM restaurants WHERE slug = 'la-terrasse-grill'), 'Yaoundé', 'Mvan', 'Rue Bamiléké, Yaoundé', true);

-- Fast Bite - Nlongkak location
INSERT INTO restaurant_locations (restaurant_id, city, neighborhood, address, is_primary)
VALUES ((SELECT id FROM restaurants WHERE slug = 'fast-bite-yaounde'), 'Yaoundé', 'Nlongkak', 'Avenue de la Libération, Yaoundé', true);

-- Verify locations
SELECT r.name, rl.city, rl.neighborhood FROM restaurant_locations rl
JOIN restaurants r ON r.id = rl.restaurant_id;
```

## Step 7: Add Sample Dishes

```sql
-- Replace RESTAURANT_ID with actual restaurant IDs

-- CAMUS Kitchen dishes
INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'camus-kitchen'),
  'Ndolé with Fufu',
  'Traditional Cameroon bitter leaves with cassava fufu',
  3500,
  (SELECT id FROM categories WHERE slug = 'cameroonian'),
  true,
  4.9
);

INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'camus-kitchen'),
  'Eru & Fufu',
  'Water fufu with traditional Cameroon spinach',
  3000,
  (SELECT id FROM categories WHERE slug = 'cameroonian'),
  true,
  4.8
);

INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'camus-kitchen'),
  'Poulet DG',
  'Fried chicken with plantains and vegetables',
  4500,
  (SELECT id FROM categories WHERE slug = 'cameroonian'),
  true,
  4.9
);

-- La Terrasse dishes
INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'la-terrasse-grill'),
  'Mixed Grill',
  'Beef, chicken, and suya with grilled vegetables',
  6500,
  (SELECT id FROM categories WHERE slug = 'grills'),
  true,
  4.8
);

INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'la-terrasse-grill'),
  'Grilled Fish',
  'Fresh whole tilapia grilled with herbs',
  5500,
  (SELECT id FROM categories WHERE slug = 'seafood'),
  true,
  4.7
);

-- Fast Bite dishes
INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'fast-bite-yaounde'),
  'Chicken Burger',
  'Crispy fried chicken burger with special sauce',
  2500,
  (SELECT id FROM categories WHERE slug = 'fast-food'),
  true,
  4.6
);

INSERT INTO dishes (restaurant_id, name, description, price, category_id, is_available, rating)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'fast-bite-yaounde'),
  'Fries with Dip',
  'Crispy golden fries with choice of dip',
  1500,
  (SELECT id FROM categories WHERE slug = 'fast-food'),
  true,
  4.5
);

-- Verify dishes
SELECT r.name, d.name, d.price FROM dishes d
JOIN restaurants r ON r.id = d.restaurant_id;
```

## Step 8: Create Test Customer Profile (Optional)

```sql
-- First create customer user in Supabase Auth
-- Then add profile:

INSERT INTO profiles (id, email, full_name, phone, role, city)
VALUES ('CUSTOMER_USER_ID', 'customer@test.cm', 'Test Customer', '+237670000001', 'customer', 'Yaoundé');
```

## Verification Queries

Run these to verify your data is correct:

```sql
-- Count all data
SELECT 
  (SELECT COUNT(*) FROM cities) as cities,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM restaurants) as restaurants,
  (SELECT COUNT(*) FROM restaurant_locations) as locations,
  (SELECT COUNT(*) FROM dishes) as dishes;

-- Check restaurants are approved and active
SELECT name, status, is_active FROM restaurants WHERE is_active = true;

-- Check all dishes are linked to restaurants
SELECT r.name, COUNT(d.id) as dish_count 
FROM restaurants r
LEFT JOIN dishes d ON d.restaurant_id = r.id
GROUP BY r.id, r.name;

-- Check locations by city
SELECT city, COUNT(*) as location_count 
FROM restaurant_locations 
GROUP BY city;
```

## Troubleshooting

### Error: "Owner user not found"
- Make sure you created the user in Supabase Auth first
- Copy the user ID from the Auth section and use it in the INSERT statement

### Error: "Foreign key constraint violation"
- Make sure cities and categories exist before creating restaurants
- Make sure restaurants exist before creating locations and dishes

### Error: "Duplicate entry"
- This is okay if you run the script twice - data is already there
- To reset: Delete restaurants first (cascades to locations/dishes), then re-run

### Data not showing in app
- Verify restaurants have `status = 'approved'` and `is_active = true`
- Check `restaurant_locations` has at least one entry per restaurant
- Verify categories match the ones used in dishes table

## Clearing Data (if needed)

**WARNING: This deletes everything!**

```sql
-- Delete in correct order (respecting foreign keys)
DELETE FROM dish_reviews;
DELETE FROM dishes;
DELETE FROM restaurant_locations;
DELETE FROM reservations;
DELETE FROM favorites;
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM subscriptions;
DELETE FROM payments;
DELETE FROM notifications;
DELETE FROM restaurant_staff;
DELETE FROM restaurants;
DELETE FROM profiles WHERE role != 'admin';
DELETE FROM categories;
DELETE FROM cities;
```

## Next Steps

1. Run all INSERT statements above in Supabase SQL Editor
2. Run verification queries to confirm data
3. Test the marketplace in your app:
   - Go to index.html and verify restaurants show
   - Go to menu.html and verify dishes show
   - Go to restaurant-profile.html?id=[restaurant-id] and verify details
4. Test authentication:
   - Sign up with new account
   - Log in with test account
   - Verify profiles are created
5. Test ordering flow:
   - Add dishes to cart
   - Go to checkout
   - Create an order

## Production Setup

For production:

1. **More Restaurants**: Add 20-50 restaurants to make marketplace feel active
2. **More Cities**: Add Douala, Buea, Bamenda (use scripts above)
3. **Backup**: Set up automated backups in Supabase
4. **Monitoring**: Enable database logging
5. **RLS Policies**: Verify Row Level Security is enabled
6. **Performance**: Add indexes for common queries (already in schema.sql)

## Advanced: Bulk Import

For large datasets, you can use CSV import in Supabase:

1. Prepare CSV files matching table structure
2. Go to Supabase Dashboard → SQL Editor
3. Use COPY command:

```sql
COPY cities(name, region, country) FROM STDIN WITH CSV;
Yaoundé,Center,Cameroon
Douala,Littoral,Cameroon
\.
```

---

**Status:** Ready to seed
**Last Updated:** Current
**Next:** Run these queries in Supabase SQL Editor
