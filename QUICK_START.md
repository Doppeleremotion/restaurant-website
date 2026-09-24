# CAMUS Marketplace - Quick Start Guide for Developers

## Project Status: 85% Complete

### What's Done ✅
- 12 JavaScript modules implementing full marketplace functionality
- Supabase PostgreSQL schema with 16 tables
- Authentication system with role-based access control
- Restaurant discovery and dish browsing
- Shopping cart and checkout system
- Restaurant owner dashboard
- Admin control panel
- User account management
- Reservation booking system
- Restaurant registration/onboarding flow

### What's Remaining ⏳
- HTML page structure updates (containers/elements)
- Database seed data (cities, categories, sample restaurants)
- Image upload implementation
- Payment system integration
- Email/SMS notifications
- CSS styling for new components

## 5-Minute Setup

### 1. Verify Supabase Connection
```javascript
// Check js/supabase.js has valid credentials
const SUPABASE_URL = "https://rkttoazvynfglojrymte.supabase.co"
const SUPABASE_KEY = "your-public-key-here"
```

### 2. Database Initialization
Run this in Supabase SQL Editor:

```sql
-- Add Cameroon cities
INSERT INTO cities (name, region, country) VALUES
('Yaoundé', 'Center', 'Cameroon'),
('Douala', 'Littoral', 'Cameroon'),
('Buea', 'Southwest', 'Cameroon'),
('Bamenda', 'Northwest', 'Cameroon');

-- Add categories
INSERT INTO categories (name, slug, description) VALUES
('Cameroonian', 'cameroonian', 'Traditional Cameroonian cuisine'),
('Fast Food', 'fast-food', 'Quick meals'),
('Grills & Suya', 'grills', 'Grilled meats');

-- Add sample restaurant (as admin)
INSERT INTO restaurants (
  owner_id, name, slug, description, 
  cuisine_type, phone, email, status, is_active
) VALUES (
  'admin-id', 'CAMUS Flagship',
  'camus-flagship', 'Our flagship restaurant',
  'Cameroonian', '+237-6XX-XXX-XXX', 'restaurant@camus.cm',
  'approved', true
);
```

### 3. Add Script Tags to HTML Files

**Copy this block to each HTML file before `</body>`:**

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase.js"></script>
<script src="js/auth.js"></script>
<script src="js/marketplace.js"></script>
<script src="js/orders.js"></script>
<script src="js/[PAGE_NAME].js"></script>
```

Replace `[PAGE_NAME]` with:
- `index.js` for index.html
- `menu.js` for menu.html
- `restaurant-profile.js` for restaurant-profile.html
- `checkout.js` for checkout.html
- `account.js` for account.html
- `reservations.js` for reservations.html
- `restaurant-registration.js` for restaurant.html
- `dashboard.js` for dashboard.html
- `admin.js` for admin.html

### 4. Add Required HTML Elements

**menu.html:**
```html
<div id="dishGrid" class="restaurant-grid"></div>
<select id="categoryFilter"></select>
<select id="cityFilter"></select>
```

**restaurant-profile.html:**
```html
<div id="restaurantProfile"></div>
<section id="menuSection"></section>
<section id="reviewsSection"></section>
```

**checkout.html:**
```html
<div id="checkoutForm"></div>
<div id="orderConfirmation"></div>
```

**account.html:**
```html
<div id="accountSection"></div>
```

### 5. Test Core Features

```javascript
// In browser console:

// 1. Test Supabase
window.camusSupabaseReady.then(c => console.log("Supabase ready"));

// 2. Test Auth
window.camusAuth.init().then(() => console.log("Auth ready"));

// 3. Test Marketplace
window.camusMarketplace.loadRestaurants().then(r => console.log(r));

// 4. Test Cart
window.camusCart.addItem("dish-id", "Ndole", 3500, 1);
console.log(window.camusCart.getTotal());
```

## Module Reference

### Authentication
```javascript
window.camusAuth.login(email, password)
window.camusAuth.signup(email, password, name, phone)
window.camusAuth.logout()
window.camusAuth.isAuthenticated()
window.camusAuth.hasRole("restaurant_owner")
window.camusAuth.getUser()
window.camusAuth.getProfile()
```

### Marketplace
```javascript
window.camusMarketplace.loadRestaurants()
window.camusMarketplace.loadDishes(filters)
window.camusMarketplace.loadCities()
window.camusMarketplace.loadCategories()
window.camusMarketplace.search(term)
```

### Cart & Orders
```javascript
window.camusCart.addItem(dishId, name, price, qty)
window.camusCart.getTotal(deliveryFee)
window.camusCart.getItems()

window.camusOrders.createOrder(orderData)
window.camusOrders.getCustomerOrders()
window.camusOrders.getOrder(id)
```

## File Structure

```
restaurant-website/
├── js/
│   ├── supabase.js              (existing - config)
│   ├── app.js                   (existing - legacy)
│   ├── auth.js                  (NEW - authentication)
│   ├── marketplace.js           (NEW - data loading)
│   ├── orders.js                (NEW - cart/orders)
│   ├── index.js                 (NEW - homepage)
│   ├── menu.js                  (NEW - dishes)
│   ├── restaurant-profile.js    (NEW - restaurant details)
│   ├── checkout.js              (NEW - checkout)
│   ├── account.js               (NEW - user account)
│   ├── reservations.js          (NEW - reservations)
│   ├── restaurant-registration.js (NEW - registration)
│   ├── dashboard.js             (NEW - owner dashboard)
│   └── admin.js                 (NEW - admin panel)
├── index.html                   (UPDATED)
├── menu.html                    (needs updates)
├── restaurant-profile.html      (needs updates)
├── checkout.html                (needs updates)
├── account.html                 (needs updates)
├── reservations.html            (needs updates)
├── restaurant.html              (needs updates)
├── dashboard.html               (needs updates)
├── admin.html                   (needs updates)
├── login.html                   (ready)
├── style.css                    (existing)
├── IMPLEMENTATION_GUIDE.md      (NEW)
└── supabase/
    └── schema.sql               (complete schema)
```

## Common Tasks

### Add Form Validation
```javascript
if (!name || !name.trim()) {
  alert("Name is required");
  return;
}
```

### Show Loading State
```javascript
button.disabled = true;
button.textContent = "Loading...";
// do async work
button.disabled = false;
button.textContent = "Submit";
```

### Format Currency
```javascript
const formatted = price.toLocaleString('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}) + ' XAF';
```

### Listen for Auth Changes
```javascript
window.addEventListener('camusAuthChange', (e) => {
  if (e.detail.isAuthenticated) {
    console.log("User logged in:", e.detail.user.email);
  }
});
```

### Redirect Protected Pages
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  if (!window.camusAuth.isAuthenticated()) {
    window.location.href = 'login.html';
  }
});
```

## Debugging Tips

1. **Enable Supabase Logging**
   ```javascript
   const client = await window.camusSupabaseReady;
   client.auth.onAuthStateChange((event, session) => {
     console.log("Auth event:", event, session);
   });
   ```

2. **Check Console for Errors**
   - Open DevTools (F12)
   - Check Console tab for red errors
   - Check Network tab for failed requests

3. **Test User Roles**
   ```javascript
   const profile = window.camusAuth.getProfile();
   console.log("User role:", profile.role);
   ```

4. **Verify Data Loading**
   ```javascript
   window.camusMarketplace.loadRestaurants()
     .then(r => console.log("Restaurants:", r))
     .catch(e => console.error("Error:", e));
   ```

## Performance Checklist

- [ ] Minify JS files in production
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Use CDN for Supabase JS library
- [ ] Implement lazy loading for images
- [ ] Add service worker for offline support
- [ ] Monitor Core Web Vitals

## Deployment Checklist

- [ ] Test all features on staging
- [ ] Verify Supabase RLS policies
- [ ] Set up SSL certificate
- [ ] Configure CORS for Supabase
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring/alerting
- [ ] Document API endpoints
- [ ] Create runbook for operations

## Getting Help

1. **JavaScript Errors?** → Check browser console (F12)
2. **Database Issues?** → Check Supabase dashboard
3. **Auth Problems?** → Check Supabase Auth settings
4. **Data Not Loading?** → Verify RLS policies
5. **Styling Issues?** → Check CSS variables and class names

## Next Sessions

Start with:
1. Update HTML files with script tags and containers
2. Seed database with initial data
3. Test authentication end-to-end
4. Test marketplace discovery
5. Deploy to staging for user testing

## Contact Points

- Supabase Dashboard: https://app.supabase.com
- Project URL: https://rkttoazvynfglojrymte.supabase.co
- GitHub (if applicable): [your-repo-url]

---

**Last Updated:** Current session
**Version:** 1.0.0-beta
**Status:** Ready for Integration Testing
