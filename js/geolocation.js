/**
 * CAMUS Geolocation Service
 * Provides location detection and city matching for the marketplace
 */

class CAMUSGeolocation {
  constructor() {
    this.currentCity = null;
    this.currentCoordinates = null;
    this.availableCities = [];
  }

  /**
   * Initialize geolocation service
   */
  async init() {
    // Load available cities from marketplace
    try {
      this.availableCities = await window.camusMarketplace.loadCities();
    } catch (error) {
      console.error('Error loading cities:', error);
    }

    // Restore saved city from localStorage
    const savedCity = localStorage.getItem('camusSelectedCity');
    if (savedCity) {
      this.currentCity = savedCity;
    }
  }

  /**
   * Get user's current position
   * @returns {Promise<GeolocationCoordinates>} Position with latitude and longitude
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not available'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      });
    });
  }

  /**
   * Reverse geocode coordinates to get address
   * Uses OpenStreetMap Nominatim (free, no API key needed)
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<Object>} Address object with city information
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      return data.address || {};
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Find city name from coordinates
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate
   * @returns {Promise<string|null>} City name or null if not found
   */
  async getCityFromCoordinates(latitude, longitude) {
    const address = await this.reverseGeocode(latitude, longitude);
    if (!address) return null;

    // Try to extract city from address
    const cityName = address.city || address.town || address.village || address.county;
    return cityName || null;
  }

  /**
   * Find nearest city from available cities
   * Matches city name or calculates distance
   * @param {string} detectedCityName - City name from reverse geocoding
   * @param {number} latitude - User latitude
   * @param {number} longitude - User longitude
   * @returns {Object|null} Nearest city object from available cities or null
   */
  findNearestCity(detectedCityName, latitude, longitude) {
    if (!this.availableCities || this.availableCities.length === 0) {
      return null;
    }

    // First, try exact match (case-insensitive)
    const exactMatch = this.availableCities.find(
      (city) => city.name.toLowerCase() === detectedCityName.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    // If no exact match, try partial match
    const partialMatch = this.availableCities.find((city) =>
      detectedCityName.toLowerCase().includes(city.name.toLowerCase()) ||
      city.name.toLowerCase().includes(detectedCityName.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // If still no match and we have coordinates, use first city as fallback
    // (In a real app, you'd calculate distance and find the closest)
    return this.availableCities[0] || null;
  }

  /**
   * Detect user's location and find matching city
   * @returns {Promise<Object|null>} Object with city name, coordinates, or null
   */
  async detectLocation() {
    try {
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      this.currentCoordinates = { latitude, longitude };

      // Get city name from coordinates
      const detectedCityName = await this.getCityFromCoordinates(latitude, longitude);

      if (detectedCityName) {
        // Find matching city from available cities
        const matchedCity = this.findNearestCity(detectedCityName, latitude, longitude);
        if (matchedCity) {
          this.currentCity = matchedCity.name;
          localStorage.setItem('camusSelectedCity', matchedCity.name);
          return {
            success: true,
            city: matchedCity.name,
            latitude,
            longitude,
            detected: detectedCityName,
          };
        }
      }

      return {
        success: false,
        error: 'City not in service area',
        latitude,
        longitude,
        detected: detectedCityName,
      };
    } catch (error) {
      console.error('Location detection error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set city manually and save preference
   * @param {string} cityName - City name to set
   */
  setCity(cityName) {
    this.currentCity = cityName;
    localStorage.setItem('camusSelectedCity', cityName);
  }

  /**
   * Get current city
   * @returns {string|null} Current city name or null
   */
  getCity() {
    return this.currentCity;
  }

  /**
   * Clear saved city preference
   */
  clearSavedCity() {
    localStorage.removeItem('camusSelectedCity');
    this.currentCity = null;
  }

  /**
   * Calculate distance between two coordinates (simple Haversine formula)
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Create global instance
window.camusGeolocation = new CAMUSGeolocation();

// Initialize on script load
window.camusSupabaseReady.then(() => {
  window.camusGeolocation.init();
});
