/**
 * CAMUS Authentication Module
 * Handles user authentication, session management, and role-based access control
 */

class CAMUSAuth {
  constructor() {
    this.user = null;
    this.profile = null;
    this.isReady = false;
    this.initialized = false;
  }

  /**
   * Initialize authentication system
   */
  async init() {
    if (this.initialized) return;
    this.initialized = true;

    const client = await window.camusSupabaseReady;
    if (!client) {
      console.error('Supabase client not available');
      return;
    }

    // Check existing session
    const { data } = await client.auth.getSession();
    if (data?.session?.user) {
      await this.loadUser(data.session.user);
    }

    // Listen for auth changes
    client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUser(session.user);
      } else {
        this.user = null;
        this.profile = null;
      }
      this.broadcastAuthChange();
    });

    this.isReady = true;
  }

  /**
   * Load user profile from database
   */
  async loadUser(authUser) {
    const client = await window.camusSupabaseReady;
    if (!client) return;

    this.user = authUser;

    // Load profile from profiles table
    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profile) {
      this.profile = profile;
    } else {
      // Create profile if it doesn't exist
      const { data: newProfile } = await client
        .from('profiles')
        .insert({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || '',
          phone: authUser.user_metadata?.phone || '',
          role: 'customer',
        })
        .select()
        .maybeSingle();
      this.profile = newProfile;
    }
  }

  /**
   * Sign up new user
   */
  async signup(email, password, name, phone) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Authentication unavailable');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      await client.from('profiles').insert({
        id: data.user.id,
        full_name: name,
        phone: phone,
        role: 'customer',
      });
    }

    return data;
  }

  /**
   * Sign in with email and password
   */
  async login(email, password) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Authentication unavailable');

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await this.loadUser(data.user);
    }

    return data;
  }

  /**
   * Sign out current user
   */
  async logout() {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Authentication unavailable');

    const { error } = await client.auth.signOut();
    if (error) throw error;

    this.user = null;
    this.profile = null;
    this.broadcastAuthChange();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current user profile
   */
  getProfile() {
    return this.profile;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    if (!this.profile) return false;
    if (typeof role === 'string') {
      return this.profile.role === role;
    }
    if (Array.isArray(role)) {
      return role.includes(this.profile.role);
    }
    return false;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is restaurant owner
   */
  isRestaurantOwner() {
    return this.hasRole(['restaurant_owner', 'restaurant_staff']);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Authentication unavailable');

    const { error } = await client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    const client = await window.camusSupabaseReady;
    if (!client) throw new Error('Authentication unavailable');

    if (!this.user) throw new Error('No user logged in');

    const { data, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', this.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    this.profile = data;
    return data;
  }

  /**
   * Broadcast auth change to all listeners
   */
  broadcastAuthChange() {
    window.dispatchEvent(
      new CustomEvent('camusAuthChange', {
        detail: {
          isAuthenticated: this.isAuthenticated(),
          user: this.user,
          profile: this.profile,
        },
      })
    );
  }

  /**
   * Listen for auth changes
   */
  onAuthChange(callback) {
    window.addEventListener('camusAuthChange', (e) => {
      callback(e.detail);
    });
  }

  /**
   * Protect a page - redirect if not authenticated or lacks required role
   */
  async requireAuth(allowedRoles = null) {
    // Wait for auth to be ready
    let attempts = 0;
    while (!this.isReady && attempts < 100) {
      await new Promise((r) => setTimeout(r, 50));
      attempts++;
    }

    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }

    if (allowedRoles && !this.hasRole(allowedRoles)) {
      window.location.href = 'index.html';
      return false;
    }

    return true;
  }

  /**
   * Update UI based on auth state
   */
  updateUI() {
    const loginBtn = document.querySelector('.login-button');
    const accountLink = document.querySelector('[data-account-link]');
    const logoutBtn = document.querySelector('#logoutButton');

    if (this.isAuthenticated()) {
      if (loginBtn) {
        loginBtn.textContent = 'Account';
        loginBtn.href = 'account.html';
      }
      if (accountLink) {
        accountLink.style.display = 'inline-block';
      }
    } else {
      if (loginBtn) {
        loginBtn.textContent = 'Log in';
        loginBtn.href = 'login.html';
      }
      if (accountLink) {
        accountLink.style.display = 'none';
      }
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (confirm('Log out of CAMUS?')) {
          this.logout().then(() => {
            window.location.href = 'index.html';
          });
        }
      };
    }
  }
}

// Global instance
window.camusAuth = new CAMUSAuth();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.camusAuth.init().then(() => {
    window.camusAuth.updateUI();
  });
});
