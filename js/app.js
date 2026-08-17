// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== MOBILE MENU TOGGLE =====
  const menuButton = document.getElementById('menuButton');
  const mainNav = document.getElementById('mainNav');

  if (menuButton) {
    menuButton.addEventListener('click', function() {
      const isOpen = mainNav.classList.contains('is-open');
      mainNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', !isOpen);
    });

    // Close menu when a link is clicked
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mainNav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== SET ACTIVE NAVIGATION LINK =====
  function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (href === 'index.html' && currentPage === '') || (href === '#top' && currentPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  setActiveNavLink();

  // ===== HANDLE HEADER ACTION BUTTONS =====
  const headerButtons = document.querySelectorAll('.header-actions button[data-message]');
  headerButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const message = this.getAttribute('data-message');
      if (message) {
        alert(message);
      }
    });
  });

  // ===== RESERVATION FORM VALIDATION =====
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    reservationForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get form values
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const guests = document.getElementById('guests').value;

      // Validate required fields
      if (!firstName || !lastName || !email || !phone || !date || !time || !guests) {
        alert('Please fill in all required fields.');
        return;
      }

      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Validate phone format (basic)
      const phonePattern = /^[0-9\-\+\(\)\s]{10,}$/;
      if (!phonePattern.test(phone)) {
        alert('Please enter a valid phone number.');
        return;
      }

      // Validate that the date is in the future
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Please select a future date.');
        return;
      }

      // Check terms and conditions
      const termsCheckbox = document.getElementById('terms');
      if (!termsCheckbox.checked) {
        alert('Please agree to the terms and conditions.');
        return;
      }

      // If all validation passes, show success message
      alert(`Thank you, ${firstName}! Your reservation for ${guests} guest(s) on ${date} at ${time} has been confirmed. We'll send a confirmation email to ${email}.`);
      
      // Reset form
      reservationForm.reset();
    });
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#top') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ===== REVIEW CARDS HOVER EFFECTS =====
  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // ===== CAROUSEL CONTROLS FOR REVIEWS =====
  const previousReviewBtn = document.getElementById('previousReview');
  const nextReviewBtn = document.getElementById('nextReview');
  const reviewGrid = document.getElementById('reviewGrid');

  if (previousReviewBtn && nextReviewBtn && reviewGrid) {
    previousReviewBtn.addEventListener('click', function() {
      reviewGrid.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    });

    nextReviewBtn.addEventListener('click', function() {
      reviewGrid.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    });
  }

  // ===== LAZY LOADING FOR IMAGES =====
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ===== LOGIN PAGE FUNCTIONALITY =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Toggle password visibility
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁' : '👁‍🗨';
      });
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Clear previous errors
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');
      const generalError = document.getElementById('generalError');
      
      if (emailError) emailError.textContent = '';
      if (passwordError) passwordError.textContent = '';
      if (generalError) generalError.textContent = '';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;

      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        if (emailError) emailError.textContent = 'Email is required.';
        return;
      }
      if (!emailPattern.test(email)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        return;
      }

      // Password validation
      if (!password) {
        if (passwordError) passwordError.textContent = 'Password is required.';
        return;
      }
      if (password.length < 6) {
        if (passwordError) passwordError.textContent = 'Password must be at least 6 characters.';
        return;
      }

      // Demo account validation
      if (email === 'demo@example.com' && password === 'demo123') {
        // Store login session
        localStorage.setItem('user', JSON.stringify({
          email: email,
          name: 'Demo User',
          loginTime: new Date().getTime()
        }));

        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        }

        // Show success message
        alert(`Welcome back, ${email}! You are now logged in.`);
        
        // Update UI
        updateLoginUI(email);
        loginForm.reset();
      } else {
        if (generalError) generalError.textContent = 'Invalid email or password. Try demo@example.com / demo123';
      }
    });
  }

  // ===== SIGN UP FORM HANDLING =====
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    // Toggle signup form visibility
    const signupLink = document.querySelector('.signup-link');
    const loginLink = document.querySelector('.login-link');
    const loginCard = document.querySelector('.login-card');
    const signupCard = document.getElementById('signupCard');

    if (signupLink) {
      signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (loginCard) loginCard.style.display = 'none';
        if (signupCard) signupCard.style.display = 'block';
        window.scrollTo(0, 0);
      });
    }

    if (loginLink) {
      loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (signupCard) signupCard.style.display = 'none';
        if (loginCard) loginCard.style.display = 'block';
        window.scrollTo(0, 0);
      });
    }

    // Toggle signup password visibility
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    const signupPasswordField = document.getElementById('signupPassword');
    if (toggleSignupPassword) {
      toggleSignupPassword.addEventListener('click', function(e) {
        e.preventDefault();
        const type = signupPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        signupPasswordField.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁' : '👁‍🗨';
      });
    }

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    if (toggleConfirmPassword) {
      toggleConfirmPassword.addEventListener('click', function(e) {
        e.preventDefault();
        const type = confirmPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁' : '👁‍🗨';
      });
    }

    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Clear previous errors
      document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const termsCheckbox = document.getElementById('terms').checked;

      let isValid = true;

      // Validate fields
      if (!firstName) {
        const el = document.getElementById('firstNameError');
        if (el) el.textContent = 'First name is required.';
        isValid = false;
      }

      if (!lastName) {
        const el = document.getElementById('lastNameError');
        if (el) el.textContent = 'Last name is required.';
        isValid = false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        const el = document.getElementById('signupEmailError');
        if (el) el.textContent = 'Email is required.';
        isValid = false;
      } else if (!emailPattern.test(email)) {
        const el = document.getElementById('signupEmailError');
        if (el) el.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      if (!password) {
        const el = document.getElementById('signupPasswordError');
        if (el) el.textContent = 'Password is required.';
        isValid = false;
      } else if (password.length < 6) {
        const el = document.getElementById('signupPasswordError');
        if (el) el.textContent = 'Password must be at least 6 characters.';
        isValid = false;
      }

      if (password !== confirmPassword) {
        const el = document.getElementById('confirmPasswordError');
        if (el) el.textContent = 'Passwords do not match.';
        isValid = false;
      }

      if (!termsCheckbox) {
        const el = document.getElementById('termsError');
        if (el) el.textContent = 'You must agree to the terms and conditions.';
        isValid = false;
      }

      if (isValid) {
        // Store user data
        localStorage.setItem('user', JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email,
          loginTime: new Date().getTime()
        }));

        alert(`Welcome, ${firstName}! Your account has been created successfully.`);
        updateLoginUI(email);
        signupForm.reset();
        
        // Switch back to login view
        setTimeout(() => {
          if (signupCard) signupCard.style.display = 'none';
          if (loginCard) loginCard.style.display = 'block';
        }, 500);
      }
    });
  }

  // ===== HANDLE LOGIN BUTTON CLICKS =====
  const headerLoginButtons = document.querySelectorAll('.header-actions .login-button');
  headerLoginButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        // If user is logged in, show logout option
        const logoutOption = confirm(`Logged in as ${user.email}. Click OK to logout.`);
        if (logoutOption) {
          logout();
        }
      } else {
        // Navigate to login page
        window.location.href = 'login.html';
      }
    });
  });

  // ===== RESTORE LOGIN STATE =====
  checkLoginStatus();

  // ===== SEARCH FUNCTIONALITY =====
  const searchButtons = document.querySelectorAll('.header-actions .search-button, .header-actions button[aria-label="Search"]');
  searchButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // On menu page, focus search box; otherwise navigate to menu with search active
      const searchBox = document.querySelector('.search-box input');
      if (searchBox) {
        searchBox.focus();
      } else if (window.location.pathname.includes('menu.html') === false) {
        window.location.href = 'menu.html#search';
      }
    });
  });

  // ===== MENU SEARCH FUNCTIONALITY =====
  const menuSearchInput = document.querySelector('.search-box input');
  if (menuSearchInput) {
    menuSearchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      const menuItems = document.querySelectorAll('.menu-item');
      let matchCount = 0;

      menuItems.forEach(item => {
        const titleEl = item.querySelector('.item-info h3');
        const descEl = item.querySelector('.item-description');
        
        if (titleEl && descEl) {
          const itemName = titleEl.textContent.toLowerCase();
          const itemDescription = descEl.textContent.toLowerCase();
          
          if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm) || searchTerm === '') {
            item.classList.remove('hidden');
            if (searchTerm !== '') {
              item.classList.add('highlighted');
              matchCount++;
            } else {
              item.classList.remove('highlighted');
            }
          } else {
            item.classList.add('hidden');
          }
        }
      });

      // Show "no results" message if search yielded no results
      let noResultsDiv = document.querySelector('.no-results');
      if (searchTerm !== '' && matchCount === 0) {
        if (!noResultsDiv) {
          noResultsDiv = document.createElement('div');
          noResultsDiv.className = 'no-results';
          noResultsDiv.innerHTML = '<span>🔍</span><p>No dishes found matching your search.</p>';
          const container = document.querySelector('.menu-container');
          if (container) container.appendChild(noResultsDiv);
        } else {
          noResultsDiv.style.display = 'block';
        }
      } else if (noResultsDiv) {
        noResultsDiv.style.display = 'none';
      }
    });
  }
});

// ===== HELPER FUNCTIONS =====

function updateLoginUI(email) {
  const loginButtons = document.querySelectorAll('.login-button');
  loginButtons.forEach(btn => {
    btn.textContent = email;
    btn.style.background = '#886522';
    btn.style.color = 'white';
  });
}

function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    updateLoginUI(user.email);
  }

  // Restore remembered email
  const rememberEmail = localStorage.getItem('rememberEmail');
  const emailInput = document.getElementById('email');
  if (rememberEmail && emailInput) {
    emailInput.value = rememberEmail;
  }
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('rememberEmail');
  const loginButtons = document.querySelectorAll('.login-button');
  loginButtons.forEach(btn => {
    btn.textContent = 'Log In';
    btn.style.background = 'white';
    btn.style.color = '#886522';
  });
  alert('You have been logged out.');
}

// Console message for fun
console.log('%cWelcome to Camus Restau! 🍽️', 'font-size: 20px; color: #886522; font-weight: bold;');
console.log('%cBook your table at reservations.html', 'font-size: 14px; color: #666;');
