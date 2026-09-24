/**
 * CAMUS Menu/Dish Discovery Page Script
 * Loads and displays dishes with filtering and search
 */

class CAMUSMenuPage {
  constructor() {
    this.dishes = [];
    this.filteredDishes = [];
    this.currentFilters = {
      searchTerm: '',
      city: '',
      category: '',
      minPrice: 0,
      maxPrice: 50000,
    };
  }

  /**
   * Initialize the menu page
   */
  async init() {
    await window.camusAuth.init();
    await this.loadMenuData();
    this.setupEventListeners();
    this.applyFiltersFromURL();
  }

  /**
   * Load all menu data
   */
  async loadMenuData() {
    try {
      await Promise.all([
        this.loadDishes(),
        this.loadCategories(),
        this.loadCities(),
      ]);
    } catch (error) {
      console.error('Error loading menu data:', error);
      this.showError('Failed to load dishes');
    }
  }

  /**
   * Load all available dishes from Supabase
   */
  async loadDishes() {
    try {
      this.dishes = await window.camusMarketplace.loadDishes();
      this.filteredDishes = this.dishes;
      this.renderDishes();
    } catch (error) {
      console.error('Error loading dishes:', error);
      this.showError('Could not load dishes');
    }
  }

  /**
   * Load categories for filtering
   */
  async loadCategories() {
    const categories = await window.camusMarketplace.loadCategories();
    const categoryFilter = document.getElementById('categoryFilter');

    if (!categoryFilter || categories.length === 0) return;

    categoryFilter.innerHTML =
      '<option value="">All categories</option>' +
      categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join('');
  }

  /**
   * Load cities for filtering
   */
  async loadCities() {
    const cities = await window.camusMarketplace.loadCities();
    const cityFilter = document.getElementById('cityFilter');

    if (!cityFilter || cities.length === 0) return;

    cityFilter.innerHTML =
      '<option value="">All cities</option>' +
      cities.map((city) => `<option value="${city.name}">${city.name}</option>`).join('');
  }

  /**
   * Render dishes to the grid
   */
  renderDishes(dishes = this.filteredDishes) {
    const grid = document.getElementById('dishGrid') || document.querySelector('.dish-grid');
    if (!grid) return;

    if (dishes.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; padding: 60px 20px; text-align: center;">
          <p style="font-size: 18px; color: var(--muted); margin: 0;">
            No dishes found matching your search
          </p>
        </div>
      `;
      return;
    }

    grid.innerHTML = dishes
      .map(
        (dish) => `
      <article class="restaurant-card menu-item" data-dish-id="${dish.id}">
        <div class="restaurant-photo">
          <img 
            src="${dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=85'}" 
            alt="${dish.name}"
            onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=85'"
          >
          ${dish.is_featured ? '<span class="badge">Popular</span>' : ''}
          ${!dish.is_available ? '<span class="badge" style="background: var(--muted);">Unavailable</span>' : ''}
        </div>
        <div class="restaurant-body">
          <div class="title-line">
            <h3>${dish.name}</h3>
            <strong>${this.formatPrice(dish.price)}</strong>
          </div>
          <p>${dish.restaurants?.name || 'Unknown Restaurant'} · ${this.getRestaurantCity(dish)}</p>
          <small>${dish.description || 'Delicious dish'}</small>
          <div class="card-foot">
            <span>★ ${(dish.rating || 4.5).toFixed(1)}</span>
            ${dish.is_available
              ? `<button class="add-to-cart-btn" data-dish-id="${dish.id}" data-name="${dish.name}" data-price="${dish.price}">
                   Add to cart
                 </button>`
              : '<span style="color: var(--muted);">Not available</span>'
            }
          </div>
        </div>
      </article>
    `
      )
      .join('');

    // Add event listeners
    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dishId = btn.dataset.dishId;
        const name = btn.dataset.name;
        const price = btn.dataset.price;

        window.camusCart.addItem(dishId, name, parseFloat(price), 1);

        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.style.opacity = '0.7';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.opacity = '1';
        }, 1500);
      });
    });
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
   * Get restaurant city for dish
   */
  getRestaurantCity(dish) {
    if (dish.restaurant_locations && dish.restaurant_locations[0]) {
      return dish.restaurant_locations[0].city || 'Cameroon';
    }
    return 'Cameroon';
  }

  /**
   * Auto-detect user's city from geolocation
   */
  async autoDetectCity(cityFilter) {
    try {
      const savedCity = window.camusGeolocation?.getCity();
      if (savedCity) {
        // Use saved city preference
        cityFilter.value = savedCity;
        this.currentFilters.city = savedCity;
        return;
      }

      // Try to auto-detect location
      if (window.camusGeolocation) {
        const result = await window.camusGeolocation.detectLocation();
        if (result.success) {
          cityFilter.value = result.city;
          this.currentFilters.city = result.city;
          this.applyFilters();
        }
      }
    } catch (error) {
      console.debug('Auto-detect city failed:', error);
    }
  }

  /**
   * Apply filters to dishes
   */
  applyFilters() {
    let filtered = this.dishes;

    // Search term filter
    if (this.currentFilters.searchTerm) {
      const term = this.currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(term) ||
          dish.description?.toLowerCase().includes(term) ||
          dish.restaurants?.name.toLowerCase().includes(term)
      );
    }

    // City filter
    if (this.currentFilters.city) {
      filtered = filtered.filter((dish) => {
        const location = dish.restaurant_locations?.[0];
        return location?.city === this.currentFilters.city;
      });
    }

    // Category filter
    if (this.currentFilters.category) {
      filtered = filtered.filter((dish) => {
        if (!dish.categories) return false;
        return dish.categories.some((cat) => cat.id === this.currentFilters.category);
      });
    }

    // Price range filter
    filtered = filtered.filter(
      (dish) =>
        dish.price >= this.currentFilters.minPrice && dish.price <= this.currentFilters.maxPrice
    );

    // Availability filter (only show available by default)
    filtered = filtered.filter((dish) => dish.is_available !== false);

    this.filteredDishes = filtered;
    this.renderDishes();
  }

  /**
   * Apply filters from URL parameters
   */
  applyFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('category')) {
      this.currentFilters.category = params.get('category');
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        categoryFilter.value = this.currentFilters.category;
      }
    }

    if (params.has('city')) {
      this.currentFilters.city = params.get('city');
      const cityFilter = document.getElementById('cityFilter');
      if (cityFilter) {
        cityFilter.value = this.currentFilters.city;
      }
    }

    if (params.has('search')) {
      this.currentFilters.searchTerm = params.get('search');
      const searchInput = document.querySelector('.search-box-input');
      if (searchInput) {
        searchInput.value = this.currentFilters.searchTerm;
      }
    }

    this.applyFilters();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search input
    const searchInput = document.querySelector('.search-box-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilters.searchTerm = e.target.value;
        this.applyFilters();
      });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.applyFilters();
      });
    }

    // City filter
    const cityFilter = document.getElementById('cityFilter');
    if (cityFilter) {
      // Auto-detect location if no city is saved
      this.autoDetectCity(cityFilter);

      cityFilter.addEventListener('change', (e) => {
        this.currentFilters.city = e.target.value;
        window.camusGeolocation.setCity(e.target.value);
        this.applyFilters();
      });
    }

    // Price range filters
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    if (minPrice) {
      minPrice.addEventListener('change', (e) => {
        this.currentFilters.minPrice = parseInt(e.target.value) || 0;
        this.applyFilters();
      });
    }

    if (maxPrice) {
      maxPrice.addEventListener('change', (e) => {
        this.currentFilters.maxPrice = parseInt(e.target.value) || 50000;
        this.applyFilters();
      });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortDishes(e.target.value);
      });
    }

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
   * Sort dishes
   */
  sortDishes(sortBy) {
    const sorted = [...this.filteredDishes];

    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    this.renderDishes(sorted);
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('dishGrid') || document.querySelector('.dish-grid');
    if (grid) {
      grid.innerHTML = `<div class="error-state" style="grid-column: 1/-1;"><p>${message}</p></div>`;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const menuPage = new CAMUSMenuPage();
  await menuPage.init();
});
