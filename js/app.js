(function loadSupabase() {
  if (window.camusSupabase) {
    window.camusSupabaseReady = Promise.resolve(window.camusSupabase);
    return;
  }
  window.camusSupabaseReady = new Promise(resolve => {
    const library = document.createElement('script');
    library.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    library.onload = () => {
      const config = document.createElement('script');
      config.src = 'js/supabase.js';
      config.onload = () => resolve(window.camusSupabase || null);
      config.onerror = () => resolve(null);
      document.head.appendChild(config);
    };
    library.onerror = () => resolve(null);
    document.head.appendChild(library);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('menuButton');
  const mainNav = document.getElementById('mainNav');
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mainNav.classList.remove('is-open')));
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === currentPage));

  document.querySelectorAll('.search-button').forEach(button => button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.scrollTarget || 'search');
    if (target) { target.scrollIntoView({ behavior: 'smooth' }); target.querySelector('input')?.focus(); }
    else window.location.href = 'menu.html#search';
  }));

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('camusCart') || '[]');
    const total = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    document.querySelectorAll('.cart-count').forEach(element => { element.textContent = total; });
  };
  updateCartCount();
  document.querySelectorAll('[data-cart-toggle]').forEach(button => button.addEventListener('click', () => {
    alert('Your bag is ready. Choose a dish to add it to your order.');
  }));

  document.querySelectorAll('[data-add-dish]').forEach(button => button.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('camusCart') || '[]');
    const item = cart.find(entry => entry.name === button.dataset.name);
    if (item) item.quantity += 1;
    else cart.push({ name: button.dataset.name, price: Number(button.dataset.price), quantity: 1 });
    localStorage.setItem('camusCart', JSON.stringify(cart));
    updateCartCount();
    alert(`${button.dataset.name} added to your bag.`);
  }));

  const homeSearch = document.getElementById('homeSearch');
  const restaurants = document.querySelectorAll('#restaurantGrid .restaurant-card');
  let city = 'all';
  const filterRestaurants = () => {
    const term = homeSearch?.value.toLowerCase().trim() || '';
    restaurants.forEach(card => { card.hidden = !((city === 'all' || card.dataset.city === city) && (!term || card.dataset.search.includes(term))); });
  };
  document.getElementById('marketplaceSearch')?.addEventListener('submit', event => { event.preventDefault(); filterRestaurants(); document.getElementById('restaurantGrid')?.scrollIntoView({ behavior: 'smooth' }); });
  homeSearch?.addEventListener('input', filterRestaurants);
  document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(item => item.classList.remove('active'));
    button.classList.add('active'); city = button.dataset.city; filterRestaurants();
  }));
  document.querySelectorAll('.favorite-button').forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('is-saved'); button.textContent = button.classList.contains('is-saved') ? '♥' : '♡';
  }));
  document.querySelectorAll('.city-pill').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.city-pill').forEach(item => item.classList.remove('active')); button.classList.add('active');
  }));

  document.getElementById('useLocation')?.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Location services are unavailable in this browser.');
    navigator.geolocation.getCurrentPosition(() => alert('Location permission received. Distance sorting can now use your coordinates.'), () => alert('Location permission was not granted. You can still browse by city.'));
  });

  document.querySelector('.search-box-input')?.addEventListener('input', event => {
    const term = event.target.value.toLowerCase().trim();
    document.querySelectorAll('.menu-item').forEach(item => { item.hidden = term && !item.dataset.search.includes(term); });
  });

  document.getElementById('loginForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const errorElement = document.getElementById('generalError');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberInput = document.getElementById('rememberMe');
    const client = await window.camusSupabaseReady;
    if (!client) { errorElement.textContent = 'Authentication is unavailable. Check the Supabase connection.'; return; }
    const { error } = await client.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
    if (error) { errorElement.textContent = error.message; return; }
    if (rememberInput.checked) localStorage.setItem('rememberEmail', emailInput.value.trim());
    window.location.href = 'index.html';
  });

  document.getElementById('reservationForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const client = await window.camusSupabaseReady;
    if (!client) return alert('Reservation service is unavailable. Please try again later.');
    const { data: auth } = await client.auth.getUser();
    if (!auth.user) { alert('Please log in before requesting a reservation.'); window.location.href = 'login.html'; return; }
    const restaurantSelect = document.getElementById('restaurant');
    const { data: restaurant, error: restaurantError } = await client.from('restaurants').select('id').eq('name', restaurantSelect.value).maybeSingle();
    if (restaurantError || !restaurant) return alert('That restaurant is not available yet.');
    const { error } = await client.from('reservations').insert({ customer_id: auth.user.id, restaurant_id: restaurant.id, reservation_date: date.value, reservation_time: time.value, guests: Number(guests.value), guest_name: firstName.value.trim(), phone: phone.value.trim(), special_request: document.getElementById('notes')?.value.trim() || null });
    if (error) return alert(`Reservation failed: ${error.message}`);
    alert('Reservation request sent. The restaurant will confirm shortly.'); event.target.reset();
  });

  document.getElementById('restaurantForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const client = await window.camusSupabaseReady;
    if (!client) return alert('Restaurant registration is unavailable. Please try again later.');
    const { data: auth } = await client.auth.getUser();
    if (!auth.user) { alert('Please create a CAMUS account or log in first.'); window.location.href = 'login.html'; return; }
    const name = document.getElementById('restaurantName').value.trim();
    const slug = `${name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await client.from('restaurants').insert({ owner_id: auth.user.id, name, slug, description: document.getElementById('description').value.trim(), cuisine: document.getElementById('cuisine').value.trim(), phone: document.getElementById('ownerPhone').value.trim(), email: document.getElementById('ownerEmail').value.trim() });
    if (error) return alert(`Application failed: ${error.message}`);
    alert('Application received. Your restaurant is pending verification.'); event.target.reset();
  });

  // Public discovery reads approved restaurants from Supabase; demo cards remain as a visual fallback.
  window.camusSupabaseReady.then(async client => {
    if (!client || !document.getElementById('restaurantGrid')) return;
    const { data, error } = await client.from('restaurants').select('id,name,description,cuisine,logo_url,cover_url,restaurant_locations(city_id,neighborhood,address)').eq('status', 'approved').order('created_at', { ascending: false });
    if (error) { console.warn('Restaurant discovery query failed:', error.message); return; }
    if (data?.length) window.camusRestaurants = data;
  });
});
