# CAMUS Marketplace - Implementation Guide

## Overview

This document provides a comprehensive overview of the CAMUS restaurant marketplace platform upgrade. The system has been rebuilt from the ground up with proper authentication, real data loading from Supabase, and role-based access control.

## Architecture Summary

### Core Modules Created

#### 1. **Authentication Module** (`js/auth.js`)
- Handles user authentication with Supabase Auth
- Manages session persistence
- Enforces role-based access control (customer, restaurant_owner, admin)
- Provides user profile management
- Global instance: `window.camusAuth`

**Key Methods:**
- `init()` - Initialize authentication
- `signup(email, password, name, phone)` - Create new account
- `login(email, password)` - Sign in
- `logout()` - Sign out
- `isAuthenticated()` - Check auth status
- `hasRole(role)` - Check user role
- `requireAuth(allowedRoles)` - Protect pages

#### 2. **Marketplace Module** (`js/marketplace.js`)
- Loads restaurants, dishes, cities, and categories from Supabase
- Provides filtering and search functionality
- Manages marketplace data across the application
- Global instance: `window.camusMarketplace`

**Key Methods:**
- `loadRestaurants(city, searchTerm)` - Get restaurants
- `loadDishes(filters)` - Get dishes with filters
- `getRestaurant(id)` - Get single restaurant details
- `getRestaurantMenu(restaurantId)` - Get menu by category
- `search(searchTerm)` - Search across restaurants and dishes
- `getFeaturedRestaurants()` - Get featured listings
- `getPopularDishes()` - Get trending dishes

#### 3. **Cart & Orders Module** (`js/orders.js`)
- Manages shopping cart (localStorage-based)
- Handles order creation and tracking
- Provides order history and status management
- Global instances: `window.camusCart`, `window.camusOrders`

**Key Classes:**
- `CAMUSCart` - Shopping cart management
  - `addItem(dishId, name, price, quantity)`
  - `updateQuantity(dishId, quantity)`
  - `removeItem(dishId)`
  - `getTotal(deliveryFee)`
  
- `CAMUSOrders` - Order management
  - `createOrder(orderData)` - Place new order
  - `getCustomerOrders()` - Fetch customer's orders
  - `getRestaurantOrders(restaurantId)` - Fetch restaurant's orders
  - `updateOrderStatus(orderId, status)` - Update order status

#### 4. **Page-Specific Modules**

| Page | Module | Purpose |
|------|--------|---------|
| `index.html` | `js/index.js` | Homepage with marketplace discovery |
| `menu.html` | `js/menu.js` | Dish discovery and filtering |
| `restaurant-profile.html` | `js/restaurant-profile.js` | Individual restaurant details |
| `checkout.html` | `js/checkout.js` | Cart review and order placement |
| `account.html` | `js/account.js` | User profile and order history |
| `reservations.html` | `js/reservations.js` | Reservation booking |
| `restaurant.html` | `js/restaurant-registration.js` | Restaurant registration |
| `dashboard.html` | `js/dashboard.js` | Restaurant owner dashboard |
| `admin.html` | `js/admin.js` | Admin control panel |

## Integration Checklist

### HTML Files to Update

Each HTML file needs to include the proper script tags. Example structure:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase.js"></script>
<script src="js/auth.js"></script>
<script src="js/marketplace.js"></script>
<script src="js/orders.js"></script>
<script src="js/[PAGE_NAME].js"></script>
```

### Files Needing Update

1. ✅ **index.html** - Updated with new structure and script tags
2. ⏳ **menu.html** - Needs script includes and filter elements
3. ⏳ **restaurant-profile.html** - Needs ID parameter handling
4. ⏳ **checkout.html** - Needs proper form structure
5. ⏳ **account.html** - Needs content section for account data
6. ⏳ **reservations.html** - Needs form container
7. ⏳ **restaurant.html** - Needs registration form container
8. ⏳ **dashboard.html** - Needs dashboard content area
9. ⏳ **admin.html** - Needs admin content area
10. ⏳ **login.html** - Already has auth scripts
11. ⏳ **about.html** - No changes needed
12. ⏳ **catering.html** - Can be implemented later
13. ⏳ **deliveries.html** - Can be implemented later

### Database Setup

The Supabase schema (supabase/schema.sql) is already comprehensive and includes all necessary tables:

**Tables Implemented:**
- `profiles` - User profiles with roles
- `restaurants` - Restaurant information
- `restaurant_locations` - Restaurant location details
- `dishes` - Menu items
- `categories` - Dish categories
- `orders` - Customer orders
- `order_items` - Order line items
- `reservations` - Restaurant reservations
- `reviews` - Restaurant/dish reviews
- `favorites` - Saved restaurants/dishes
- `subscriptions` - Restaurant subscriptions
- `payments` - Payment records
- `notifications` - User notifications
- `cities` - Supported cities
- `restaurant_staff` - Staff management

**Initial Data to Load:**
Before the platform can function, seed data is needed:

```sql
-- Add cities
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

-- Add categories
INSERT INTO categories (name, slug, description) VALUES
('Cameroonian', 'cameroonian', 'Traditional Cameroonian cuisine'),
('Fast Food', 'fast-food', 'Quick meals'),
('Grills & Suya', 'grills', 'Grilled and smoked meats'),
('Seafood', 'seafood', 'Fresh seafood dishes'),
('Drinks', 'drinks', 'Beverages and juices'),
('Breakfast', 'breakfast', 'Morning meals'),
('Desserts', 'desserts', 'Sweet treats'),
('Vegetarian', 'vegetarian', 'Meat-free options');
```

## Feature Implementation Status

### Completed ✅
- [x] User authentication (Supabase Auth)
- [x] Role-based access control (customer, owner, admin)
- [x] Restaurant discovery and listing
- [x] Dish discovery with filtering
- [x] Shopping cart system
- [x] Order creation and tracking
- [x] Reservation booking system
- [x] Restaurant owner dashboard
- [x] Admin control panel
- [x] User account page
- [x] Restaurant registration flow

### Partially Implemented ⏳
- [ ] HTML page structure updates (forms, containers)
- [ ] CSS styling for new components
- [ ] File upload for images (restaurant logos, dishes)
- [ ] Advanced analytics for restaurants
- [ ] Review and rating system (database ready, UI needs work)
- [ ] Favorites system (database ready, UI needs work)
- [ ] Push notifications
- [ ] Email notifications

### Not Yet Implemented 🔜
- [ ] Payment integration (Stripe, MTN Mobile Money, etc.)
- [ ] Real-time order tracking via geolocation
- [ ] Live chat support
- [ ] Advanced reporting and analytics
- [ ] Catering system (database design ready)
- [ ] API documentation
- [ ] Mobile app
- [ ] SEO optimization
- [ ] Multi-language support

## Security Notes

### Current Implementation
- ✅ Row Level Security (RLS) policies defined in schema
- ✅ Supabase Auth for secure authentication
- ✅ Role-based access control enforced at UI level
- ✅ No hardcoded API keys in frontend
- ✅ Published Supabase key for frontend use only

### Recommended Improvements
1. Implement Supabase RLS policies (policies are defined but need verification)
2. Add CSRF protection
3. Add rate limiting
4. Implement API rate limiting for orders
5. Add input validation and sanitization
6. Implement audit logging
7. Add two-factor authentication option

## Testing Checklist

### Authentication Tests
- [ ] Sign up new account
- [ ] Log in with credentials
- [ ] Log out
- [ ] Session persistence across pages
- [ ] Protected page redirects
- [ ] Role-based page access

### Marketplace Tests
- [ ] Load restaurants on homepage
- [ ] Search restaurants
- [ ] Filter by city
- [ ] Load dishes on menu page
- [ ] Search dishes
- [ ] Filter dishes by category, price, city
- [ ] View restaurant profile
- [ ] Load restaurant menu

### Cart & Checkout Tests
- [ ] Add dish to cart
- [ ] Update quantity
- [ ] Remove item
- [ ] Cart persistence
- [ ] Checkout form validation
- [ ] Order creation
- [ ] Order confirmation

### Restaurant Owner Tests
- [ ] Dashboard loads for owner
- [ ] View today's orders
- [ ] Update order status
- [ ] View reservations
- [ ] Manage menu (when implemented)
- [ ] Edit restaurant profile (when implemented)

### Admin Tests
- [ ] Admin dashboard loads
- [ ] View restaurants list
- [ ] Approve/reject pending restaurants
- [ ] View users
- [ ] View orders
- [ ] Platform statistics

## Common Integration Tasks

### Adding Script Tags to HTML Files

**Template:**
```html
<head>
  <!-- ... existing head content ... -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- ... page content ... -->
  
  <!-- Scripts in order -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/marketplace.js"></script>
  <script src="js/orders.js"></script>
  <script src="js/[PAGE_MODULE].js"></script>
</body>
```

### Adding Required HTML Elements

**Menu.html:**
```html
<div id="dishGrid" class="restaurant-grid dish-grid">
  <!-- dishes render here -->
</div>

<!-- Filters -->
<select id="categoryFilter"></select>
<select id="cityFilter"></select>
<input type="number" id="minPrice">
<input type="number" id="maxPrice">
```

**Restaurant Profile:**
```html
<div class="restaurant-header"></div>
<section id="menuSection"></section>
<section id="reviewsSection"></section>
```

**Checkout:**
```html
<div id="cartItems"></div>
<div id="orderSummary"></div>
```

**Account:**
```html
<div id="accountSection"></div>
```

**Dashboard:**
```html
<div id="dashboardContent"></div>
```

**Admin:**
```html
<div id="adminContent"></div>
```

**Reservations:**
```html
<div id="reservationForm"></div>
```

**Restaurant Registration:**
```html
<div id="restaurantRegistrationForm"></div>
```

## Data Flow Examples

### Complete Order Flow
1. User browses restaurants → `marketplace.loadRestaurants()`
2. Clicks restaurant → loads `restaurant-profile.js`
3. Adds dish to cart → `cart.addItem()`
4. Goes to checkout → `checkout.init()` loads user profile
5. Fills delivery info and places order → `orders.createOrder()`
6. Order saved to Supabase
7. Restaurant notified via dashboard

### Restaurant Owner Flow
1. Non-owner registers → `restaurant-registration.js`
2. Submitted restaurant status: `pending`
3. Admin approves → status: `approved`
4. Owner logs in → redirected to `dashboard.html`
5. Views orders → `orders.getRestaurantOrders()`
6. Updates order status → `orders.updateOrderStatus()`

## Performance Considerations

### Optimizations Implemented
- ✅ Lazy loading of restaurants and dishes
- ✅ Client-side filtering (reduces server calls)
- ✅ Event delegation for dynamic elements
- ✅ Promises for parallel data loading
- ✅ localStorage for cart persistence

### Future Optimizations
- [ ] Implement pagination for large result sets
- [ ] Add request caching
- [ ] Implement lazy loading for images
- [ ] Use service workers for offline support
- [ ] Implement virtual scrolling for large lists

## Troubleshooting

### Common Issues

**"Supabase client not available"**
- Check that `js/supabase.js` loads before other modules
- Verify SUPABASE_URL and SUPABASE_KEY in `js/supabase.js`
- Check browser console for CDN errors

**"User not authenticated"**
- Ensure `window.camusAuth.init()` completes before using auth
- Check that auth state changes are being listened to
- Verify Supabase Auth is enabled in project

**"No restaurants showing"**
- Check that seed data exists in restaurants table
- Verify restaurants have `status: 'approved'` and `is_active: true`
- Check browser console for API errors

**"Order creation fails"**
- Verify user is authenticated
- Check that cart is not empty
- Verify restaurant ID is valid
- Check Supabase RLS policies for orders table

## Next Steps for Completion

### Priority 1 (Critical)
1. Update all HTML files with proper script includes
2. Add required HTML elements/containers to each page
3. Seed initial database data (cities, categories, sample restaurants)
4. Test authentication flow end-to-end
5. Test marketplace discovery flow end-to-end

### Priority 2 (High)
1. Implement image upload for restaurants and dishes
2. Implement review/rating system UI
3. Implement favorites system UI
4. Add form validation on all forms
5. Add loading states and error messages

### Priority 3 (Medium)
1. Implement payment system integration
2. Add email notifications
3. Implement catering system
4. Add advanced restaurant analytics
5. Implement restaurant menu management

### Priority 4 (Nice to Have)
1. Multi-language support
2. Advanced geolocation features
3. Real-time order tracking
4. Live chat support
5. API documentation for partners

## File Summary

### JavaScript Modules (Implemented)
- `js/supabase.js` - Supabase configuration (existing)
- `js/app.js` - Legacy app file (to be deprecated)
- `js/auth.js` - Authentication system [NEW]
- `js/marketplace.js` - Marketplace data loading [NEW]
- `js/orders.js` - Cart and order management [NEW]
- `js/index.js` - Homepage functionality [NEW]
- `js/menu.js` - Dish discovery [NEW]
- `js/restaurant-profile.js` - Restaurant details [NEW]
- `js/checkout.js` - Order checkout [NEW]
- `js/account.js` - User account management [NEW]
- `js/reservations.js` - Reservation booking [NEW]
- `js/restaurant-registration.js` - Restaurant registration [NEW]
- `js/dashboard.js` - Restaurant owner dashboard [NEW]
- `js/admin.js` - Admin control panel [NEW]

### CSS (Existing)
- `style.css` - Main stylesheet (needs minor additions for new components)

### HTML Files (Need Updates)
- `index.html` - Updated structure [UPDATED]
- `menu.html` - Needs form elements
- `restaurant-profile.html` - Needs containers
- `checkout.html` - Needs form elements
- `account.html` - Needs content section
- `reservations.html` - Needs form container
- `restaurant.html` - Needs form container
- `dashboard.html` - Needs content area
- `admin.html` - Needs content area
- `login.html` - Already configured
- Other pages - No changes needed

### Database (Existing)
- `supabase/schema.sql` - Complete schema [VERIFIED]

## Support

For questions or issues with the implementation:
1. Check the troubleshooting section above
2. Review module documentation in each JS file
3. Check Supabase dashboard for data and RLS policies
4. Review browser console for JavaScript errors
5. Verify all script tags are in correct order

---

**Last Updated:** 2026
**Version:** 1.0.0
**Status:** Ready for Integration
