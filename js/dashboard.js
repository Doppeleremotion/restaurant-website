/**
 * CAMUS Restaurant Dashboard Script
 * Restaurant owner management interface
 */

class CAMUSRestaurantDashboard {
  constructor() {
    this.ownedRestaurants = [];
    this.currentRestaurant = null;
    this.todaysOrders = [];
    this.allReservations = [];
  }

  /**
   * Initialize dashboard
   */
  async init() {
    await window.camusAuth.init();

    // Protect page - only restaurant owners can access
    if (!window.camusAuth.isRestaurantOwner()) {
      window.location.href = 'login.html';
      return;
    }

    await this.loadOwnerData();
    this.setupEventListeners();
  }

  /**
   * Load all owner data
   */
  async loadOwnerData() {
    try {
      await this.loadOwnedRestaurants();
      if (this.ownedRestaurants.length > 0) {
        this.currentRestaurant = this.ownedRestaurants[0];
        await Promise.all([
          this.loadTodaysOrders(),
          this.loadReservations(),
          this.loadMenuItems(),
        ]);
        this.renderDashboard();
      } else {
        this.showNoRestaurants();
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showError('Failed to load dashboard');
    }
  }

  /**
   * Load restaurants owned by current user
   */
  async loadOwnedRestaurants() {
    const client = await window.camusSupabaseReady;
    const user = window.camusAuth.getUser();

    const { data, error } = await client
      .from('restaurants')
      .select('*, restaurant_locations(*), subscriptions(*)')
      .eq('owner_id', user.id);

    if (error) throw error;
    this.ownedRestaurants = data || [];
  }

  /**
   * Load today's orders
   */
  async loadTodaysOrders() {
    if (!this.currentRestaurant) return;

    try {
      const orders = await window.camusOrders.getRestaurantOrders(this.currentRestaurant.id);

      // Filter for today's orders
      const today = new Date().toDateString();
      this.todaysOrders = orders.filter(
        (order) => new Date(order.created_at).toDateString() === today
      );
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  /**
   * Load reservations
   */
  async loadReservations() {
    if (!this.currentRestaurant) return;

    try {
      const client = await window.camusSupabaseReady;
      const { data, error } = await client
        .from('reservations')
        .select('*')
        .eq('restaurant_id', this.currentRestaurant.id)
        .order('reservation_date')
        .limit(20);

      if (error) throw error;
      this.allReservations = data || [];
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }

  /**
   * Load menu items
   */
  async loadMenuItems() {
    if (!this.currentRestaurant) return;

    try {
      const menu = await window.camusMarketplace.getRestaurantMenu(this.currentRestaurant.id);
      // Store menu in this.currentRestaurant
      this.currentRestaurant.menu = menu;
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  }

  /**
   * Render dashboard
   */
  renderDashboard() {
    const mainContent = document.getElementById('dashboardContent');
    if (!mainContent) return;

    const restaurant = this.currentRestaurant;
    const todayRevenue = this.todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = this.todaysOrders.filter((o) => o.status === 'new' || o.status === 'confirmed').length;

    mainContent.innerHTML = `
      <div class="dashboard-header">
        <div>
          <h1>${restaurant.name}</h1>
          <p style="color: var(--muted);">${restaurant.cuisine_type || 'Local restaurant'}</p>
        </div>
        <span class="restaurant-status ${restaurant.status}">${restaurant.status}</span>
      </div>

      <div class="dashboard-grid">
        <div class="metric">
          <small>Today's revenue</small>
          <strong>${this.formatPrice(todayRevenue)}</strong>
        </div>
        <div class="metric">
          <small>Orders today</small>
          <strong>${this.todaysOrders.length}</strong>
        </div>
        <div class="metric">
          <small>Pending orders</small>
          <strong>${pendingOrders}</strong>
        </div>
        <div class="metric">
          <small>Pending reservations</small>
          <strong>${this.allReservations.filter((r) => r.status === 'pending').length}</strong>
        </div>
      </div>

      <div class="dashboard-content">
        <section class="dashboard-panel">
          <h2>Recent Orders</h2>
          ${this.renderOrdersTable()}
        </section>

        <section class="dashboard-panel">
          <h2>Reservations</h2>
          ${this.renderReservationsTable()}
        </section>

        <section class="dashboard-panel">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <button class="outline-button" id="editMenuBtn">
              <i class="fa-solid fa-utensils"></i> Manage menu
            </button>
            <button class="outline-button" id="editProfileBtn">
              <i class="fa-solid fa-gear"></i> Edit profile
            </button>
            <button class="outline-button" id="viewAnalyticsBtn">
              <i class="fa-solid fa-chart-bar"></i> Analytics
            </button>
            <button class="outline-button" id="subscriptionBtn">
              <i class="fa-solid fa-credit-card"></i> Subscription
            </button>
          </div>
        </section>
      </div>
    `;

    // Add event listeners
    document.getElementById('editMenuBtn')?.addEventListener('click', () => {
      alert('Menu management coming soon');
    });
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
      alert('Profile editing coming soon');
    });
    document.getElementById('viewAnalyticsBtn')?.addEventListener('click', () => {
      alert('Analytics coming soon');
    });
    document.getElementById('subscriptionBtn')?.addEventListener('click', () => {
      alert('Subscription management coming soon');
    });
  }

  /**
   * Render orders table
   */
  renderOrdersTable() {
    if (this.todaysOrders.length === 0) {
      return '<p style="color: var(--muted);">No orders today</p>';
    }

    return `
      <table style="width: 100%; font-size: 14px;">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${this.todaysOrders
            .map(
              (order) => `
            <tr>
              <td>${order.order_number.substring(0, 12)}...</td>
              <td>${order.customer_name}</td>
              <td>${order.order_type}</td>
              <td>${this.formatPrice(order.total)}</td>
              <td>
                <span class="status-badge ${order.status}">${order.status}</span>
              </td>
              <td>
                <button class="order-action-btn" data-order-id="${order.id}">
                  Update status
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Render reservations table
   */
  renderReservationsTable() {
    const pending = this.allReservations.filter((r) => r.status === 'pending');

    if (pending.length === 0) {
      return '<p style="color: var(--muted);">No pending reservations</p>';
    }

    return `
      <table style="width: 100%; font-size: 14px;">
        <thead>
          <tr>
            <th>Guest name</th>
            <th>Date & time</th>
            <th>Guests</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${pending
            .map(
              (res) => `
            <tr>
              <td>${res.customer_name}</td>
              <td>${new Date(res.reservation_date).toLocaleDateString()} ${res.reservation_time}</td>
              <td>${res.guests}</td>
              <td>${res.customer_phone}</td>
              <td>
                <button class="confirm-reservation-btn" data-res-id="${res.id}" style="margin-right: 5px; padding: 4px 8px; font-size: 12px;">
                  Confirm
                </button>
                <button class="cancel-reservation-btn" data-res-id="${res.id}" style="padding: 4px 8px; font-size: 12px;">
                  Decline
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return `${price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} XAF`;
  }

  /**
   * Show no restaurants message
   */
  showNoRestaurants() {
    const mainContent = document.getElementById('dashboardContent');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <h2>No restaurants yet</h2>
          <p style="color: var(--muted); margin: 20px 0;">
            You haven't registered a restaurant yet
          </p>
          <a href="restaurant.html" class="primary-button">Register your restaurant</a>
        </div>
      `;
    }
  }

  /**
   * Show error
   */
  showError(message) {
    const mainContent = document.getElementById('dashboardContent');
    if (mainContent) {
      mainContent.innerHTML = `<div style="color: red; padding: 20px;">${message}</div>`;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for order status updates
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('order-action-btn')) {
        const orderId = e.target.dataset.orderId;
        const newStatus = prompt(
          'New status:\nnew\nconfirmed\npreparing\nready\nout_for_delivery\ncompleted\ncancelled'
        );

        if (newStatus) {
          try {
            await window.camusOrders.updateOrderStatus(orderId, newStatus);
            alert('Order status updated');
            location.reload();
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        }
      }

      if (e.target.classList.contains('confirm-reservation-btn')) {
        const resId = e.target.dataset.resId;
        await this.updateReservationStatus(resId, 'confirmed');
      }

      if (e.target.classList.contains('cancel-reservation-btn')) {
        const resId = e.target.dataset.resId;
        await this.updateReservationStatus(resId, 'cancelled');
      }
    });
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(resId, status) {
    try {
      const client = await window.camusSupabaseReady;
      await client
        .from('reservations')
        .update({ status })
        .eq('id', resId);

      alert(`Reservation ${status}`);
      location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const dashboard = new CAMUSRestaurantDashboard();
  await dashboard.init();
});
