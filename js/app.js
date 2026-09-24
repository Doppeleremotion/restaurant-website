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
  document.querySelectorAll('#restaurantGrid .card-foot a').forEach(link => { link.href = 'restaurant-profile.html'; });

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

  document.getElementById('signupForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const client = await window.camusSupabaseReady;
    const errorElement = document.getElementById('signupError');
    if (!client) { errorElement.textContent = 'Signup is unavailable. Check the Supabase connection.'; return; }
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const nameInput = document.getElementById('signupName');
    const phoneInput = document.getElementById('signupPhone');
    if (passwordInput.value.length < 6) { errorElement.textContent = 'Password must be at least 6 characters.'; return; }
    const { data, error } = await client.auth.signUp({ email: emailInput.value.trim(), password: passwordInput.value, options: { data: { full_name: nameInput.value.trim(), phone: phoneInput.value.trim() } } });
    if (error) { errorElement.textContent = error.message; return; }
    if (data.user && data.session) await client.from('profiles').upsert({ id: data.user.id, full_name: nameInput.value.trim(), phone: phoneInput.value.trim() });
    alert('Account created. Check your email if confirmation is enabled.');
    event.target.reset();
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
    const { error } = await client.from('reservations').insert({ customer_id: auth.user.id, restaurant_id: restaurant.id, reservation_date: document.getElementById('date').value, reservation_time: document.getElementById('time').value, guests: Number(document.getElementById('guests').value), customer_name: document.getElementById('firstName').value.trim(), customer_phone: document.getElementById('phone').value.trim(), note: document.getElementById('notes')?.value.trim() || null });
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
    const { error } = await client.from('restaurants').insert({ owner_id: auth.user.id, name, slug, description: document.getElementById('description').value.trim(), cuisine_type: document.getElementById('cuisine').value.trim(), phone: document.getElementById('ownerPhone').value.trim(), email: document.getElementById('ownerEmail').value.trim() });
    if (error) return alert(`Application failed: ${error.message}`);
    alert('Application received. Your restaurant is pending verification.'); event.target.reset();
  });

  const profilePage = document.getElementById('storefrontMenu');
  if (profilePage) {
    const params = new URLSearchParams(window.location.search);
    const restaurantId = params.get('id');
    const restaurantSlug = params.get('slug');
    const client = await window.camusSupabaseReady;
    if (!client || (!restaurantId && !restaurantSlug)) {
      profilePage.innerHTML = '<p class="empty-state">Choose a restaurant from Discover to view its storefront.</p>';
    } else {
      const query = client.from('restaurants').select('*,restaurant_locations(city,neighborhood,address),dishes(id,name,description,price,image_url,is_available,is_featured)').eq(restaurantId ? 'id' : 'slug', restaurantId || restaurantSlug).eq('status', 'approved').maybeSingle();
      const { data: restaurant, error } = await query;
      if (error || !restaurant) { profilePage.innerHTML = '<p class="error-state">This restaurant is not available or has not been verified yet.</p>'; }
      else {
        const location = Array.isArray(restaurant.restaurant_locations) ? restaurant.restaurant_locations[0] : restaurant.restaurant_locations;
        document.title = `${restaurant.name} | CAMUS`;
        document.getElementById('restaurantName').textContent = restaurant.name;
        document.getElementById('restaurantMeta').textContent = `${restaurant.cuisine_type || 'Local cuisine'} · ${location?.neighborhood || location?.city || 'Cameroon'} · ★ ${restaurant.rating || 'New'}`;
        document.getElementById('restaurantDescription').textContent = restaurant.description || 'A local kitchen serving food worth coming back for.';
        document.getElementById('restaurantAddress').textContent = location?.address || location?.neighborhood || location?.city || 'Cameroon';
        document.getElementById('restaurantPhone').textContent = restaurant.phone || 'Contact restaurant';
        document.getElementById('restaurantInitial').textContent = restaurant.name.charAt(0).toUpperCase();
        if (restaurant.cover_image_url) document.getElementById('storefrontCover').style.backgroundImage = `url("${restaurant.cover_image_url}")`;
        document.getElementById('restaurantRating').textContent = restaurant.rating || 'New';
        document.getElementById('restaurantReviews').textContent = `${restaurant.review_count || 0} reviews`;
        const dishes = restaurant.dishes || [];
        profilePage.innerHTML = dishes.length ? dishes.map(dish => `<article class="storefront-dish"><img src="${dish.image_url || 'sample-pics/bg2.webp'}" alt="${dish.name}"><div><h3>${dish.name}</h3><p>${dish.description || 'Prepared fresh by the kitchen.'}</p><strong>${Number(dish.price).toLocaleString()} FCFA</strong></div><button class="submit-button" data-add-dish data-name="${dish.name}" data-price="${dish.price}" ${dish.is_available ? '' : 'disabled'}>${dish.is_available ? 'Add' : 'Unavailable'}</button></article>`).join('') : '<p class="empty-state">This restaurant has not published its menu yet.</p>';
        profilePage.querySelectorAll('[data-add-dish]').forEach(button => button.addEventListener('click', () => {
          const cart = JSON.parse(localStorage.getItem('camusCart') || '[]'); const item = cart.find(entry => entry.name === button.dataset.name);
          if (item) item.quantity += 1; else cart.push({ name: button.dataset.name, price: Number(button.dataset.price), quantity: 1 });
          localStorage.setItem('camusCart', JSON.stringify(cart)); updateCartCount(); alert(`${button.dataset.name} added to your bag.`);
        }));
      }
    }
  }

  document.getElementById('checkoutItems') && renderCheckout();
  document.getElementById('logoutButton')?.addEventListener('click', async () => { const client = await window.camusSupabaseReady; if (client) await client.auth.signOut(); window.location.href = 'index.html'; });

  async function renderCheckout() {
    const cart = JSON.parse(localStorage.getItem('camusCart') || '[]');
    const itemsElement = document.getElementById('checkoutItems');
    const totalElement = document.getElementById('checkoutTotal');
    itemsElement.innerHTML = cart.length ? cart.map(item => `<p>${item.name} <span>${item.quantity} × ${Number(item.price).toLocaleString()} FCFA</span></p>`).join('') : '<p class="empty-state">Your bag is empty. Add dishes before checkout.</p>';
    totalElement.textContent = `${cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toLocaleString()} FCFA`;
  }

  document.getElementById('checkoutForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.getElementById('checkoutMessage');
    const cart = JSON.parse(localStorage.getItem('camusCart') || '[]');
    if (!cart.length) { message.textContent = 'Your bag is empty.'; return; }
    const client = await window.camusSupabaseReady;
    if (!client) { message.textContent = 'Checkout is unavailable. Check your Supabase connection.'; return; }
    const { data: auth } = await client.auth.getUser();
    if (!auth.user) { message.textContent = 'Please log in before placing an order.'; window.location.href = 'login.html'; return; }
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const { data: order, error } = await client.from('orders').insert({ customer_id: auth.user.id, restaurant_id: cart[0].restaurantId, order_number: `CAM-${Date.now()}`, order_type: document.querySelector('input[name="orderType"]:checked').value, subtotal, delivery_fee: 0, total: subtotal, delivery_address: document.getElementById('deliveryAddress').value.trim(), delivery_city: document.getElementById('deliveryCity').value.trim(), delivery_neighborhood: document.getElementById('deliveryNeighborhood').value.trim(), customer_name: document.getElementById('customerName').value.trim(), customer_phone: document.getElementById('customerPhone').value.trim(), customer_note: document.getElementById('customerNote').value.trim() }).select().single();
    if (error) { message.textContent = `Order failed: ${error.message}`; return; }
    const { error: itemsError } = await client.from('order_items').insert(cart.map(item => ({ order_id: order.id, dish_id: item.dishId || null, dish_name: item.name, unit_price: item.price, quantity: item.quantity, total_price: Number(item.price) * item.quantity })));
    if (itemsError) { message.textContent = `Order items failed: ${itemsError.message}`; return; }
    localStorage.removeItem('camusCart'); window.location.href = `order-confirmation.html?id=${order.id}`;
  });

  // Public discovery reads approved restaurants from Supabase; demo cards remain as a visual fallback.
  window.camusSupabaseReady.then(async client => {
    if (!client || !document.getElementById('restaurantGrid')) return;
    const { data, error } = await client.from('restaurants').select('id,name,description,cuisine_type,logo_url,cover_image_url,price_range,rating,review_count,restaurant_locations(city,neighborhood,address,latitude,longitude)').eq('status', 'approved').order('created_at', { ascending: false });
    if (error) { console.warn('Restaurant discovery query failed:', error.message); return; }
    if (data?.length) {
      window.camusRestaurants = data;
      const grid = document.getElementById('restaurantGrid');
      grid.innerHTML = data.map(restaurant => {
        const location = Array.isArray(restaurant.restaurant_locations) ? (restaurant.restaurant_locations[0] || {}) : (restaurant.restaurant_locations || {});
        const image = restaurant.cover_image_url || restaurant.logo_url || 'sample-pics/bg2.webp';
        const search = `${restaurant.name} ${restaurant.cuisine_type || ''} ${location.city || ''} ${location.neighborhood || ''}`.toLowerCase();
        return `<article class="restaurant-card" data-city="${location.neighborhood || location.city || ''}" data-search="${search}"><div class="restaurant-photo"><img src="${image}" alt="${restaurant.name}"><button class="favorite-button" aria-label="Favorite restaurant">♡</button></div><div class="restaurant-body"><div class="title-line"><h3>${restaurant.name}</h3><strong>★ ${restaurant.rating || 'New'}</strong></div><p>${restaurant.cuisine_type || 'Local cuisine'} · ${restaurant.price_range || 'Various prices'}</p><small><i class="fa-solid fa-location-dot"></i> ${location.neighborhood || location.city || 'Cameroon'}</small><div class="card-foot"><span class="open"><i></i> Open now</span><a href="restaurant.html?id=${restaurant.id}">View restaurant</a></div></div></article>`;
      }).join('');
      grid.querySelectorAll('.favorite-button').forEach(button => button.addEventListener('click', () => { button.classList.toggle('is-saved'); button.textContent = button.classList.contains('is-saved') ? '♥' : '♡'; }));
    }
  });
});
