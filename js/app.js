// Basic student assignment JavaScript: simple menu, review cards, and button messages.

const reviews = [
  { name: 'Mia Anderson', role: 'Local foodie', quote: 'The salmon salad was bright, generous, and tasted like summer. Foodie has quickly become our favorite easy dinner spot.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80' },
  { name: 'James Wilson', role: 'Weekend regular', quote: 'Everything feels thoughtful here, from the warm welcome to the last bite. The flavors are comforting without ever feeling heavy.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
  { name: 'Sofia Martinez', role: 'Table for two', quote: 'A beautiful little place with food that makes you want to slow down. We left with full hearts and plans to come back soon.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80' },
  { name: 'Oliver Brown', role: 'Neighborhood guest', quote: 'The team makes every dish feel personal. Bright plates, quick service, and the kind of atmosphere you remember.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' }
];

let reviewIndex = 0;
const reviewGrid = document.getElementById('reviewGrid');
const menuButton = document.getElementById('menuButton');
const mainNav = document.getElementById('mainNav');

function showReviews() {
  reviewGrid.innerHTML = '';
  for (let offset = 0; offset < reviews.length; offset += 1) {
    const review = reviews[(reviewIndex + offset) % reviews.length];
    const card = document.createElement('article');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-top">
        <img src="${review.image}" alt="${review.name} portrait">
        <div><h3>${review.name}</h3><span>${review.role}</span></div>
      </div>
      <div class="stars" aria-label="5 out of 5 stars">★★★★★</div>
      <p>“${review.quote}”</p>
    `;
    reviewGrid.appendChild(card);
  }
}

menuButton.addEventListener('click', function () {
  const isOpen = mainNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach(function (link) {
  link.addEventListener('click', function () {
    mainNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('previousReview').addEventListener('click', function () {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  showReviews();
});

document.getElementById('nextReview').addEventListener('click', function () {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  showReviews();
});

document.querySelectorAll('[data-message]').forEach(function (button) {
  button.addEventListener('click', function () {
    window.alert(button.dataset.message);
  });
});

showReviews();
