/**
 * CAMUS Reservations Page Script
 * Restaurant reservation booking
 */

class CAMUSReservations {
  constructor() {
    this.restaurants = [];
    this.selectedRestaurant = null;
  }

  /**
   * Initialize reservations page
   */
  async init() {
    await window.camusAuth.init();
    await this.loadRestaurants();
    this.renderReservationForm();
    this.setupEventListeners();
  }

  /**
   * Load restaurants for selection
   */
  async loadRestaurants() {
    try {
      this.restaurants = await window.camusMarketplace.loadRestaurants();
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  }

  /**
   * Render reservation form
   */
  renderReservationForm() {
    const formSection = document.getElementById('reservationForm');
    if (!formSection) return;

    const profile = window.camusAuth.getProfile();

    formSection.innerHTML = `
      <form id="reservationFormElement">
        <div class="form-grid">
          <div class="form-group full">
            <label>Select Restaurant</label>
            <select id="restaurantSelect" required>
              <option value="">Choose a restaurant...</option>
              ${this.restaurants
                .map((r) => `<option value="${r.id}">${r.name} - ${r.cuisine_type}</option>`)
                .join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Reservation Date</label>
            <input 
              type="date" 
              id="reservationDate" 
              min="${new Date().toISOString().split('T')[0]}"
              required
            >
          </div>

          <div class="form-group">
            <label>Reservation Time</label>
            <input type="time" id="reservationTime" required>
          </div>

          <div class="form-group">
            <label>Number of Guests</label>
            <input 
              type="number" 
              id="guestCount" 
              min="1" 
              max="20" 
              value="2" 
              required
            >
          </div>

          <div class="form-group full">
            <label>Your Name</label>
            <input 
              type="text" 
              id="guestName" 
              value="${profile?.full_name || ''}" 
              required
            >
          </div>

          <div class="form-group full">
            <label>Phone Number</label>
            <input 
              type="tel" 
              id="guestPhone" 
              value="${profile?.phone || ''}" 
              required
            >
          </div>

          <div class="form-group full">
            <label>Special Requests (optional)</label>
            <textarea id="guestNotes" placeholder="Dietary restrictions, special occasions, etc."></textarea>
          </div>
        </div>

        <button type="submit" class="primary-button" style="width: 100%;">
          Request Reservation
        </button>
      </form>

      <div id="reservationStatus"></div>
    `;

    // Add form submission handler
    const form = formSection.querySelector('#reservationFormElement');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Handle reservation form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    try {
      const restaurantId = document.getElementById('restaurantSelect').value;
      const date = document.getElementById('reservationDate').value;
      const time = document.getElementById('reservationTime').value;
      const guests = parseInt(document.getElementById('guestCount').value);
      const name = document.getElementById('guestName').value;
      const phone = document.getElementById('guestPhone').value;
      const notes = document.getElementById('guestNotes').value;

      if (!restaurantId) {
        alert('Please select a restaurant');
        return;
      }

      // Verify user is logged in
      if (!window.camusAuth.isAuthenticated()) {
        const shouldLogin = confirm('Please log in to make a reservation');
        if (shouldLogin) {
          window.location.href = 'login.html';
        }
        return;
      }

      const client = await window.camusSupabaseReady;
      const user = window.camusAuth.getUser();

      // Create reservation
      const { data, error } = await client
        .from('reservations')
        .insert({
          customer_id: user.id,
          restaurant_id: restaurantId,
          reservation_date: date,
          reservation_time: time,
          guests,
          customer_name: name,
          customer_phone: phone,
          note: notes || null,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      this.showConfirmation(data);
    } catch (error) {
      console.error('Error making reservation:', error);
      alert('Reservation failed: ' + error.message);
    }
  }

  /**
   * Show reservation confirmation
   */
  showConfirmation(reservation) {
    const statusDiv = document.getElementById('reservationStatus');
    if (statusDiv) {
      const restaurant = this.restaurants.find((r) => r.id === reservation.restaurant_id);
      statusDiv.innerHTML = `
        <div style="background: var(--green); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="margin-top: 0;">Reservation Confirmed!</h3>
          <p><strong>Restaurant:</strong> ${restaurant?.name}</p>
          <p><strong>Date & Time:</strong> ${new Date(reservation.reservation_date).toLocaleDateString()} at ${reservation.reservation_time}</p>
          <p><strong>Guests:</strong> ${reservation.guests}</p>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px;">
            The restaurant will confirm your reservation shortly. Check your account or SMS for updates.
          </p>
          <a href="account.html" class="primary-button" style="display: inline-block; margin-top: 15px;">
            View My Reservations
          </a>
        </div>
      `;

      // Reset form
      document.getElementById('reservationFormElement').reset();
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Additional setup if needed
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const reservations = new CAMUSReservations();
  await reservations.init();
});
