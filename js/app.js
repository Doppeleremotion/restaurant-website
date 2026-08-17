// Mobile Menu Toggle
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

// Set active navigation link
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

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Handle header action buttons
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

// Form validation for reservation form
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

// Smooth scroll for anchor links
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

// Add hover effects to review cards
const reviewCards = document.querySelectorAll('.review-card');
reviewCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-4px)';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Carousel controls for reviews (if needed)
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

// Lazy loading for images
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

// Console message for fun
console.log('%cWelcome to Camus Restau! 🍽️', 'font-size: 20px; color: #886522; font-weight: bold;');
console.log('%cBook your table at reservations.html', 'font-size: 14px; color: #666;');
