# CAMUS Marketplace - Testing & Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All modules created (12 JavaScript files)
- [x] All HTML pages updated with script tags
- [x] All required containers added to HTML
- [x] Geolocation service integrated
- [x] Error handling implemented
- [x] Inline documentation added
- [x] No console errors expected
- [x] Code reviewed for security

### ✅ Database Setup
- [ ] Supabase project created
- [ ] Schema imported (supabase/schema.sql)
- [ ] Cities added (9 Cameroon cities)
- [ ] Categories added (8 food types)
- [ ] Sample restaurants added (3-5)
- [ ] Sample dishes added (10+)
- [ ] Restaurant locations linked
- [ ] Test user profiles created
- [ ] RLS policies enabled

### ✅ Frontend Integration
- [x] index.html - Updated with real data loading ✅
- [x] menu.html - Dish discovery with filters ✅
- [x] restaurant-profile.html - Dynamic restaurant details ✅
- [x] checkout.html - Order placement flow ✅
- [x] account.html - User profile & history ✅
- [x] reservations.html - Booking system ✅
- [x] restaurant.html - Owner registration ✅
- [x] dashboard.html - Owner management ✅
- [x] admin.html - Admin control panel ✅
- [x] login.html - Authentication ✅

### ✅ Features
- [x] Authentication (signup/login/logout)
- [x] Marketplace discovery (browse, search, filter)
- [x] Geolocation detection & auto-filter
- [x] Restaurant profiles with menus
- [x] Shopping cart (add/remove items)
- [x] Checkout & order placement
- [x] Order tracking & history
- [x] Reservations booking
- [x] Restaurant owner dashboard
- [x] Admin control panel
- [x] User account management

---

## Phase 1: Local Testing (Development)

### 1.1 Setup & Database

```bash
# 1. Seed the database
# - Go to Supabase SQL Editor
# - Copy/paste queries from DATABASE_SEEDING.md
# - Run all INSERT statements
# - Verify with SELECT COUNT(*) queries
```

**Expected Result:**
- 9 cities in database
- 8 categories in database
- 3-5 sample restaurants
- 10+ sample dishes
- All verified with COUNT queries

### 1.2 Test Authentication

**Test Case 1.2.1: Signup**
1. Open `login.html`
2. Click "Create an account"
3. Enter email: `test@camus.cm`
4. Enter password: `Test1234!`
5. Enter name: `Test User`
6. Enter phone: `+237670000000`
7. Click "Sign up"
8. **Expected:** Redirect to index.html, logged in

**Test Case 1.2.2: Login**
1. Click "Log out"
2. On login page, enter email: `test@camus.cm`
3. Enter password: `Test1234!`
4. Click "Sign in"
5. **Expected:** Redirect to index.html, logged in

**Test Case 1.2.3: Session Persistence**
1. Logged in to index.html
2. Refresh page (F5)
3. **Expected:** Still logged in, no redirect to login

**Test Case 1.2.4: Page Protection**
1. Log out
2. Try to visit `dashboard.html`
3. **Expected:** Redirect to login.html

### 1.3 Test Marketplace Discovery

**Test Case 1.3.1: Homepage Load**
1. Go to `index.html`
2. Wait for page to load
3. **Expected:**
   - Restaurants visible in grid
   - City filter buttons show
   - "Use My Location" button visible
   - Search works
   - No console errors

**Test Case 1.3.2: Geolocation**
1. On index.html, grant location permission when browser asks
2. Button should show "📍 Detecting..."
3. After 2-3 seconds, should show "📍 [City Name]"
4. **Expected:** Restaurants filtered to detected city

**Test Case 1.3.3: City Filter**
1. Click different city button
2. Restaurant grid updates
3. **Expected:** Only shows restaurants in selected city

**Test Case 1.3.4: Search**
1. Click search box
2. Type "Ndolé"
3. Click search button
4. **Expected:** Shows restaurants/dishes containing "Ndolé"

### 1.4 Test Dish Discovery

**Test Case 1.4.1: Menu Page Load**
1. Go to `menu.html`
2. Wait for page to load
3. **Expected:**
   - Dishes visible in grid
   - Category filter populated
   - City filter populated
   - Search works
   - No console errors

**Test Case 1.4.2: Category Filter**
1. Select "Cameroonian" from category filter
2. **Expected:** Shows only Cameroonian dishes

**Test Case 1.4.3: Price Filter**
1. Set min price: 3000
2. Set max price: 5000
3. **Expected:** Shows dishes in price range

**Test Case 1.4.4: Multiple Filters**
1. Select City: Yaoundé
2. Select Category: Grills
3. Set price range: 5000-7000
4. **Expected:** Shows filtered results matching all criteria

### 1.5 Test Shopping Cart

**Test Case 1.5.1: Add to Cart**
1. On menu.html, find a dish
2. Click "Add to cart"
3. **Expected:**
   - Visual feedback (✓ Added!)
   - Cart count increases
   - Item appears in cart

**Test Case 1.5.2: Cart Persistence**
1. Add dish to cart
2. Refresh page
3. **Expected:** Item still in cart

**Test Case 1.5.3: Remove from Cart**
1. Add multiple items to cart
2. Go to checkout.html
3. Remove one item
4. **Expected:** Item removed, total updated

**Test Case 1.5.4: Quantity Update**
1. Add dish to cart
2. Change quantity
3. **Expected:** Total price updates

### 1.6 Test Checkout

**Test Case 1.6.1: Checkout Flow**
1. Add item to cart
2. Go to checkout.html (or click cart icon)
3. **Expected:** Cart summary shows
4. Select "Delivery"
5. Fill in delivery address
6. Click "Place Order"
7. **Expected:**
   - Order created in database
   - Confirmation page shows
   - Order number displayed
   - Items listed with total

**Test Case 1.6.2: Order Protection**
1. Log out
2. Try to visit checkout.html
3. **Expected:** Redirect to login.html

### 1.7 Test Restaurant Profile

**Test Case 1.7.1: View Restaurant**
1. On index.html, click restaurant card
2. **Expected:** Goes to restaurant-profile.html?id=[id]
3. Shows:
   - Restaurant name, rating, cuisine
   - Full menu by category
   - Restaurant info (hours, phone, location)

**Test Case 1.7.2: Add from Restaurant**
1. On restaurant profile, find dish
2. Click "Add to cart"
3. **Expected:** Item added, continues to cart

### 1.8 Test User Account

**Test Case 1.8.1: View Account**
1. Logged in, go to account.html
2. **Expected:**
   - Profile tab shows user info
   - Orders tab shows order history
   - Reservations tab shows reservations

**Test Case 1.8.2: Change Password**
1. On account.html, click "Change password"
2. **Expected:**
   - Alert shows password reset email
   - Check email for reset link
   - Reset password successfully

### 1.9 Test Reservations

**Test Case 1.9.1: Book Reservation**
1. Go to reservations.html
2. Select restaurant from dropdown
3. Select date, time, number of guests
4. Enter name and phone
5. Click "Request Reservation"
6. **Expected:**
   - Confirmation shown
   - Reservation saved to database
   - Shows pending status

**Test Case 1.9.2: View Reservations**
1. Go to account.html
2. Click "Reservations" tab
3. **Expected:** Shows booked reservations with status

### 1.10 Test Restaurant Owner Features

**Test Case 1.10.1: Owner Dashboard Access**
1. Sign up with restaurant owner role (admin-created)
2. Go to dashboard.html
3. **Expected:** Shows owner dashboard
4. Displays:
   - Today's revenue
   - Today's orders
   - Pending reservations

**Test Case 1.10.2: Order Management**
1. On dashboard, see today's orders
2. Click order to expand
3. Select new status (e.g., "preparing")
4. **Expected:** Status updates

### 1.11 Test Admin Features

**Test Case 1.11.1: Admin Access**
1. Sign in as admin user
2. Go to admin.html
3. **Expected:** Shows admin panel
4. Displays:
   - Platform statistics
   - Restaurant list

**Test Case 1.11.2: Approve Restaurant**
1. On admin panel, find pending restaurant
2. Click "Approve"
3. **Expected:**
   - Status changes to "approved"
   - Restaurant becomes active
   - Owner can now use dashboard

### 1.12 Test Restaurant Registration

**Test Case 1.12.1: Register as Owner**
1. Sign up or log in as customer
2. Go to restaurant.html
3. Click option to become restaurant owner
4. Fill registration form:
   - Restaurant name
   - Cuisine type
   - Address
   - City
   - Phone
   - Email
5. Click "Submit Application"
6. **Expected:**
   - Confirmation page shown
   - Status shows "Pending Approval"
   - Data saved to database with status='pending'

### 1.13 Mobile Responsiveness

**Test Case 1.13.1: Mobile Layout**
1. Open Chrome DevTools (F12)
2. Click device toggle
3. Select "iPhone 12"
4. Test all pages:
   - Homepage: All elements visible, readable
   - Menu: Filters stack properly
   - Checkout: Form fills width
   - Account: Tabs switch correctly
5. **Expected:** No horizontal scrolling, touch-friendly

**Test Case 1.13.2: Geolocation on Mobile**
1. On mobile device, go to index.html
2. Click "Use My Location"
3. Grant location permission
4. **Expected:** Detects location, filters restaurants

---

## Phase 2: Staging Deployment

### 2.1 Pre-Deployment Checks

```bash
# 1. Verify all files present
# - Check all JS modules exist
# - Check all HTML files have script tags
# - Check style.css loads correctly

# 2. Database backup
# - Export database from Supabase
# - Keep backup before deploying

# 3. SSL certificate
# - Ensure HTTPS is enabled
# - Geolocation requires HTTPS
```

### 2.2 Deployment Steps

1. **Upload to staging server:**
   ```bash
   # Copy all files to staging environment
   # Verify directory structure
   scp -r . user@staging-server:/var/www/camus
   ```

2. **Verify file permissions:**
   ```bash
   chmod 755 -R /var/www/camus/
   chmod 644 -R /var/www/camus/*.*
   ```

3. **Test all URLs:**
   - https://staging.camus.cm/index.html
   - https://staging.camus.cm/menu.html
   - https://staging.camus.cm/login.html
   - etc.

4. **Verify API connectivity:**
   - Test Supabase connection
   - Test geolocation API
   - Check browser console for errors

### 2.3 Staging Test Suite

Run all tests from Phase 1 on staging environment:
- Test all pages load
- Test all features work
- Test on multiple browsers
- Test on mobile devices
- Test geolocation on phone

### 2.4 Performance Testing

```bash
# Measure page load times
# Test with 10 concurrent users
# Monitor database query performance
# Check network waterfall
```

**Target Performance:**
- Page load: < 2 seconds
- API response: < 500ms
- Database queries: < 100ms
- Geolocation: < 3 seconds

---

## Phase 3: Production Deployment

### 3.1 Pre-Production Checklist

- [ ] All staging tests passed
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Database backup created
- [ ] Disaster recovery plan documented
- [ ] Support process documented
- [ ] Monitoring configured
- [ ] Error logging enabled

### 3.2 Deployment Process

1. **Database:**
   - Verify all data correct
   - Enable automated backups
   - Enable query logging

2. **Frontend:**
   - Deploy files to production
   - Set cache headers
   - Enable gzip compression
   - Enable CDN

3. **Monitoring:**
   - Enable error tracking
   - Set up alerts
   - Monitor performance
   - Track user metrics

### 3.3 Post-Deployment

1. **Verify:**
   - All pages accessible
   - Database working
   - Authentication functioning
   - Geolocation working
   - Orders processing

2. **Monitor:**
   - Watch error logs
   - Monitor performance
   - Track user signups
   - Monitor orders/revenue

3. **Support:**
   - Set up support email
   - Create help documentation
   - Train customer support team
   - Set up feedback channel

---

## Troubleshooting During Testing

### Issue: "Supabase client not available"
**Solution:**
1. Check Supabase URL and key in `js/supabase.js`
2. Verify Supabase project is active
3. Check internet connection
4. Reload page

### Issue: "Restaurants not showing"
**Solution:**
1. Verify restaurants exist in database
2. Check status = 'approved'
3. Check is_active = true
4. Run: `SELECT * FROM restaurants;`

### Issue: "Geolocation not detecting"
**Solution:**
1. Check browser permissions
2. Verify HTTPS enabled (localhost works)
3. Check browser console for errors
4. Grant permission when prompted

### Issue: "Orders not saving"
**Solution:**
1. Check user is authenticated
2. Verify cart not empty
3. Check RLS policies allow insert
4. Check database has orders table

### Issue: "Mobile not working"
**Solution:**
1. Check responsive CSS
2. Test at 375px width
3. Check touch events work
4. Verify geolocation on phone

---

## Browser Testing Matrix

| Browser | Desktop | Mobile | Geolocation |
|---------|---------|--------|-------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ (iOS 14.5+) |
| Edge | ✅ | ✅ | ✅ |
| IE 11 | ⚠️ | N/A | ❌ |

---

## Load Testing Checklist

For production readiness:

- [ ] Test with 100 concurrent users
- [ ] Verify database performance
- [ ] Monitor server resources
- [ ] Check response times
- [ ] Verify no database locks
- [ ] Test file upload limits
- [ ] Test search performance
- [ ] Test concurrent orders

---

## Security Checklist

- [ ] No hardcoded secrets in frontend
- [ ] HTTPS enabled
- [ ] Supabase RLS policies active
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't expose system details
- [ ] Sensitive data in localStorage only (not API keys)

---

## Post-Launch Monitoring

### Daily Checks
- [ ] No new errors in logs
- [ ] All pages loading
- [ ] Users can sign up
- [ ] Orders processing
- [ ] Geolocation working on sample locations

### Weekly Checks
- [ ] Database size and performance
- [ ] User growth metrics
- [ ] Revenue tracking
- [ ] Peak load handling
- [ ] Support tickets

### Monthly Checks
- [ ] System performance trending
- [ ] Feature usage analytics
- [ ] User satisfaction
- [ ] Plan feature releases
- [ ] Optimization opportunities

---

## Rollback Plan

If critical issues after deployment:

1. **Immediate (First 5 minutes)**
   - Revert DNS to previous version
   - Notify users of maintenance
   - Start investigation

2. **Short-term (5-30 minutes)**
   - Restore from database backup
   - Deploy previous working version
   - Verify functionality

3. **Long-term**
   - Post-mortem analysis
   - Fix underlying issue
   - Deploy corrected version
   - Monitoring improvements

---

**Version:** 1.0.0
**Status:** Ready for Testing
**Last Updated:** Current
**Next Steps:** Follow Phase 1 testing plan

