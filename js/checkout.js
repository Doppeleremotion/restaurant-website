/**
 * CAMUS Checkout Page Script
 * Handles cart review, order creation, and payment
 */

class CAMUSCheckout {
  constructor() {
    this.cart = [];
    this.selectedRestaurant = null;
    this.orderType = 'pickup';
  }

  /**
   * Initialize checkout page
   */
  async init() {
    await window.camusAuth.init();

    // Redirect if not authenticated
    if (!window.camusAuth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    this.loadCart();
    this.renderCart();
    this.setupEventListeners();
  }

  /**
   * Load cart from global cart object
   */
  loadCart() {
    this.cart = window.camusCart.getItems();
    
    if (this.cart.length === 0) {
      document.body.innerHTML = `
        <main class="site-shell">
          <header class="site-header">
            <a class="brand" href="index.html">
              <span>CAMUS</span>
            </a>
          </header>
          <section class="page-content">
            <div style="text-align: center; padding: 80px 20px;">
              <h2>Your cart is empty</h2>
              <p style="color: var(--muted); margin: 20px 0;">Add some dishes to get started</p>
              <a class="primary-button" href="menu.html">Browse dishes</a>
            </div>
          </section>
        </main>
      `;
    }
  }

  /**
   * Render cart items and checkout form
   */
  async renderCart() {
    if (this.cart.length === 0) return;

    const cartSection = document.getElementById('cartItems');
    const summarySection = document.getElementById('orderSummary');

    if (!cartSection || !summarySection) return;

    // Render cart items
    const cartHTML = this.cart
      .map(
        (item) => `
      <div class="cart-item">
        <div class="item-info">
          <h4>${item.dishName}</h4>
          <small>${this.formatPrice(item.price)} × ${item.quantity}</small>
        </div>
        <div class="item-controls">
          <button class="qty-btn" data-dishid="${item.dishId}" data-action="decrease">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" data-dishid="${item.dishId}" readonly>
          <button class="qty-btn" data-dishid="${item.dishId}" data-action="increase">+</button>
        </div>
        <div class="item-total">
          <strong>${this.formatPrice(item.price * item.quantity)}</strong>
          <button class="remove-btn" data-dishid="${item.dishId}">✕</button>
        </div>
      </div>
    `
      )
      .join('');

    cartSection.innerHTML = cartHTML;

    // Add event listeners
    cartSection.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dishId = btn.dataset.dishid;
        const action = btn.dataset.action;
        const item = this.cart.find((i) => i.dishId === dishId);

        if (!item) return;

        if (action === 'increase') {
          window.camusCart.updateQuantity(dishId, item.quantity + 1);
        } else if (action === 'decrease' && item.quantity > 1) {
          window.camusCart.updateQuantity(dishId, item.quantity - 1);
        }

        location.reload();
      });
    });

    cartSection.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dishId = btn.dataset.dishid;
        window.camusCart.removeItem(dishId);
        location.reload();
      });
    });

    // Render order summary
    this.renderOrderSummary();
  }

  /**
   * Render order summary and delivery options
   */
  renderOrderSummary() {
    const summarySection = document.getElementById('orderSummary');
    if (!summarySection) return;

    const subtotal = window.camusCart.getSubtotal();
    const deliveryFee = this.orderType === 'delivery' ? 5000 : 0;
    const total = subtotal + deliveryFee;

    const profile = window.camusAuth.getProfile();

    let summaryHTML = `
      <div class="order-summary-section">
        <h3>Order details</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>${this.formatPrice(subtotal)}</strong>
        </div>
        ${this.orderType === 'delivery'
          ? `
        <div class="summary-row">
          <span>Delivery fee</span>
          <strong>${this.formatPrice(deliveryFee)}</strong>
        </div>
      `
          : ''
        }
        <hr>
        <div class="summary-row total">
          <span>Total</span>
          <strong>${this.formatPrice(total)}</strong>
        </div>
      </div>

      <div class="order-summary-section">
        <h3>Delivery options</h3>
        <label class="radio-option">
          <input type="radio" name="orderType" value="pickup" ${this.orderType === 'pickup' ? 'checked' : ''}>
          <span>Pickup</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="orderType" value="delivery" ${this.orderType === 'delivery' ? 'checked' : ''}>
          <span>Delivery (XAF 5,000)</span>
        </label>
      </div>

      <div class="order-summary-section">
        <h3>Your information</h3>
        <div class="form-grid">
          <div class="form-group full">
            <label>Full name</label>
            <input type="text" id="customerName" value="${profile?.full_name || ''}" required>
          </div>
          <div class="form-group full">
            <label>Phone number</label>
            <input type="tel" id="customerPhone" value="${profile?.phone || ''}" required>
          </div>
          ${this.orderType === 'delivery'
            ? `
          <div class="form-group full">
            <label>Delivery address</label>
            <input type="text" id="deliveryAddress" placeholder="House number, street, building name" required>
          </div>
          <div class="form-group">
            <label>City</label>
            <input type="text" id="deliveryCity" value="${profile?.city || 'Yaoundé'}" required>
          </div>
          <div class="form-group">
            <label>Neighborhood</label>
            <input type="text" id="deliveryNeighborhood" value="${profile?.neighborhood || ''}" required>
          </div>
        `
            : ''
          }
          <div class="form-group full">
            <label>Special instructions (optional)</label>
            <textarea id="customerNote" placeholder="Any special requests or dietary needs"></textarea>
          </div>
        </div>
      </div>

      <button class="primary-button full-width" id="placeOrderBtn">
        Place order · ${this.formatPrice(total)}
      </button>
    `;

    summarySection.innerHTML = summaryHTML;

    // Event listeners
    summarySection.querySelectorAll('input[name="orderType"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.orderType = e.target.value;
        this.renderOrderSummary();
      });
    });

    const placeOrderBtn = summarySection.querySelector('#placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => this.placeOrder());
    }
  }

  /**
   * Place order
   */
  async placeOrder() {
    try {
      const customerName = document.getElementById('customerName').value;
      const customerPhone = document.getElementById('customerPhone').value;
      const customerNote = document.getElementById('customerNote').value;

      if (!customerName || !customerPhone) {
        alert('Please provide your name and phone number');
        return;
      }

      // Determine restaurant from cart (assuming single restaurant per order)
      // TODO: Support multi-restaurant orders
      if (this.cart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // For now, use a default restaurant - in production, get from cart items
      const client = await window.camusSupabaseReady;
      const { data: restaurants } = await client
        .from('restaurants')
        .select('id')
        .eq('status', 'approved')
        .limit(1);

      if (!restaurants || restaurants.length === 0) {
        alert('No restaurants available');
        return;
      }

      const restaurantId = restaurants[0].id;
      const deliveryFee = this.orderType === 'delivery' ? 5000 : 0;

      const orderData = {
        restaurantId,
        orderType: this.orderType,
        deliveryFee,
        customerName,
        customerPhone,
        customerNote,
        deliveryAddress: document.getElementById('deliveryAddress')?.value || null,
        deliveryCity: document.getElementById('deliveryCity')?.value || null,
        deliveryNeighborhood: document.getElementById('deliveryNeighborhood')?.value || null,
      };

      const order = await window.camusOrders.createOrder(orderData);

      // Show success
      this.showOrderConfirmation(order);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Order failed: ${error.message}`);
    }
  }

  /**
   * Show order confirmation
   */
  showOrderConfirmation(order) {
    document.body.innerHTML = `
      <main class="site-shell">
        <header class="site-header">
          <a class="brand" href="index.html">
            <span>CAMUS</span>
          </a>
        </header>
        <section class="page-content">
          <div class="form-shell">
            <h2>Order Confirmed! ✓</h2>
            <div style="text-align: center; padding: 40px 0;">
              <p style="font-size: 18px; color: var(--green); margin-bottom: 10px;">
                Your order has been placed successfully
              </p>
              <div style="background: var(--cream); padding: 30px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; color: var(--muted); font-size: 14px;">Order number</p>
                <h3 style="margin: 10px 0 0 0; font-family: monospace;">${order.order_number}</h3>
              </div>
              <p style="color: var(--muted); margin: 20px 0;">
                You will receive updates via SMS at ${order.customer_phone}
              </p>
              <div style="margin-top: 40px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="index.html" class="primary-button">Continue shopping</a>
                <a href="account.html" class="outline-button">Track order</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
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
    // Any additional event listeners can be added here
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const checkout = new CAMUSCheckout();
  await checkout.init();
});
