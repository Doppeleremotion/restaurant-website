/**
 * CAMUS Account Page Script
 * User profile and order history
 */

class CAMUSAccountPage {
  constructor() {
    this.userOrders = [];
    this.userReservations = [];
    this.profile = null;
  }

  /**
   * Initialize account page
   */
  async init() {
    await window.camusAuth.init();

    // Redirect if not authenticated
    if (!window.camusAuth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    this.profile = window.camusAuth.getProfile();
    await this.loadAccountData();
    this.renderAccount();
    this.setupEventListeners();
  }

  /**
   * Load account data
   */
  async loadAccountData() {
    try {
      await Promise.all([this.loadOrders(), this.loadReservations()]);
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  }

  /**
   * Load user's orders
   */
  async loadOrders() {
    try {
      this.userOrders = await window.camusOrders.getCustomerOrders();
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  /**
   * Load user's reservations
   */
  async loadReservations() {
    try {
      const client = await window.camusSupabaseReady;
      const { data } = await client
        .from('reservations')
        .select('*, restaurants(name)')
        .eq('customer_id', window.camusAuth.getUser().id)
        .order('reservation_date', { ascending: false });

      this.userReservations = data || [];
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }

  /**
   * Render account page
   */
  renderAccount() {
    const accountSection = document.getElementById('accountSection');
    if (!accountSection) return;

    accountSection.innerHTML = `
      <div class="account-header">
        <h1>My Account</h1>
        <p style="color: var(--muted);">Welcome, ${this.profile?.full_name || 'User'}!</p>
      </div>

      <div class="account-tabs">
        <button class="tab-btn active" data-tab="profile">Profile</button>
        <button class="tab-btn" data-tab="orders">Orders</button>
        <button class="tab-btn" data-tab="reservations">Reservations</button>
      </div>

      <div class="tab-content">
        <div class="tab-pane active" id="profile-tab">
          ${this.renderProfileTab()}
        </div>
        <div class="tab-pane" id="orders-tab">
          ${this.renderOrdersTab()}
        </div>
        <div class="tab-pane" id="reservations-tab">
          ${this.renderReservationsTab()}
        </div>
      </div>
    `;

    // Add tab listeners
    accountSection.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        accountSection.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        accountSection.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        e.target.classList.add('active');
        const tabName = e.target.dataset.tab;
        const pane = accountSection.querySelector(`#${tabName}-tab`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  /**
   * Render profile tab
   */
  renderProfileTab() {
    return `
      <div class="form-shell">
        <h2>Profile Information</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" value="${this.profile?.full_name || ''}" readonly>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" value="${window.camusAuth.getUser().email || ''}" readonly>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" value="${this.profile?.phone || ''}" readonly>
          </div>
          <div class="form-group">
            <label>City</label>
            <input type="text" value="${this.profile?.city || ''}" readonly>
          </div>
        </div>
        <button class="outline-button" onclick="alert('Profile editing coming soon')">
          Edit profile
        </button>
        <hr style="margin: 40px 0;">
        <h3>Account Settings</h3>
        <button class="outline-button" id="passwordBtn">Change password</button>
        <button class="outline-button" style="color: var(--red);" id="logoutBtn">
          Log out
        </button>
      </div>
    `;
  }

  /**
   * Render orders tab
   */
  renderOrdersTab() {
    if (this.userOrders.length === 0) {
      return `
        <div class="form-shell">
          <p style="color: var(--muted);">You haven't placed any orders yet.</p>
          <a href="menu.html" class="primary-button" style="margin-top: 20px;">
            Start shopping
          </a>
        </div>
      `;
    }

    return `
      <div class="orders-list">
        ${this.userOrders
          .map(
            (order) => `
          <div class="order-card">
            <div class="order-header">
              <div>
                <strong>${order.restaurants?.name || 'Restaurant'}</strong>
                <br>
                <small>${new Date(order.created_at).toLocaleDateString()}</small>
              </div>
              <div style="text-align: right;">
                <strong>${this.formatPrice(order.total)}</strong>
                <br>
                <span class="status-badge ${order.status}">${order.status}</span>
              </div>
            </div>
            <div class="order-items">
              ${order.order_items
                .map(
                  (item) => `
                <div style="font-size: 14px; color: var(--muted);">
                  ${item.quantity}x ${item.dish_name}
                </div>
              `
                )
                .join('')}
            </div>
            <div style="margin-top: 10px; border-top: 1px solid var(--line); padding-top: 10px;">
              <small>Order #${order.order_number.substring(0, 12)}...</small>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  /**
   * Render reservations tab
   */
  renderReservationsTab() {
    if (this.userReservations.length === 0) {
      return `
        <div class="form-shell">
          <p style="color: var(--muted);">You haven't made any reservations yet.</p>
          <a href="reservations.html" class="primary-button" style="margin-top: 20px;">
            Make a reservation
          </a>
        </div>
      `;
    }

    return `
      <div class="reservations-list">
        ${this.userReservations
          .map(
            (res) => `
          <div class="reservation-card">
            <div class="reservation-header">
              <div>
                <strong>${res.restaurants?.name || 'Restaurant'}</strong>
                <br>
                <small>${new Date(res.reservation_date).toLocaleDateString()} at ${res.reservation_time}</small>
              </div>
              <div style="text-align: right;">
                <strong>${res.guests} guests</strong>
                <br>
                <span class="status-badge ${res.status}">${res.status}</span>
              </div>
            </div>
            ${res.note ? `<p style="font-size: 14px; margin: 10px 0 0 0; color: var(--muted);">Note: ${res.note}</p>` : ''}
          </div>
        `
          )
          .join('')}
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
   * Setup event listeners
   */
  setupEventListeners() {
    const accountSection = document.getElementById('accountSection');
    if (!accountSection) return;

    const logoutBtn = accountSection.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Log out of CAMUS?')) {
          try {
            await window.camusAuth.logout();
            window.location.href = 'index.html';
          } catch (error) {
            alert('Error logging out: ' + error.message);
          }
        }
      });
    }

    const passwordBtn = accountSection.querySelector('#passwordBtn');
    if (passwordBtn) {
      passwordBtn.addEventListener('click', () => {
        const email = window.camusAuth.getUser().email;
        alert('Password reset email will be sent to ' + email);
        window.camusAuth.requestPasswordReset(email);
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const account = new CAMUSAccountPage();
  await account.init();
});
