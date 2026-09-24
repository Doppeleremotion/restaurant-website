/**
 * CAMUS Admin Panel Script
 * Admin control center for managing platform
 */

class CAMUSAdminPanel {
  constructor() {
    this.restaurants = [];
    this.users = [];
    this.orders = [];
    this.currentTab = 'overview';
  }

  /**
   * Initialize admin panel
   */
  async init() {
    await window.camusAuth.init();

    // Protect page - only admins can access
    if (!window.camusAuth.isAdmin()) {
      window.location.href = 'login.html';
      return;
    }

    await this.loadAdminData();
    this.setupEventListeners();
  }

  /**
   * Load all admin data
   */
  async loadAdminData() {
    try {
      await Promise.all([this.loadRestaurants(), this.loadUsers(), this.loadOrders()]);
      this.renderAdminPanel();
    } catch (error) {
      console.error('Error loading admin data:', error);
      this.showError('Failed to load admin data');
    }
  }

  /**
   * Load all restaurants
   */
  async loadRestaurants() {
    const client = await window.camusSupabaseReady;
    const { data, error } = await client
      .from('restaurants')
      .select('*, profiles(full_name, email)');

    if (error) throw error;
    this.restaurants = data || [];
  }

  /**
   * Load all users
   */
  async loadUsers() {
    const client = await window.camusSupabaseReady;
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .limit(100);

    if (error) throw error;
    this.users = data || [];
  }

  /**
   * Load all orders
   */
  async loadOrders() {
    const client = await window.camusSupabaseReady;
    const { data, error } = await client
      .from('orders')
      .select('*, restaurants(name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    this.orders = data || [];
  }

  /**
   * Render admin panel
   */
  renderAdminPanel() {
    const mainContent = document.getElementById('adminContent');
    if (!mainContent) return;

    const stats = this.calculateStats();

    mainContent.innerHTML = `
      <h1>Admin Control Panel</h1>

      <div class="admin-tabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="restaurants">Restaurants</button>
        <button class="tab-btn" data-tab="users">Users</button>
        <button class="tab-btn" data-tab="orders">Orders</button>
      </div>

      <div class="tab-content">
        <div class="tab-pane active" id="overview-tab">
          ${this.renderOverview(stats)}
        </div>
        <div class="tab-pane" id="restaurants-tab">
          ${this.renderRestaurantsTab()}
        </div>
        <div class="tab-pane" id="users-tab">
          ${this.renderUsersTab()}
        </div>
        <div class="tab-pane" id="orders-tab">
          ${this.renderOrdersTab()}
        </div>
      </div>
    `;

    // Add tab event listeners
    mainContent.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        mainContent.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        mainContent.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        e.target.classList.add('active');
        const tabName = e.target.dataset.tab;
        const pane = mainContent.querySelector(`#${tabName}-tab`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  /**
   * Calculate platform statistics
   */
  calculateStats() {
    const approvedRestaurants = this.restaurants.filter((r) => r.status === 'approved').length;
    const totalUsers = this.users.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      approvedRestaurants,
      pendingRestaurants: this.restaurants.filter((r) => r.status === 'pending').length,
      totalUsers,
      customerUsers: this.users.filter((u) => u.role === 'customer').length,
      ownerUsers: this.users.filter((u) => u.role === 'restaurant_owner').length,
      totalOrders,
      totalRevenue,
      avgOrderValue,
    };
  }

  /**
   * Render overview tab
   */
  renderOverview(stats) {
    return `
      <div class="admin-grid">
        <div class="metric">
          <small>Active Restaurants</small>
          <strong>${stats.approvedRestaurants}</strong>
          <small style="color: var(--muted); display: block; margin-top: 5px;">${stats.pendingRestaurants} pending</small>
        </div>
        <div class="metric">
          <small>Total Users</small>
          <strong>${stats.totalUsers}</strong>
          <small style="color: var(--muted); display: block; margin-top: 5px;">${stats.customerUsers} customers · ${stats.ownerUsers} owners</small>
        </div>
        <div class="metric">
          <small>Total Orders</small>
          <strong>${stats.totalOrders}</strong>
          <small style="color: var(--muted); display: block; margin-top: 5px;">Avg: ${this.formatPrice(stats.avgOrderValue)}</small>
        </div>
        <div class="metric">
          <small>Total Revenue</small>
          <strong>${this.formatPrice(stats.totalRevenue)}</strong>
          <small style="color: var(--muted); display: block; margin-top: 5px;">All time</small>
        </div>
      </div>

      <div class="admin-panel" style="margin-top: 30px;">
        <h2>Platform Actions</h2>
        <div class="action-grid">
          <button class="outline-button" id="exportDataBtn">
            <i class="fa-solid fa-download"></i> Export data
          </button>
          <button class="outline-button" id="systemSettingsBtn">
            <i class="fa-solid fa-sliders"></i> System settings
          </button>
          <button class="outline-button" id="viewLogsBtn">
            <i class="fa-solid fa-file-lines"></i> View logs
          </button>
          <button class="outline-button" id="sendNotificationBtn">
            <i class="fa-solid fa-bell"></i> Send notification
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render restaurants tab
   */
  renderRestaurantsTab() {
    return `
      <div class="admin-panel">
        <h2>Manage Restaurants (${this.restaurants.length})</h2>
        <table style="width: 100%; font-size: 14px;">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${this.restaurants
              .slice(0, 20)
              .map(
                (restaurant) => `
              <tr>
                <td>
                  <strong>${restaurant.name}</strong>
                  <br>
                  <small style="color: var(--muted);">${restaurant.cuisine_type || 'N/A'}</small>
                </td>
                <td>${restaurant.profiles?.full_name || 'Unknown'}</td>
                <td>
                  <span class="status-badge ${restaurant.status}">${restaurant.status}</span>
                </td>
                <td>★ ${restaurant.rating || 0}</td>
                <td>${new Date(restaurant.created_at).toLocaleDateString()}</td>
                <td>
                  ${
                    restaurant.status === 'pending'
                      ? `
                    <button class="approve-btn" data-id="${restaurant.id}" style="margin-right: 5px; padding: 4px 8px; font-size: 12px;">
                      Approve
                    </button>
                    <button class="reject-btn" data-id="${restaurant.id}" style="padding: 4px 8px; font-size: 12px;">
                      Reject
                    </button>
                  `
                      : `
                    <button class="suspend-btn" data-id="${restaurant.id}" style="padding: 4px 8px; font-size: 12px;">
                      Suspend
                    </button>
                  `
                  }
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render users tab
   */
  renderUsersTab() {
    return `
      <div class="admin-panel">
        <h2>Manage Users (${this.users.length})</h2>
        <table style="width: 100%; font-size: 14px;">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>City</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            ${this.users
              .slice(0, 20)
              .map(
                (user) => `
              <tr>
                <td><strong>${user.full_name || 'Unknown'}</strong></td>
                <td><small>${user.id}</small></td>
                <td><span class="role-badge">${user.role}</span></td>
                <td>${user.city || '-'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render orders tab
   */
  renderOrdersTab() {
    return `
      <div class="admin-panel">
        <h2>Recent Orders (${this.orders.length})</h2>
        <table style="width: 100%; font-size: 14px;">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${this.orders
              .slice(0, 20)
              .map(
                (order) => `
              <tr>
                <td>${order.order_number.substring(0, 12)}...</td>
                <td>${order.profiles?.full_name || 'Unknown'}</td>
                <td>${order.restaurants?.name || 'Unknown'}</td>
                <td>${this.formatPrice(order.total)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
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
   * Show error
   */
  showError(message) {
    const mainContent = document.getElementById('adminContent');
    if (mainContent) {
      mainContent.innerHTML = `<div style="color: red; padding: 20px;">${message}</div>`;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const mainContent = document.getElementById('adminContent');
    if (!mainContent) return;

    // Restaurant approval
    mainContent.addEventListener('click', async (e) => {
      if (e.target.classList.contains('approve-btn')) {
        const restaurantId = e.target.dataset.id;
        await this.updateRestaurantStatus(restaurantId, 'approved');
      }

      if (e.target.classList.contains('reject-btn')) {
        const restaurantId = e.target.dataset.id;
        await this.updateRestaurantStatus(restaurantId, 'rejected');
      }

      if (e.target.classList.contains('suspend-btn')) {
        if (confirm('Suspend this restaurant?')) {
          const restaurantId = e.target.dataset.id;
          await this.updateRestaurantStatus(restaurantId, 'suspended');
        }
      }
    });
  }

  /**
   * Update restaurant status
   */
  async updateRestaurantStatus(restaurantId, status) {
    try {
      const client = await window.camusSupabaseReady;
      await client
        .from('restaurants')
        .update({ status })
        .eq('id', restaurantId);

      alert(`Restaurant ${status}`);
      location.reload();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const admin = new CAMUSAdminPanel();
  await admin.init();
});
