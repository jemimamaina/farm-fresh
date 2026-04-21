import {
  fetchProducts,
  fetchUsers,
  getProductsByCategory,
  searchProducts,
  fetchTestimonials,
  getProductById,
} from './api.js';

const CURRENT_USER_KEY = 'farmfresh_current_user';
const MARKETPLACE_STATE = {
  category: 'All',
  query: '',
};
let routingInitialized = false;

// Generate UUID v4 for product IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============ NOTIFICATION COMPONENT ============
class Notification {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    this.container.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    if (duration > 0) {
      setTimeout(() => {
        notification.remove();
      }, duration);
    }

    return notification;
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  }

  confirm(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-modal-content">
        <div class="confirm-modal-message">${message}</div>
        <div class="confirm-modal-buttons">
          <button class="confirm-btn-cancel btn btn-secondary">Cancel</button>
          <button class="confirm-btn-confirm btn btn-primary">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector('.confirm-btn-cancel');
    const confirmBtn = modal.querySelector('.confirm-btn-confirm');

    const cleanup = () => {
      modal.remove();
    };

    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      cleanup();
    });

    confirmBtn.addEventListener('click', () => {
      onConfirm();
      cleanup();
    });

    return modal;
  }
}

const notify = new Notification();

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  refreshNav();
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  refreshNav();
}

export function refreshNav() {
  const app = document.getElementById('app');
  const existing = document.getElementById('nav-links');
  if (existing) existing.remove();
  app.prepend(renderNav());
  // Setup nav listeners
  const links = document.getElementById('nav-links');
  if (links) {
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const hash = e.target.getAttribute('href');
        window.location.hash = hash;
      }
    });
  }
}

export function setupRouting() {
  const links = document.getElementById('nav-links');
  if (links) {
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const hash = e.target.getAttribute('href');
        window.location.hash = hash;
      }
    });
  }

  if (!routingInitialized) {
    window.addEventListener('hashchange', renderFromHash);
    routingInitialized = true;
    renderFromHash();
  }
}

function renderFromHash() {
  const hash = window.location.hash || '#home';
  if (hash.startsWith('#product/')) {
    const id = hash.split('/')[1];
    renderProductDetail(id);
    return;
  }
  if (hash.startsWith('#category/')) {
    const category = hash.split('/')[1];
    renderCategoryPage(category);
    return;
  }
  if (hash.startsWith('#search/')) {
    const query = hash.split('/')[1];
    renderSearchResults(query);
    return;
  }
  switch (hash) {
    case '#home':
      renderHome();
      break;
    case '#marketplace':
      renderMarketplace();
      break;
    case '#cart':
      renderCart();
      break;
    case '#login':
      renderLogin();
      break;
    case '#register':
      renderRegister();
      break;
    case '#logout':
      clearCurrentUser();
      window.location.hash = '#home';
      renderHome();
      break;
    case '#farmer':
      renderFarmerDashboard();
      break;
    default:
      renderHome();
  }
}

export function renderNav() {
  const user = getCurrentUser();
  const cartItems = user ? loadCart(user.id) : [];
  console.log(cartItems);
  const cartCount = cartItems.reduce((c, item) => c + item.qty, 0);
  const nav = document.createElement('nav');
  nav.id = 'nav-links';

  const roleLink = user
    ? user.role === 'farmer'
      ? '<a href="#farmer">Farmer</a>'
      : user.role === 'admin'
        ? '<a href="#admin">Admin</a>'
        : ''
    : '';

  const authLinks = user
    ? `<span class="nav-user">Hi, ${user.name}</span><a href="#logout">Logout</a>`
    : `<a href="#login">Login</a><a href="#register">Register</a>`;

  nav.innerHTML = `
    <div class="nav-container">
      <a href="#home" class="nav-brand">🌾 Farm Fresh Direct</a>
      <div class="nav-search">
        <input type="text" id="search-input" placeholder="Search products...">
        <button id="search-btn">Search</button>
      </div>
      <div class="nav-links">
        <a href="#home">Home</a>
        <a href="#marketplace">Browse</a>
        <a href="#cart">Cart  ${cartCount > 0 ? `(${cartCount > 9 ? '9+' : cartCount})` : ''}</a>
        ${roleLink}
        ${authLinks}
      </div>
    </div>
  `;

  return nav;
}

export function attachSearchEventListeners() {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.hash = `#search/${encodeURIComponent(query)}`;
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.hash = `#search/${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

export function renderHome() {
  const main = document.getElementById('main');
  const user = getCurrentUser();
  main.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <h1>🌾 Farm Fresh Direct</h1>
      <p>Connecting Kenyan farmers directly with consumers — fresh, fair, and transparent.</p>
      ${
        !user
          ? `<div class="cta-buttons">
        <a href="#register" class="btn btn-primary">Start as Consumer</a>
        <a href="#farmer" class="btn btn-secondary">Farmer Login</a>
      </div>`
          : ''
      }
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <h2>How It Works</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Browse</h3>
          <p>Explore fresh produce directly from Kenyan farmers.</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Connect</h3>
          <p>Chat with farmers to negotiate and ask questions.</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Order</h3>
          <p>Place your order and choose payment via M-Pesa.</p>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <h3>Receive</h3>
          <p>Get fresh produce delivered or pick up locally.</p>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured">
      <h2>Featured Products</h2>
      <div id="product-list" class="grid"></div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <h2>Shop by Category</h2>
      <div id="categories-list" class="category-grid"></div>
    </section>

    <!-- Why Use Farm Fresh Direct -->
    <section class="why-section">
      <h2>Why Choose Farm Fresh Direct?</h2>
      <div class="benefits">
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <h3>Fresh Produce</h3>
          <p>Directly from farms to your table - guaranteed freshness.</p>
        </div>
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <h3>Fair Prices</h3>
          <p>Eliminate middlemen - better prices for consumers, better income for farmers.</p>
        </div>
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <h3>Direct Connection</h3>
          <p>Chat with farmers, ask questions, and build trust.</p>
        </div>
        <div class="benefit">
          <div class="benefit-icon">✓</div>
          <h3>Support Local</h3>
          <p>Every purchase supports Kenyan farmers and communities.</p>
        </div>
      </div>
    </section>

    <!-- Farmer CTA -->
    <section class="farmer-cta">
      <h2>Are You a Farmer?</h2>
      <p>Join thousands of Kenyan farmers selling directly to consumers.</p>
      <ul>
        <li>✓ Set your own prices</li>
        <li>✓ Manage your products online</li>
        <li>✓ Communicate directly with buyers</li>
        <li>✓ Grow your income</li>
      </ul>
      ${!user ? '<a href="#register" class="btn btn-primary">Register as Farmer</a>' : ''}
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <h2>What Our Community Says</h2>
      <div id="testimonials-list" class="testimonial-grid"></div>
    </section>

    <!-- Footer CTA -->
    <section class="footer-cta">
      <h3>Ready to join the revolution?</h3>
      ${!user ? '<a href="#register" class="btn btn-primary">Get Started Today</a>' : ''}
    </section>
  `;
  loadProducts();
  loadCategories();
  loadTestimonials();
  attachSearchEventListeners();
}

function loadCategories() {
  const categories = [
    { name: 'Fruits', icon: '🍎' },
    { name: 'Vegetables', icon: '�' },
    { name: 'Grains', icon: '🌾' },
    { name: 'Dairy', icon: '🥛' },
  ];
  const container = document.getElementById('categories-list');
  container.innerHTML = categories
    .map(
      (cat) => `
    <a href="#category/${cat.name}" class="category-card">
      <div class="category-icon">${cat.icon}</div>
      <h3>${cat.name}</h3>
    </a>
  `,
    )
    .join('');
}

function loadProducts() {
  const container = document.getElementById('product-list');
  fetchProducts().then((items) => {
    const featured = items.slice(0, 4);
    container.innerHTML = renderProductGridHTML(featured);
    attachProductClickHandlers();
  });
}

function renderProductGridHTML(items) {
  if (!items || items.length === 0) {
    return '<p>No products are available at the moment.</p>';
  }

  return items
    .map(
      (prod) => `
      <div class="product" data-product-id="${prod.id}" style="cursor: pointer;">
        <img src="${prod.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'}" alt="${prod.name}" class="product-image">
        <h3>${prod.name}</h3>
        <p><strong>Category:</strong> ${prod.category}</p>
        <p><strong>Price:</strong> KES ${prod.price}</p>
        <p class="description">${prod.description || ''}</p>
      </div>
    `,
    )
    .join('');
}

function attachProductClickHandlers() {
  const productCards = document.querySelectorAll('.product[data-product-id]');
  productCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const productId = card.dataset.productId;
      if (productId) {
        window.location.hash = `#product/${productId}`;
      }
    });
  });
}

export function renderMarketplace() {
  const main = document.getElementById('main');
  MARKETPLACE_STATE.category = 'All';
  MARKETPLACE_STATE.query = '';

  main.innerHTML = `
    <section class="featured">
      <div class="marketplace-header">
        <h2>Marketplace</h2>
        <p>Browse fresh produce from Kenyan farmers. Filter by category, search by product name, category, or description.</p>
      </div>
      <div class="marketplace-controls">
        <input type="search" id="marketplace-search" placeholder="Search products..." value="">
        <button id="marketplace-search-btn" class="btn btn-secondary">Search</button>
      </div>
      <div class="marketplace-filters">
        <button class="filter-btn active" data-category="All">All</button>
        <button class="filter-btn" data-category="Fruits">Fruits</button>
        <button class="filter-btn" data-category="Vegetables">Vegetables</button>
        <button class="filter-btn" data-category="Grains">Grains</button>
        <button class="filter-btn" data-category="Dairy">Dairy</button>
      </div>
      <div id="marketplace-products" class="grid"></div>
    </section>
  `;

  attachMarketplaceEvents();
  loadMarketplaceProducts();
}

function attachMarketplaceEvents() {
  const searchInput = document.getElementById('marketplace-search');
  const searchBtn = document.getElementById('marketplace-search-btn');
  const filterButtons = document.querySelectorAll('.filter-btn');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      MARKETPLACE_STATE.query = searchInput.value.trim();
      loadMarketplaceProducts();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        MARKETPLACE_STATE.query = searchInput.value.trim();
        loadMarketplaceProducts();
      }
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      MARKETPLACE_STATE.category = button.dataset.category;
      updateMarketplaceFilterButtons(button);
      loadMarketplaceProducts();
    });
  });
}

function updateMarketplaceFilterButtons(activeButton) {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.classList.toggle('active', button === activeButton);
  });
}

function loadMarketplaceProducts() {
  const container = document.getElementById('marketplace-products');
  if (!container) return;

  fetchProducts().then((items) => {
    let filtered = [...items];

    if (MARKETPLACE_STATE.category && MARKETPLACE_STATE.category !== 'All') {
      filtered = filtered.filter(
        (prod) => prod.category === MARKETPLACE_STATE.category,
      );
    }

    if (MARKETPLACE_STATE.query) {
      const q = MARKETPLACE_STATE.query.toLowerCase();
      filtered = filtered.filter(
        (prod) =>
          prod.name.toLowerCase().includes(q) ||
          prod.category.toLowerCase().includes(q) ||
          (prod.description && prod.description.toLowerCase().includes(q)),
      );
    }

    if (filtered.length === 0) {
      container.innerHTML =
        '<p>No products match your search or filter. Try another keyword or category.</p>';
      return;
    }

    container.innerHTML = renderProductGridHTML(filtered);
    attachProductClickHandlers();
  });
}

function loadTestimonials() {
  const container = document.getElementById('testimonials-list');
  if (!container) return;
  fetchTestimonials().then((items) => {
    container.innerHTML = items
      .map(
        (testimonial) => `
      <div class="testimonial">
        <div class="stars">${'⭐'.repeat(testimonial.rating)}</div>
        <p>"${testimonial.quote}"</p>
        <strong>— ${testimonial.author}, ${testimonial.role}</strong>
      </div>
    `,
      )
      .join('');
  });
}

export function renderLogin() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="register-container">
      <form id="login-form" class="register-form">
        <h2>Login</h2>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>

        <button type="submit">Login</button>
      </form>
      <div id="login-message"></div>
    </div>
  `;

  const form = document.getElementById('login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    const msg = document.getElementById('login-message');

    fetchUsers().then((users) => {
      const user = users.find((u) => u.email === email);
      if (!user) {
        msg.textContent = 'No user found';
        msg.style.color = 'red';
        return;
      }

      // If the mock user has a password, validate it; otherwise allow login (existing seed users)
      if (user.password && user.password !== password) {
        msg.textContent = 'Invalid password';
        msg.style.color = 'red';
        return;
      }

      setCurrentUser(user);
      msg.textContent = `Logged in as ${user.name} (${user.role})`;
      msg.style.color = 'green';

      setTimeout(() => {
        if (user.role === 'farmer') {
          window.location.hash = '#farmer';
        } else {
          window.location.hash = '#home';
        }
      }, 800);
    });
  });
}

export function renderRegister() {
  const main = document.getElementById('main');
  main.innerHTML = `
  <div class="register-container">
  <form id="register-form" class="register-form">
  <h2>User Registration</h2>
        <label for="name">Full Name:</label>
        <input type="text" id="name" name="name" required><br>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required><br>
        
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br>
        
        <label for="confirm-password">Confirm Password:</label>
        <input type="password" id="confirm-password" name="confirmPassword" required><br>
        
        <label for="role">Role:</label>
        <select id="role" name="role" required>
          <option value="">Select Role</option>
          <option value="consumer">Buyer/Consumer</option>
          <option value="farmer">Farmer</option>
          <option value="admin">Admin</option>
        </select><br><br />
        
        <button type="submit">Register</button>
      </form>
    </div>
    <div id="register-message"></div>
  `;

  const form = document.getElementById('register-form');
  form.addEventListener('submit', handleRegister);
}

function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const role = formData.get('role');

  const messageDiv = document.getElementById('register-message');

  // Basic validation
  if (password !== confirmPassword) {
    messageDiv.textContent = 'Passwords do not match.';
    messageDiv.style.color = 'red';
    return;
  }

  if (password.length < 6) {
    messageDiv.textContent = 'Password must be at least 6 characters long.';
    messageDiv.style.color = 'red';
    return;
  }

  // Check if email already exists
  fetchUsers().then((users) => {
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      messageDiv.textContent = 'Email already registered.';
      messageDiv.style.color = 'red';
      return;
    }

    // Mock registration - in a real app, this would be an API call
    const newUser = {
      id: generateUUID(),
      name,
      email,
      password,
      role,
      // Add role-specific fields if needed
      ...(role === 'farmer' && { farmLocation: '' }),
      ...(role === 'consumer' && { deliveryAddress: '' }),
    };

    // Store in localStorage for persistence (mock)
    const registeredUsers = JSON.parse(
      localStorage.getItem('registered_users') || '[]',
    );
    registeredUsers.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(registeredUsers));

    // Auto-login after registration
    setCurrentUser(newUser);

    messageDiv.textContent = `Registration successful! Welcome ${name} (${role}). Redirecting...`;
    messageDiv.style.color = 'green';

    // Clear form
    e.target.reset();

    // Redirect after a short delay
    setTimeout(() => {
      if (role === 'farmer') {
        window.location.hash = '#farmer';
      } else {
        window.location.hash = '#home';
      }
    }, 1200);
  });
}

// simple cart stored in localStorage
const CART_KEY_PREFIX = 'farmfresh_cart_';
function getCartKey(userId) {
  return `${CART_KEY_PREFIX}${userId || 'guest'}`;
}
function loadCart(userId = null) {
  if (!userId) {
    const user = getCurrentUser();
    userId = user ? user.id : 'guest';
  }
  const cartKey = getCartKey(userId);
  const raw = localStorage.getItem(cartKey);
  return raw ? JSON.parse(raw) : [];
}
function saveCart(items, userId = null) {
  if (!userId) {
    const user = getCurrentUser();
    userId = user ? user.id : 'guest';
  }
  const cartKey = getCartKey(userId);
  localStorage.setItem(cartKey, JSON.stringify(items));
}

function addToCart(product, quantity = 1) {
  const user = getCurrentUser();
  if (!user) {
    notify.warning('Please log in to add items to cart');
    return;
  }
  const cart = loadCart(user.id);
  const existing = cart.find((c) => c.id === product.id);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image,
    });
  }
  saveCart(cart, user.id);
  notify.success(`Added ${quantity} ${product.name}(s) to cart`);
  refreshNav();
}

// Chat functionality
const CHAT_KEY_PREFIX = 'farmfresh_chat_';

function getChatKey(productId, farmerId) {
  return `${CHAT_KEY_PREFIX}${productId}_${farmerId}`;
}

function loadChatMessages(productId, farmerId) {
  const chatKey = getChatKey(productId, farmerId);
  const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
  const chatMessages = document.getElementById('chat-messages');

  if (messages.length === 0) {
    chatMessages.innerHTML =
      '<p class="no-messages">Start a conversation with the farmer!</p>';
    return;
  }

  chatMessages.innerHTML = messages
    .map(
      (msg) => `
    <div class="chat-message ${msg.sender === 'consumer' ? 'consumer' : 'farmer'}">
      <div class="message-content">${msg.text}</div>
      <div class="message-time">${new Date(msg.timestamp).toLocaleString()}</div>
    </div>
  `,
    )
    .join('');

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage(productId, farmerId, message) {
  const user = getCurrentUser();
  if (!user) {
    notify.warning('Please log in to chat with farmers');
    return;
  }

  const chatKey = getChatKey(productId, farmerId);
  const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');

  const newMessage = {
    id: generateUUID(),
    sender: user.role === 'consumer' ? 'consumer' : 'farmer',
    senderName: user.name,
    text: message,
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);
  localStorage.setItem(chatKey, JSON.stringify(messages));

  loadChatMessages(productId, farmerId);
}

function updateCartQuantity(productId, newQty) {
  const user = getCurrentUser();
  if (!user) return;
  const cart = loadCart(user.id);
  const item = cart.find((c) => c.id === productId);
  if (item) {
    item.qty = newQty;
    saveCart(cart, user.id);
    renderCart(); // Re-render cart to update totals
    refreshNav()
  }
}

function removeFromCart(productId) {
  const user = getCurrentUser();
  if (!user) return;
  const cart = loadCart(user.id);
  const filteredCart = cart.filter((c) => c.id !== productId);
  saveCart(filteredCart, user.id);
  renderCart(); // Re-render cart
  refreshNav();
}

function showPaymentModal(cartItems, total) {
  const modal = document.createElement('div');
  modal.className = 'payment-modal';
  modal.innerHTML = `
    <div class="payment-modal-content">
      <div class="payment-modal-header">
        <h3>Complete Your Order</h3>
        <button id="close-payment" class="close-btn">&times;</button>
      </div>
      <div class="order-summary">
        <h4>Order Summary</h4>
        <ul>
          ${cartItems.map(item => `<li>${item.name} x ${item.qty} - KES ${item.price * item.qty}</li>`).join('')}
        </ul>
        <p><strong>Total: KES ${total}</strong></p>
      </div>
      <form id="payment-form">
        <div class="payment-fields">
          <label for="phone">M-Pesa Phone Number:</label>
          <input type="tel" id="phone" name="phone" placeholder="0712345678" required>
        </div>
        <button type="submit" class="btn btn-primary">Pay Now</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('close-payment').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Fake payment processing
    notify.info('Processing payment...');
    setTimeout(() => {
      notify.success('Payment successful! Order placed.');
      // Clear cart
      const user = getCurrentUser();
      if (user) {
        saveCart([], user.id);
        refreshNav();
      }
      modal.remove();
      // Redirect to home
      window.location.hash = '#home';
    }, 2000);
  });
}

export function renderCart() {
  const main = document.getElementById('main');
  const user = getCurrentUser();
  
  if (!user) {
    main.innerHTML = `
      <div class="cart-status-container">
        <div class="cart-status-content">
          <h2>Your Cart</h2>
          <p>Please log in to view and manage your cart items.</p>
          <div class="cart-status-actions">
            <a href="#login" class="btn btn-primary">Login to View Cart</a>
            <a href="#register" class="btn btn-secondary">Create Account</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const items = loadCart(user.id);
  if (items.length === 0) {
    main.innerHTML = `
      <div class="cart-status-container">
        <div class="cart-status-content">
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any products to your cart yet. Start browsing our fresh produce from Kenyan farmers!</p>
          <div class="cart-status-actions">
            <a href="#marketplace" class="btn btn-primary">Browse Products</a>
            <a href="#home" class="btn btn-secondary">Back to Home</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  main.innerHTML = `
    <div class="cart-container">
      <h2>Your Cart</h2>
      <div class="cart-items">
        ${items
          .map(
            (item) => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h3>${item.name}</h3>
              <p>KES ${item.price} each</p>
              <div class="cart-item-quantity">
                <label>Quantity: </label>
                <input type="number" value="${item.qty}" min="1" data-product-id="${item.id}">
              </div>
            </div>
            <div class="cart-item-total">
              <p>KES ${item.price * item.qty}</p>
              <button class="remove-item" data-product-id="${item.id}">Remove</button>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
      <div class="cart-summary">
        <h3>Total: KES ${total}</h3>
        <button id="checkout-btn" class="btn btn-primary">Proceed to Checkout</button>
      </div>
    </div>
  `;

  // Add event listeners for quantity changes and remove buttons
  document
    .querySelectorAll('.cart-item input[type="number"]')
    .forEach((input) => {
      input.addEventListener('change', (e) => {
        const productId = e.target.dataset.productId;
        const newQty = parseInt(e.target.value);
        updateCartQuantity(productId, newQty);
      });
    });

  document.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      removeFromCart(productId);
    });
  });

  document.getElementById('checkout-btn').addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    const items = loadCart(user.id);
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    showPaymentModal(items, total);
  });
}

export function renderProductDetail(id) {
  const main = document.getElementById('main');
  getProductById(id).then((prod) => {
    if (!prod) {
      main.innerHTML = '<p>Product not found</p>';
      return;
    }

    // Fetch farmer details
    fetchUsers().then((users) => {
      const farmer = users.find((u) => u.id === prod.farmerId);

      main.innerHTML = `
        <div class="product-detail">
          <div class="product-images">
            <img src="${prod.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop'}" alt="${prod.name}" class="detail-image">
          </div>
          <div class="product-info">
            <h2>${prod.name}</h2>
            <p><strong>Category:</strong> ${prod.category}</p>
            <p><strong>Price:</strong> KES ${prod.price} per unit</p>
            <p><strong>Available:</strong> ${prod.quantity || 'N/A'} units</p>
            <p class="product-description">${prod.description || 'No description available.'}</p>

            <div class="add-to-cart-section">
              <label for="quantity">Quantity:</label>
              <input type="number" id="quantity" value="1" min="1" max="${prod.quantity || 99}">
              <button id="add-to-cart" class="btn btn-primary">Add to Cart</button>
            </div>
          </div>

          ${
            farmer
              ? `
          <div class="farmer-info">
            <h3>About the Farmer</h3>
            <div class="farmer-details">
              <div class="farmer-avatar">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="${farmer.name}">
              </div>
              <div class="farmer-contact">
                <h4>${farmer.name}</h4>
                <p><strong>Farm Location:</strong> ${farmer.farmLocation}</p>
                <p><strong>Contact:</strong> ${farmer.contact}</p>
                <button id="chat-with-farmer" class="btn btn-secondary">💬 Chat with Farmer</button>
              </div>
            </div>
          </div>
          `
              : ''
          }

          <div id="chat-modal" class="chat-modal" style="display: none;">
            <div class="chat-modal-content">
              <div class="chat-header">
                <h3>Chat with ${farmer?.name || 'Farmer'}</h3>
                <button id="close-chat" class="close-btn">&times;</button>
              </div>
              <div id="chat-messages" class="chat-messages"></div>
              <div class="chat-input">
                <input type="text" id="chat-input" placeholder="Type your message..." maxlength="500">
                <button id="send-message" class="btn btn-primary">Send</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Add to cart functionality
      document.getElementById('add-to-cart').addEventListener('click', () => {
        const quantity =
          parseInt(document.getElementById('quantity').value) || 1;
        addToCart(prod, quantity);
      });

      // Chat functionality
      if (farmer) {
        const chatBtn = document.getElementById('chat-with-farmer');
        const chatModal = document.getElementById('chat-modal');
        const closeChat = document.getElementById('close-chat');
        const sendMessage = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');

        chatBtn.addEventListener('click', () => {
          chatModal.style.display = 'block';
          loadChatMessages(prod.id, farmer.id);
        });

        closeChat.addEventListener('click', () => {
          chatModal.style.display = 'none';
        });

        sendMessage.addEventListener('click', () => {
          const message = chatInput.value.trim();
          if (message) {
            sendChatMessage(prod.id, farmer.id, message);
            chatInput.value = '';
          }
        });

        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendMessage.click();
          }
        });
      }
    });
  });
}

export function renderFarmerDashboard() {
  const user = getCurrentUser();
  const main = document.getElementById('main');

  if (!user) {
    main.innerHTML = `
      <div class="access-denied-container">
        <div class="access-denied-content">
          <h2>Farmer Dashboard</h2>
          <p>Please <a href="#login">log in</a> first to access this page.</p>
          <a href="#login" class="btn btn-primary">Login Now</a>
        </div>
      </div>
    `;
    return;
  }

  if (user.role !== 'farmer') {
    main.innerHTML = `
      <div class="access-denied-container">
        <div class="access-denied-content">
          <h2>Access Denied</h2>
          <p>This page is only available to farmers. You are logged in as <strong>${user.role}</strong>.</p>
          <a href="#home" class="btn btn-secondary">Go to Home</a>
        </div>
      </div>
    `;
    return;
  }

  main.innerHTML = `
    <h2>Farmer Dashboard</h2>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h3>Welcome, ${user.name}!</h3>
        <button id="add-product-btn" class="btn btn-primary">Add New Product</button>
      </div>

      <div id="product-form" class="product-form" style="display: none;">
        <h4 id="form-title">Add New Product</h4>
        <form id="farmer-product-form">
          <input type="hidden" id="product-id" name="productId">

          <label for="product-name">Product Name:</label>
          <input type="text" id="product-name" name="name" required>

          <label for="product-category">Category:</label>
          <select id="product-category" name="category" required>
            <option value="">Select Category</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
          </select>

          <label for="product-price">Price (KES):</label>
          <input type="number" id="product-price" name="price" min="1" required>

          <label for="product-quantity">Quantity Available:</label>
          <input type="number" id="product-quantity" name="quantity" min="1" required>

          <label for="product-description">Description:</label>
          <textarea id="product-description" name="description" rows="3"></textarea>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Product</button>
            <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <div class="products-section">
        <h3>Your Products</h3>
        <div id="farmer-products-list" class="farmer-products-grid">
          <!-- Products will be loaded here -->
        </div>
      </div>
    </div>
  `;

  // Load farmer's products
  loadFarmerProducts(user.id);

  // Event listeners
  document.getElementById('add-product-btn').addEventListener('click', () => {
    showProductForm();
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    hideProductForm();
  });

  document
    .getElementById('farmer-product-form')
    .addEventListener('submit', (e) => {
      handleProductSubmit(e, user.id);
    });
}

function loadFarmerProducts(farmerId) {
  const container = document.getElementById('farmer-products-list');

  fetchProducts().then((allProducts) => {
    // Get farmer's products from static data and localStorage
    const staticProducts = allProducts.filter((p) => p.farmerId === farmerId);
    const farmerProducts = JSON.parse(
      localStorage.getItem(`farmer_products_${farmerId}`) || '[]',
    );

    const allFarmerProducts = [...staticProducts, ...farmerProducts];

    if (allFarmerProducts.length === 0) {
      container.innerHTML =
        '<p>You haven\'t added any products yet. Click "Add New Product" to get started.</p>';
      return;
    }

    container.innerHTML = allFarmerProducts
      .map(
        (product) => `
      <div class="farmer-product-card">
        <img src="${product.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop'}" alt="${product.name}" class="product-thumb">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Price:</strong> KES ${product.price}</p>
          <p><strong>Quantity:</strong> ${product.quantity} units</p>
          <p class="product-description">${product.description || 'No description'}</p>
        </div>
        <div class="product-actions">
          <button class="btn btn-secondary edit-btn" data-product-id="${product.id}">Edit</button>
          <button class="btn btn-danger delete-btn" data-product-id="${product.id}">Delete</button>
        </div>
      </div>
    `,
      )
      .join('');

    // Add event listeners for edit and delete buttons
    container.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        editProduct(productId, farmerId);
      });
    });

    container.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.productId;
        deleteProduct(productId, farmerId);
      });
    });
  });
}

function showProductForm(product = null) {
  const form = document.getElementById('product-form');
  const formTitle = document.getElementById('form-title');
  const productForm = document.getElementById('farmer-product-form');

  if (product) {
    formTitle.textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-description').value =
      product.description || '';
  } else {
    formTitle.textContent = 'Add New Product';
    productForm.reset();
    document.getElementById('product-id').value = '';
  }

  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}

function hideProductForm() {
  const form = document.getElementById('product-form');
  form.style.display = 'none';
}

function handleProductSubmit(e, farmerId) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const productId = formData.get('productId');
  const product = {
    id: productId || generateUUID(),
    farmerId: farmerId,
    name: formData.get('name'),
    category: formData.get('category'),
    price: parseInt(formData.get('price')),
    quantity: parseInt(formData.get('quantity')),
    description: formData.get('description'),
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop', // Default image
  };

  if (productId) {
    // Update existing product
    updateFarmerProduct(product, farmerId);
  } else {
    // Add new product
    addFarmerProduct(product, farmerId);
  }

  hideProductForm();
  loadFarmerProducts(farmerId);
}

function addFarmerProduct(product, farmerId) {
  const farmerProducts = JSON.parse(
    localStorage.getItem(`farmer_products_${farmerId}`) || '[]',
  );
  farmerProducts.push(product);
  localStorage.setItem(
    `farmer_products_${farmerId}`,
    JSON.stringify(farmerProducts),
  );
}

function updateFarmerProduct(updatedProduct, farmerId) {
  const farmerProducts = JSON.parse(
    localStorage.getItem(`farmer_products_${farmerId}`) || '[]',
  );
  const index = farmerProducts.findIndex((p) => p.id === updatedProduct.id);

  if (index !== -1) {
    farmerProducts[index] = updatedProduct;
    localStorage.setItem(
      `farmer_products_${farmerId}`,
      JSON.stringify(farmerProducts),
    );
  }
}

function deleteProduct(productId, farmerId) {
  notify.confirm('Are you sure you want to delete this product?', () => {
    const farmerProducts = JSON.parse(
      localStorage.getItem(`farmer_products_${farmerId}`) || '[]',
    );
    const filteredProducts = farmerProducts.filter((p) => p.id !== productId);
    localStorage.setItem(
      `farmer_products_${farmerId}`,
      JSON.stringify(filteredProducts),
    );
    loadFarmerProducts(farmerId);
    notify.success('Product deleted successfully');
  });
}

function editProduct(productId, farmerId) {
  // First check localStorage products
  let farmerProducts = JSON.parse(
    localStorage.getItem(`farmer_products_${farmerId}`) || '[]',
  );
  let product = farmerProducts.find((p) => p.id === productId);

  // If not found in localStorage, check static products
  if (!product) {
    fetchProducts().then((allProducts) => {
      product = allProducts.find(
        (p) => p.id === productId && p.farmerId === farmerId,
      );
      if (product) {
        showProductForm(product);
      }
    });
  } else {
    showProductForm(product);
  }
}

export function renderCategoryPage(category) {
  const main = document.getElementById('main');
  main.innerHTML = `<h2>${category}</h2><div id="category-products" class="grid"></div>`;
  getProductsByCategory(category).then((items) => {
    const container = document.getElementById('category-products');
    if (items.length === 0) {
      container.innerHTML = '<p>No products found in this category.</p>';
      return;
    }
    container.innerHTML = renderProductGridHTML(items);
    attachProductClickHandlers();
  });
  attachSearchEventListeners();
}

export function renderSearchResults(query) {
  const main = document.getElementById('main');
  const decodedQuery = decodeURIComponent(query);
  main.innerHTML = `<h2>Search Results for "${decodedQuery}"</h2><div id="search-products" class="grid"></div>`;
  searchProducts(decodedQuery).then((items) => {
    const container = document.getElementById('search-products');
    if (items.length === 0) {
      container.innerHTML = '<p>No products found. Try a different search.</p>';
      return;
    }
    container.innerHTML = renderProductGridHTML(items);
    attachProductClickHandlers();
  });
  attachSearchEventListeners();
}
