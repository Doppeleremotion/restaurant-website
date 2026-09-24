/**
 * CAMUS Cart and Orders Module
 * Handles shopping cart, checkout, and order management
 */

class CAMUSCart {
  constructor() {
    this.items = [];
    this.loadCart();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    const saved = localStorage.getItem('camusCart');
    this.items = saved ? JSON.parse(saved) : [];
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    localStorage.setItem('camusCart', JSON.stringify(this.items));
    this.broadcastChange();
  }

  /**
   * Add item to cart
   */
  addItem(dishId, dishName, price, quantity = 1) {
    const existing = this.items.find((item) => item.dishId === dishId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        dishId,
        dishName,
        price: parseFloat(price),
        quantity,
      });
    }

    this.saveCart();
    return this.items;
  }

  /**
   * Update item quantity
   */
  updateQuantity(dishId, quantity) {
    const item = this.items.find((i) => i.dishId === dishId);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(dishId);
    } else {
      item.quantity = quantity;
      this.saveCart();
    }

    return this.items;
  }

  /**
   * Remove item from cart
   */
  removeItem(dishId) {
    this.items = this.items.filter((i) => i.dishId !== dishId);
    this.saveCart();
    return this.items;
  }

  /**
   * Clear entire cart
   */
  clear() {
    this.items = [];
    this.saveCart();
  }

  /**
   * Get all items
   */
  getItems() {
    return this.items;
  }

  /**
   * Get total items count
   */
  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate subtotal
   */
  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Calculate total with delivery fee
   */
  getTotal(deliveryFee = 0) {
    return this.getSubtotal() + deliveryFee;
  }

  /**
   * Check if cart is empty
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Broadcast cart change event
   */
  broadcastChange() {
    window.dispatchEvent(
      new CustomEvent('camusCartChange', {
        detail: {
          items: this.items,
          count: this.getCount(),
          subtotal: this.getSubtotal(),
        },
      })
    );

    // Update all cart count displays
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = this.getCount();
    });
  }

  /**
   * Listen for cart changes
   */
  onChange(callback) {
    window.addEventListener('camusCartChange', (e) => {
      callback(e.detail);
    });
  }
}

/**
 * CAMUS Orders Module
 * Handles order creation, tracking, and management
 */
class CAMUSOrders {
  constructor() {}

  /**
   * Create order from cart
   */
  async createOrder(orderData) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Service unavailable');

    const auth = await client.auth.getUser();
    if (!auth.data.user) throw new Error('Please log in to place an order');

    const cartItems = window.camusCart.getItems();
    if (cartItems.length === 0) throw new Error('Your cart is empty');

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const { data: dish } = await client
        .from('dishes')
        .select('*')
        .eq('id', item.dishId)
        .maybeSingle();

      if (!dish) throw new Error(`Dish ${item.dishName} not found`);

      subtotal += dish.price * item.quantity;

      orderItems.push({
        dish_id: item.dishId,
        dish_name: item.dishName,
        unit_price: dish.price,
        quantity: item.quantity,
        total_price: dish.price * item.quantity,
      });
    }

    // Ensure all items are from the same restaurant
    if (orderItems.length === 0) throw new Error('No valid items in cart');

    // Create order
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        customer_id: auth.data.user.id,
        restaurant_id: orderData.restaurantId,
        order_number: orderNumber,
        status: 'new',
        order_type: orderData.orderType || 'pickup',
        subtotal,
        delivery_fee: orderData.deliveryFee || 0,
        total: subtotal + (orderData.deliveryFee || 0),
        delivery_address: orderData.deliveryAddress || null,
        delivery_city: orderData.deliveryCity || null,
        delivery_neighborhood: orderData.deliveryNeighborhood || null,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_note: orderData.customerNote || null,
      })
      .select()
      .maybeSingle();

    if (orderError) throw orderError;

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await client
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Clear cart
    window.camusCart.clear();

    return order;
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders() {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const auth = await client.auth.getUser();
    if (!auth.data.user) return [];

    const { data, error } = await client
      .from('orders')
      .select(
        `
        *,
        restaurants(name, logo_url),
        order_items(*)
      `
      )
      .eq('customer_id', auth.data.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get single order details
   */
  async getOrder(orderId) {
    const client = await window.camusSupabaseReady;
    if (!client) return null;

    const { data, error } = await client
      .from('orders')
      .select(
        `
        *,
        restaurants(name, logo_url, phone),
        order_items(*)
      `
      )
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Error loading order:', error);
      return null;
    }

    return data;
  }

  /**
   * Get restaurant's orders (for owner dashboard)
   */
  async getRestaurantOrders(restaurantId) {
    const client = await window.camusSupabaseReady;
    if (!client) return [];

    const auth = await client.auth.getUser();
    if (!auth.data.user) throw new Error('Not authenticated');

    // Verify user owns this restaurant
    const { data: restaurant } = await client
      .from('restaurants')
      .select('owner_id')
      .eq('id', restaurantId)
      .maybeSingle();

    if (!restaurant || restaurant.owner_id !== auth.data.user.id) {
      throw new Error('Not authorized to view this restaurant orders');
    }

    const { data, error } = await client
      .from('orders')
      .select(
        `
        *,
        order_items(*)
      `
      )
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Service unavailable');

    const { data, error } = await client
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    return this.updateOrderStatus(orderId, 'cancelled');
  }
}

// Global instances
window.camusCart = new CAMUSCart();
window.camusOrders = new CAMUSOrders();

// Update cart count on load
document.addEventListener('DOMContentLoaded', () => {
  const count = window.camusCart.getCount();
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = count;
  });

  // Listen for cart changes
  window.camusCart.onChange((detail) => {
    // Update cart UI
  });
});
