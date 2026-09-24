/**
 * CAMUS Home Page (index.html) Script
 * Loads and displays restaurants, cities, and other marketplace data
 */

class CAMUSHomePage {
  constructor() {
    this.currentCity = 'all';
    this.restaurants = [];
  }

  /**
   * Initialize the home page
   */
  async init() {
    await window.camusAuth.init();

    // Restore saved city preference if available
    const savedCity = localStorage.getItem('camusSelectedCity');
    if (savedCity) {
      this.currentCity = savedCity;
    }

    await this.loadMarketplaceData();
    this.setupEventListeners();
  }

  /**
   * Load all marketplace data
   */
  async loadMarketplaceData() {
    try {
      // Load cities and restaurants in parallel
      await Promise.all([
        this.loadCities(),
        this.loadRestaurants(),
        this.loadPopularDish(),
      ]);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      this.showError('Failed to load marketplace data');
    }
  }

  /**
   * Load cities from Supabase
   */
  async loadCities() {
    const cities = await window.camusMarketplace.loadCities();
    const cityFilters = document.getElementById('cityFilters');
    const cityList = document.getElementById('cityList');

    if (!cities || cities.length === 0) return;

    // Update stats
    document.getElementById('cityCount').textContent = cities.length;

    // Add city filter buttons
    if (cityFilters) {
      cities.forEach((city) => {
        const button = document.createElement('button');
        button.className = 'filter-chip';
        if (city.name === this.currentCity) button.classList.add('active');
        button.textContent = city.name;
        button.dataset.city = city.name;
        button.addEventListener('click', () => this.filterByCity(city.name, button));
        cityFilters.appendChild(button);
      });
    }

    // Update city pills
    if (cityList) {
      cityList.innerHTML = '';
      cities.forEach((city) => {
        const pill = document.createElement('button');
        pill.className = 'city-pill';
        if (city.name === this.currentCity) pill.classList.add('active');
        pill.innerHTML = `${city.name} <small>${0} places</small>`;
        pill.addEventListener('click', () => this.filterByCity(city.name, pill));
        cityList.appendChild(pill);
      });
    }

    // Update current city display
    const currentCityDisplay = document.getElementById('currentCity');
    if (currentCityDisplay) {
      currentCityDisplay.textContent = this.currentCity;
    }
  }

  /**
   * Load restaurants from Supabase
   */
  async loadRestaurants() {
    try {
      this.restaurants = await window.camusMarketplace.loadRestaurants();
      this.renderRestaurants();
      this.updateRestaurantStats();
    } catch (error) {
      console.error('Error loading restaurants:', error);
      this.showError('Could not load restaurants');
    }
  }

  /**
   * Render restaurants to the grid
   */
  renderRestaurants(restaurants = this.restaurants) {
    const grid = document.getElementById('restaurantGrid');
    if (!grid) return;

    // Filter by city if selected
    let filtered = restaurants;
    if (this.currentCity !== 'all') {
      filtered = restaurants.filter((r) => {
        const location = r.restaurant_locations?.[0];
        return location?.city === this.currentCity;
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No restaurants found</p></div>';
      return;
    }

    grid.innerHTML = filtered
      .map(
        (restaurant) => `
      <article class="restaurant-card" data-restaurant-id="${restaurant.id}">
        <div class="restaurant-photo">
          <img 
            src="${restaurant.cover_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=85'}" 
            alt="${restaurant.name}"
            onerror="this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=85'"
          >
          ${restaurant.is_featured ? '<span class="badge">Featured</span>' : ''}
          <button class="favorite-button" aria-label="Favorite restaurant" data-restaurant-id="${restaurant.id}">♡</button>
        </div>
        <div class="restaurant-body">
          <div class="title-line">
            <h3>${restaurant.name}</h3>
            <strong>★ ${(restaurant.rating || 4.5).toFixed(1)}</strong>
          </div>
          <p>${restaurant.cuisine_type || 'Local cuisine'}</p>
          <small>
            <i class="fa-solid fa-location-dot"></i> 
            ${this.getRestaurantLocation(restaurant)}
          </small>
          <div class="card-foot">
            <span class="open"><i></i> ${restaurant.is_active ? 'Open now' : 'Closed'}</span>
            <a href="restaurant-profile.html?id=${restaurant.id}">View restaurant</a>
          </div>
        </div>
      </article>
    `
      )
      .join('');

    // Add event listeners for favorite buttons
    grid.querySelectorAll('.favorite-button').forEach((btn) => {
      btn.addEventListener('click', () => this.toggleFavorite(btn));
    });
  }

  /**
   * Get restaurant location display text
   */
  getRestaurantLocation(restaurant) {
    const location = restaurant.restaurant_locations?.[0];
    if (!location) return 'Location unknown';

    const parts = [];
    if (location.neighborhood) parts.push(location.neighborhood);
    if (location.city) parts.push(location.city);
    return parts.join(', ') || 'See location';
  }

  /**
   * Filter restaurants by city
   */
  filterByCity(city, button) {
    this.currentCity = city;
    localStorage.setItem('camusSelectedCity', city);

    // Update active button styling
    document.querySelectorAll('.filter-chip').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.city-pill').forEach((btn) => btn.classList.remove('active'));
    
    if (button) {
      button.classList.add('active');
    }

    // Update location display
    const currentCityDisplay = document.getElementById('currentCity');
    if (currentCityDisplay) {
      currentCityDisplay.textContent = city;
    }

    this.renderRestaurants();
  }

  /**
   * Update restaurant stats
   */
  updateRestaurantStats() {
    if (this.restaurants.length === 0) return;

    const count = this.restaurants.length;
    document.getElementById('restaurantCount').textContent = count + '+';

    // Calculate average rating
    const avgRating = (
      this.restaurants.reduce((sum, r) => sum + (r.rating || 4.5), 0) / count
    ).toFixed(1);
    document.getElementById('ratingAvg').textContent = `${avgRating}/5`;
  }

  /**
   * Load popular dish to display in hero
   */
  async loadPopularDish() {
    try {
      const dishes = await window.camusMarketplace.getPopularDishes();
      if (dishes.length > 0) {
        const dish = dishes[0];
        document.getElementById('popularDishName').textContent =
          `${dish.name} at ${dish.restaurants?.name || 'CAMUS'}`;
        document.getElementById('popularDishRating').textContent =
          `${(dish.rating || 4.8).toFixed(1)} ★`;
      }
    } catch (error) {
      console.error('Error loading popular dish:', error);
    }
  }

  /**
   * Toggle favorite restaurant
   */
  async toggleFavorite(button) {
    const restaurantId = button.dataset.restaurantId;
    const isSaved = button.classList.toggle('is-saved');
    button.textContent = isSaved ? '♥' : '♡';

    // Save to Supabase if user is logged in
    if (window.camusAuth.isAuthenticated()) {
      const client = await window.camusSupabaseReady;
      if (!client) return;

      if (isSaved) {
        await client.from('favorites').insert({
          user_id: window.camusAuth.getUser().id,
          restaurant_id: restaurantId,
        });
      } else {
        await client
          .from('favorites')
          .delete()
          .eq('user_id', window.camusAuth.getUser().id)
          .eq('restaurant_id', restaurantId);
      }
    }
  }

  /**
   * Get user's location and detect city
   */
  async detectLocationAndFilter() {
    const useLocationBtn = document.getElementById('useLocation');
    const originalText = useLocationBtn?.textContent || '📍 Use My Location';
    
    if (useLocationBtn) useLocationBtn.textContent = '🔍 Detecting...';
    if (useLocationBtn) useLocationBtn.disabled = true;

    try {
      const result = await window.camusGeolocation.detectLocation();

      if (result.success) {
        // City found and in service area
        const cityBtn = Array.from(document.querySelectorAll('.filter-chip')).find(
          (btn) => btn.textContent.toLowerCase() === result.city.toLowerCase()
        );

        if (cityBtn) {
          this.filterByCity(result.city, cityBtn);
          if (useLocationBtn) useLocationBtn.textContent = `📍 ${result.city}`;
          console.log(
            'Location detected:',
            result.city,
            `(${result.latitude.toFixed(2)}, ${result.longitude.toFixed(2)})`
          );
        }
      } else if (result.latitude && result.detected) {
        // Location detected but not in service area
        console.log('Location detected but out of service area:', result.detected);
        if (useLocationBtn) useLocationBtn.textContent = '📍 Out of service area';
        alert(
          `Detected location: ${result.detected}\n\nWe're not yet serving this area. Please select a city manually.`
        );
      } else {
        // Geolocation failed
        if (useLocationBtn) useLocationBtn.textContent = originalText;
        console.error('Location detection failed:', result.error);
        alert('Could not detect your location. Please select a city manually.');
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      if (useLocationBtn) useLocationBtn.textContent = originalText;
      alert('Location access denied or unavailable. Please select a city manually.');
    } finally {
      if (useLocationBtn) useLocationBtn.disabled = false;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('marketplaceSearch');
    if (searchForm) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = document.getElementById('homeSearch').value;
        await this.search(searchTerm);
      });
    }

    // Use location button
    const useLocationBtn = document.getElementById('useLocation');
    if (useLocationBtn) {
      useLocationBtn.addEventListener('click', () => {
        this.detectLocationAndFilter();
      });
    }

    // Cart button
    const cartBtn = document.querySelector('[data-cart-toggle]');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        if (window.camusCart.isEmpty()) {
          alert('Your cart is empty. Browse dishes to add items.');
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }

    // Update cart count when it changes
    window.camusCart.onChange((detail) => {
      document.querySelectorAll('.cart-count').forEach((el) => {
        el.textContent = detail.count;
      });
    });

    // Auto-detect location on page load
    this.autoDetectLocation();
  }

  /**
   * Auto-detect location on page load (silent)
   */
  async autoDetectLocation() {
    // Only auto-detect if we haven't already used a saved preference
    const savedCity = localStorage.getItem('camusSelectedCity');
    if (savedCity) return;

    // Give page time to render first
    setTimeout(async () => {
      try {
        const result = await window.camusGeolocation.detectLocation();

        if (result.success) {
          // Automatically filter to detected city
          const cityBtn = Array.from(document.querySelectorAll('.filter-chip')).find(
            (btn) => btn.textContent.toLowerCase() === result.city.toLowerCase()
          );

          if (cityBtn) {
            this.filterByCity(result.city, cityBtn);
            const useLocationBtn = document.getElementById('useLocation');
            if (useLocationBtn) useLocationBtn.textContent = `📍 ${result.city}`;
          }
        }
      } catch (error) {
        // Silently fail - location not available or denied
        console.debug('Auto-detection failed:', error.message);
      }
    }, 1500);
  }

  /**
   * Search restaurants and dishes
   */
  async search(searchTerm) {
    if (!searchTerm.trim()) {
      this.renderRestaurants();
      return;
    }

    const results = await window.camusMarketplace.search(searchTerm);

    // For now, just filter displayed restaurants
    // In a real app, this could also show dishes
    const filtered = this.restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.renderRestaurants(filtered);
    document.getElementById('restaurantGrid')?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('restaurantGrid');
    if (grid) {
      grid.innerHTML = `<div class="error-state"><p>${message}</p></div>`;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const homepage = new CAMUSHomePage();
  await homepage.init();
});
