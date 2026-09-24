/**
 * CAMUS Restaurant Profile Page Script
 * Displays complete restaurant details, menu, and reviews
 */

class CAMUSRestaurantProfile {
  constructor() {
    this.restaurant = null;
    this.menu = {};
    this.restaurantId = null;
  }

  /**
   * Initialize restaurant profile
   */
  async init() {
    // Get restaurant ID from URL parameter
    const params = new URLSearchParams(window.location.search);
    this.restaurantId = params.get('id');

    if (!this.restaurantId) {
      this.showError('Restaurant not found');
      return;
    }

    await window.camusAuth.init();
    await this.loadRestaurantData();
    this.setupEventListeners();
  }

  /**
   * Load restaurant data
   */
  async loadRestaurantData() {
    try {
      this.restaurant = await window.camusMarketplace.getRestaurant(this.restaurantId);

      if (!this.restaurant) {
        this.showError('Restaurant not found');
        return;
      }

      this.renderRestaurantProfile();
      await this.loadRestaurantMenu();
      await this.loadRestaurantReviews();
    } catch (error) {
      console.error('Error loading restaurant:', error);
      this.showError('Failed to load restaurant data');
    }
  }

  /**
   * Render restaurant profile header
   */
  renderRestaurantProfile() {
    // Update page title
    document.title = `${this.restaurant.name} | CAMUS`;

    // Header section
    const header = document.querySelector('.restaurant-header');
    if (header) {
      header.innerHTML = `
        <div class="restaurant-cover">
          <img 
            src="${this.restaurant.cover_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85'}"
            alt="${this.restaurant.name}"
            onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85'"
          >
          <div class="restaurant-hero-info">
            <div class="restaurant-logo">
              <img 
                src="${this.restaurant.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=85'}"
                alt="${this.restaurant.name}"
                onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=85'"
              >
            </div>
            <div class="restaurant-title">
              <h1>${this.restaurant.name}</h1>
              <div class="restaurant-meta">
                <span class="rating">★ ${(this.restaurant.rating || 4.5).toFixed(1)}</span>
                <span class="reviews">(${this.restaurant.review_count || 0} reviews)</span>
                <span class="cuisine">${this.restaurant.cuisine_type || 'Local cuisine'}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="restaurant-details">
          <div class="detail-item">
            <strong>Description</strong>
            <p>${this.restaurant.description || 'Delicious food from Cameroon'}</p>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <strong>📍 Location</strong>
              <p>${this.getLocation()}</p>
            </div>
            <div class="detail-item">
              <strong>🕒 Hours</strong>
              <p>${this.getHours()}</p>
            </div>
            <div class="detail-item">
              <strong>📞 Contact</strong>
              <p>${this.restaurant.phone || 'Not listed'}</p>
            </div>
            <div class="detail-item">
              <strong>💰 Price range</strong>
              <p>${this.restaurant.price_range || 'Affordable'}</p>
            </div>
          </div>
          <div class="restaurant-actions">
            <button class="primary-button" onclick="document.getElementById('menuSection').scrollIntoView({behavior: 'smooth'})">
              <i class="fa-solid fa-utensils"></i> View menu
            </button>
            <button class="outline-button" onclick="window.location.href='reservations.html?restaurant=${this.restaurant.id}'">
              <i class="fa-solid fa-calendar"></i> Reserve table
            </button>
            <a href="tel:${this.restaurant.phone || '+237000000000'}" class="outline-button">
              <i class="fa-solid fa-phone"></i> Call restaurant
            </a>
          </div>
        </div>
      `;
    }
  }

  /**
   * Get location display text
   */
  getLocation() {
    const location = this.restaurant.restaurant_locations?.[0];
    if (!location) return 'Location not available';

    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.neighborhood) parts.push(location.neighborhood);
    if (location.city) parts.push(location.city);
    if (location.latitude && location.longitude) {
      parts.push(`<a href="https://maps.google.com/?q=${location.latitude},${location.longitude}" target="_blank">View on map</a>`);
    }

    return parts.join(' • ');
  }

  /**
   * Get opening hours display
   */
  getHours() {
    if (!this.restaurant.opening_time || !this.restaurant.closing_time) {
      return 'Hours not listed';
    }
    return `${this.restaurant.opening_time} - ${this.restaurant.closing_time}`;
  }

  /**
   * Load restaurant menu
   */
  async loadRestaurantMenu() {
    try {
      this.menu = await window.camusMarketplace.getRestaurantMenu(this.restaurantId);
      this.renderMenu();
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  }

  /**
   * Render menu items by category
   */
  renderMenu() {
    const menuSection = document.getElementById('menuSection');
    if (!menuSection || Object.keys(this.menu).length === 0) return;

    const html = Object.entries(this.menu)
      .map(
        ([category, dishes]) => `
      <div class="menu-category">
        <h3>${category}</h3>
        <div class="menu-items">
          ${dishes
            .map(
              (dish) => `
            <div class="menu-item-card">
              <div class="menu-item-info">
                <h4>${dish.name}</h4>
                <p class="menu-item-desc">${dish.description || 'Delicious dish'}</p>
                <div class="menu-item-footer">
                  <strong>${this.formatPrice(dish.price)}</strong>
                  <span class="rating">★ ${(dish.rating || 4.5).toFixed(1)}</span>
                  ${!dish.is_available ? '<span class="unavailable">Unavailable</span>' : ''}
                </div>
              </div>
              ${dish.image_url ? `<img src="${dish.image_url}" alt="${dish.name}" class="menu-item-image">` : ''}
              ${dish.is_available
                ? `<button class="add-to-cart-btn" data-dish-id="${dish.id}" data-name="${dish.name}" data-price="${dish.price}">
                     <i class="fa-solid fa-plus"></i>
                   </button>`
                : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');

    menuSection.innerHTML = `<h2>Menu</h2>${html}`;

    // Add event listeners for add to cart
    menuSection.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dishId = btn.dataset.dishId;
        const name = btn.dataset.name;
        const price = btn.dataset.price;

        window.camusCart.addItem(dishId, name, parseFloat(price), 1);

        // Visual feedback
        btn.textContent = '✓';
        btn.style.opacity = '0.7';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
          btn.style.opacity = '1';
        }, 1500);
      });
    });
  }

  /**
   * Load restaurant reviews
   */
  async loadRestaurantReviews() {
    try {
      const client = await window.camusSupabaseReady;
      if (!client) return;

      const { data: reviews } = await client
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('restaurant_id', this.restaurantId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10);

      this.renderReviews(reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  /**
   * Render reviews section
   */
  renderReviews(reviews) {
    const reviewsSection = document.getElementById('reviewsSection');
    if (!reviewsSection) return;

    if (reviews.length === 0) {
      reviewsSection.innerHTML = '<h2>Reviews</h2><p style="color: var(--muted);">No reviews yet. Be the first to review!</p>';
      return;
    }

    const html = `
      <h2>Reviews (${reviews.length})</h2>
      <div class="reviews-list">
        ${reviews
          .map(
            (review) => `
          <div class="review-card">
            <div class="review-header">
              <strong>${review.profiles?.full_name || 'Anonymous'}</strong>
              <span class="rating">★ ${review.rating}</span>
            </div>
            <p class="review-text">${review.comment || 'No comment'}</p>
            <small>${new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    reviewsSection.innerHTML = html;
  }

  /**
   * Format price for display
   */
  formatPrice(price) {
    return `${price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} XAF`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cart button
    const cartBtn = document.querySelector('[data-cart-toggle]');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        if (window.camusCart.isEmpty()) {
          alert('Your cart is empty. Add some dishes!');
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }

    // Update cart count
    window.camusCart.onChange((detail) => {
      document.querySelectorAll('.cart-count').forEach((el) => {
        el.textContent = detail.count;
      });
    });
  }

  /**
   * Show error message
   */
  showError(message) {
    document.body.innerHTML = `
      <main class="site-shell">
        <header class="site-header">
          <a class="brand" href="index.html">
            <span>CAMUS</span>
          </a>
        </header>
        <section class="page-content">
          <div style="text-align: center; padding: 80px 20px;">
            <h2>${message}</h2>
            <a class="primary-button" href="index.html" style="margin-top: 20px;">
              Back to discover
            </a>
          </div>
        </section>
      </main>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const profile = new CAMUSRestaurantProfile();
  await profile.init();
});
