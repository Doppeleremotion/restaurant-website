/**
 * CAMUS Marketplace Module
 * Handles loading and managing restaurant, dish, and category data
 */

class CAMUSMarketplace {
  constructor() {
    this.restaurants = [];
    this.dishes = [];
    this.categories = [];
    this.cities = [];
    this.selectedCity = 'Yaoundé';
    this.selectedCategory = null;
  }

  /**
   * Load all cities
   */
  async loadCities() {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const { data, error } = await client
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error loading cities:', error);
      return [];
    }

    this.cities = data || [];
    return this.cities;
  }

  /**
   * Load all categories
   */
  async loadCategories() {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error loading categories:', error);
      return [];
    }

    this.categories = data || [];
    return this.categories;
  }

  /**
   * Load restaurants - optionally filtered by city and search term
   */
  async loadRestaurants(city = null, searchTerm = null) {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    let query = client
      .from('restaurants')
      .select(
        `
        *,
        restaurant_locations(city, neighborhood, address, latitude, longitude),
        subscriptions(status)
      `
      )
      .eq('status', 'approved')
      .eq('is_active', true);

    if (city && city !== 'all') {
      query = query.eq('restaurant_locations.city', city);
    }

    const { data, error } = await query.order('is_featured', { ascending: false }).order('rating', { ascending: false });

    if (error) {
      console.error('Error loading restaurants:', error);
      return [];
    }

    let results = data || [];

    // Apply search filter if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.cuisine_type.toLowerCase().includes(term)
      );
    }

    this.restaurants = results;
    return results;
  }

  /**
   * Get single restaurant by ID with full details
   */
  async getRestaurant(id) {
    const client = await window.camusSupabaseReady;
    if (!client) return null;

    const { data, error } = await client
      .from('restaurants')
      .select(
        `
        *,
        restaurant_locations(*),
        subscriptions(status),
        dishes(*)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading restaurant:', error);
      return null;
    }

    return data;
  }

  /**
   * Load dishes - optionally filtered
   */
  async loadDishes(filters = {}) {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    let query = client
      .from('dishes')
      .select(
        `
        *,
        restaurants(name, slug, rating),
        restaurant_locations(city)
      `
      )
      .eq('is_available', true);

    if (filters.restaurantId) {
      query = query.eq('restaurant_id', filters.restaurantId);
    }

    if (filters.category) {
      query = query.in('category', filters.category);
    }

    if (filters.city) {
      query = query.eq('restaurant_locations.city', filters.city);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const { data, error } = await query.order('is_featured', { ascending: false }).order('rating', { ascending: false });

    if (error) {
      console.error('Error loading dishes:', error);
      return [];
    }

    this.dishes = data || [];
    return this.dishes;
  }

  /**
   * Get restaurant's menu by restaurant ID
   */
  async getRestaurantMenu(restaurantId) {
    const client = await window.camusSupabaseReady;
    if (!client) return {};

    const { data, error } = await client
      .from('dishes')
      .select('*, categories(*)')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('is_featured', { ascending: false });

    if (error) {
      console.error('Error loading menu:', error);
      return {};
    }

    // Group by category
    const menu = {};
    (data || []).forEach((dish) => {
      const categoryName = dish.categories?.length > 0 ? dish.categories[0].name : 'Uncategorized';
      if (!menu[categoryName]) {
        menu[categoryName] = [];
      }
      menu[categoryName].push(dish);
    });

    return menu;
  }

  /**
   * Get featured restaurants
   */
  async getFeaturedRestaurants() {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const { data, error } = await client
      .from('restaurants')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'approved')
      .eq('is_active', true)
      .limit(6);

    if (error) {
      console.error('Error loading featured restaurants:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get popular dishes
   */
  async getPopularDishes() {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const { data, error } = await client
      .from('dishes')
      .select('*, restaurants(name, slug, rating)')
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .limit(8);

    if (error) {
      console.error('Error loading popular dishes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get trending dishes
   */
  async getTrendingDishes(limit = 6) {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const { data, error } = await client
      .from('dishes')
      .select('*, restaurants(name, slug, rating)')
      .eq('is_available', true)
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error loading trending dishes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Search restaurants and dishes
   */
  async search(searchTerm) {
    const client = await window.camusSupabaseReady;
    if (!client) return { restaurants: [], dishes: [] };

    const term = searchTerm.toLowerCase();

    const [restaurantsResult, dishesResult] = await Promise.all([
      client
        .from('restaurants')
        .select('*')
        .or(`name.ilike.%${term}%,cuisine_type.ilike.%${term}%`)
        .eq('status', 'approved')
        .limit(10),
      client
        .from('dishes')
        .select('*, restaurants(name, slug)')
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .eq('is_available', true)
        .limit(20),
    ]);

    return {
      restaurants: restaurantsResult.data || [],
      dishes: dishesResult.data || [],
    };
  }
}

// Global instance
window.camusMarketplace = new CAMUSMarketplace();

// Preload common data
document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    window.camusMarketplace.loadCities(),
    window.camusMarketplace.loadCategories(),
  ]);
});
