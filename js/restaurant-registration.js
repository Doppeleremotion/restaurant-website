/**
 * CAMUS Restaurant Registration Page Script
 * Allow restaurant owners to join the platform
 */

class CAMUSRestaurantRegistration {
  constructor() {
    this.isOwner = false;
  }

  /**
   * Initialize restaurant registration page
   */
  async init() {
    await window.camusAuth.init();
    this.renderRegistrationFlow();
    this.setupEventListeners();
  }

  /**
   * Render registration flow
   */
  renderRegistrationFlow() {
    const formSection = document.getElementById('restaurantRegistrationForm');
    if (!formSection) return;

    if (window.camusAuth.isAuthenticated()) {
      if (window.camusAuth.isRestaurantOwner()) {
        // Show owner dashboard link
        formSection.innerHTML = `
          <div class="form-shell">
            <h2>Welcome back, Restaurant Owner!</h2>
            <p>Manage your restaurant from your dashboard</p>
            <a href="dashboard.html" class="primary-button" style="display: inline-block; margin-top: 20px;">
              Go to Dashboard
            </a>
          </div>
        `;
      } else {
        // Show registration form for existing customer
        this.renderOwnerForm();
      }
    } else {
      // Show auth options
      this.renderAuthPrompt();
    }
  }

  /**
   * Render authentication prompt
   */
  renderAuthPrompt() {
    const formSection = document.getElementById('restaurantRegistrationForm');
    if (!formSection) return;

    formSection.innerHTML = `
      <div class="form-shell">
        <h2>Join CAMUS as a Restaurant</h2>
        <p style="color: var(--muted);">First, create or log in to your account</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
          <div>
            <h3>New Restaurant Owner</h3>
            <p style="font-size: 14px; color: var(--muted);">Create an account and register your first restaurant</p>
            <a href="login.html" class="primary-button" style="display: block; margin-top: 15px;">
              Create Account
            </a>
          </div>
          <div>
            <h3>Existing CAMUS User</h3>
            <p style="font-size: 14px; color: var(--muted);">Already have a CAMUS account? Log in to continue</p>
            <a href="login.html" class="primary-button" style="display: block; margin-top: 15px;">
              Log In
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render restaurant owner form
   */
  renderOwnerForm() {
    const formSection = document.getElementById('restaurantRegistrationForm');
    if (!formSection) return;

    formSection.innerHTML = `
      <form id="ownerRegistrationForm">
        <div class="form-shell">
          <h2>Register Your Restaurant</h2>
          <p style="color: var(--muted);">Your first month on CAMUS is completely free. Start reaching hungry customers today.</p>

          <div class="feature-grid" style="margin: 30px 0;">
            <div class="feature-card" style="border: none; background: transparent;">
              <span style="font-size: 28px;">📱</span>
              <h4>Reach More Customers</h4>
              <p>Connect with thousands of customers searching for food</p>
            </div>
            <div class="feature-card" style="border: none; background: transparent;">
              <span style="font-size: 28px;">📊</span>
              <h4>Manage Everything</h4>
              <p>Orders, menu, reservations - all in one place</p>
            </div>
            <div class="feature-card" style="border: none; background: transparent;">
              <span style="font-size: 28px;">✨</span>
              <h4>First Month Free</h4>
              <p>No subscription fee for your first month</p>
            </div>
          </div>

          <hr>

          <h3>Restaurant Information</h3>

          <div class="form-grid">
            <div class="form-group full">
              <label>Restaurant Name *</label>
              <input type="text" id="restaurantName" required>
            </div>

            <div class="form-group full">
              <label>Description *</label>
              <textarea id="restaurantDescription" required placeholder="Tell customers about your restaurant..."></textarea>
            </div>

            <div class="form-group">
              <label>Cuisine Type *</label>
              <input type="text" id="restaurantCuisine" placeholder="e.g., Cameroonian, Fast Food" required>
            </div>

            <div class="form-group">
              <label>Price Range</label>
              <select id="restaurantPrice">
                <option value="">Select...</option>
                <option value="budget">Budget friendly</option>
                <option value="affordable">Affordable</option>
                <option value="moderate">Moderate</option>
                <option value="upscale">Upscale</option>
              </select>
            </div>

            <div class="form-group full">
              <label>Address *</label>
              <input type="text" id="restaurantAddress" required>
            </div>

            <div class="form-group">
              <label>City *</label>
              <select id="restaurantCity" required>
                <option value="">Select city...</option>
                <option value="Yaoundé">Yaoundé</option>
                <option value="Douala">Douala</option>
                <option value="Buea">Buea</option>
                <option value="Bamenda">Bamenda</option>
                <option value="Bafoussam">Bafoussam</option>
                <option value="Limbe">Limbe</option>
                <option value="Kribi">Kribi</option>
                <option value="Ebolowa">Ebolowa</option>
                <option value="Garoua">Garoua</option>
              </select>
            </div>

            <div class="form-group">
              <label>Neighborhood</label>
              <input type="text" id="restaurantNeighborhood">
            </div>

            <hr style="grid-column: 1/-1; margin: 20px 0;">

            <h3 style="grid-column: 1/-1;">Contact Information</h3>

            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" id="restaurantPhone" required>
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <input type="email" id="restaurantEmail" required>
            </div>

            <div class="form-group">
              <label>Website</label>
              <input type="url" id="restaurantWebsite" placeholder="https://...">
            </div>

            <hr style="grid-column: 1/-1; margin: 20px 0;">

            <h3 style="grid-column: 1/-1;">Operating Hours</h3>

            <div class="form-group">
              <label>Opening Time</label>
              <input type="time" id="restaurantOpeningTime">
            </div>

            <div class="form-group">
              <label>Closing Time</label>
              <input type="time" id="restaurantClosingTime">
            </div>
          </div>

          <button type="submit" class="primary-button" style="width: 100%; margin-top: 20px;">
            Submit Application
          </button>

          <p style="font-size: 12px; color: var(--muted); margin-top: 15px;">
            Your restaurant will be reviewed and approved within 24-48 hours
          </p>
        </div>
      </form>
    `;

    // Add form submission
    const form = formSection.querySelector('#ownerRegistrationForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    try {
      const name = document.getElementById('restaurantName').value;
      const description = document.getElementById('restaurantDescription').value;
      const cuisine = document.getElementById('restaurantCuisine').value;
      const address = document.getElementById('restaurantAddress').value;
      const city = document.getElementById('restaurantCity').value;
      const neighborhood = document.getElementById('restaurantNeighborhood').value;
      const phone = document.getElementById('restaurantPhone').value;
      const email = document.getElementById('restaurantEmail').value;
      const website = document.getElementById('restaurantWebsite').value || null;
      const priceRange = document.getElementById('restaurantPrice').value;
      const openingTime = document.getElementById('restaurantOpeningTime').value || null;
      const closingTime = document.getElementById('restaurantClosingTime').value || null;

      const client = await window.camusSupabaseReady;
      const user = window.camusAuth.getUser();

      // Create restaurant
      const restaurantSlug = `${name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data: restaurant, error: restaurantError } = await client
        .from('restaurants')
        .insert({
          owner_id: user.id,
          name,
          slug: restaurantSlug,
          description,
          cuisine_type: cuisine,
          phone,
          email,
          website,
          price_range: priceRange || null,
          opening_time: openingTime,
          closing_time: closingTime,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (restaurantError) throw restaurantError;

      // Create location
      const { error: locationError } = await client
        .from('restaurant_locations')
        .insert({
          restaurant_id: restaurant.id,
          city,
          neighborhood,
          address,
        });

      if (locationError) throw locationError;

      // Create subscription (trial)
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);

      await client.from('subscriptions').insert({
        restaurant_id: restaurant.id,
        status: 'trial',
        trial_start: new Date(),
        trial_end: trialEnd,
      });

      this.showSuccess(restaurant.id);
    } catch (error) {
      console.error('Error registering restaurant:', error);
      alert('Registration failed: ' + error.message);
    }
  }

  /**
   * Show success message
   */
  showSuccess(restaurantId) {
    const formSection = document.getElementById('restaurantRegistrationForm');
    if (formSection) {
      formSection.innerHTML = `
        <div class="form-shell" style="text-align: center;">
          <h2>Application Submitted! ✓</h2>
          <p style="color: var(--muted); font-size: 16px; margin: 20px 0;">
            Your restaurant has been submitted for approval
          </p>
          <div style="background: var(--cream); padding: 30px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: var(--muted); font-size: 14px;">Status</p>
            <h3 style="margin: 10px 0 0 0; color: var(--red);">Pending Approval</h3>
          </div>
          <p style="color: var(--muted); font-size: 14px;">
            Our team will review your information within 24-48 hours<br>
            You'll receive an email when your restaurant is approved
          </p>
          <div style="margin-top: 30px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="index.html" class="primary-button">Back to Home</a>
            <a href="account.html" class="outline-button">My Account</a>
          </div>
        </div>
      `;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Any additional setup
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const registration = new CAMUSRestaurantRegistration();
  await registration.init();
});
