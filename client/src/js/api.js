const API_BASE = '/api';

function getLocalRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('registered_users') || '[]');
  } catch {
    return [];
  }
}

function getLocalFarmerProducts() {
  const farmerProducts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('farmer_products_')) {
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(stored)) {
          farmerProducts.push(...stored);
        }
      } catch {
        // ignore invalid stored values
      }
    }
  }
  return farmerProducts;
}

function filterLocalProducts({ category, q } = {}) {
  let items = getLocalFarmerProducts();
  if (category && category !== 'All') {
    items = items.filter((product) => product.category === category);
  }
  if (q) {
    const lowered = q.toLowerCase();
    items = items.filter(
      (product) =>
        product.name.toLowerCase().includes(lowered) ||
        product.category.toLowerCase().includes(lowered) ||
        (product.description && product.description.toLowerCase().includes(lowered)),
    );
  }
  return items;
}

async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

export async function fetchUsers() {
  const staticUsers = await fetchApi('/users');
  return [...staticUsers, ...getLocalRegisteredUsers()];
}

export async function fetchProducts() {
  const staticProducts = await fetchApi('/products');
  return [...staticProducts, ...getLocalFarmerProducts()];
}

export async function fetchOrders() {
  return fetchApi('/orders');
}

export async function fetchTestimonials() {
  return fetchApi('/testimonials');
}

export async function addOrder(order) {
  return fetchApi('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
}

async function resolveAllProducts() {
  const staticProducts = await fetchApi('/products');
  return [...staticProducts, ...getLocalFarmerProducts()];
}

export async function getProductById(id) {
  const allProducts = await resolveAllProducts();
  return allProducts.find((p) => p.id === Number(id));
}

export async function getProductsByCategory(category) {
  if (!category || category === 'All') {
    return resolveAllProducts();
  }
  const staticProducts = await fetchApi(`/products?category=${encodeURIComponent(category)}`);
  return [...staticProducts, ...filterLocalProducts({ category })];
}

export async function searchProducts(query) {
  if (!query) {
    return resolveAllProducts();
  }
  const staticProducts = await fetchApi(`/products/search?q=${encodeURIComponent(query)}`);
  return [...staticProducts, ...filterLocalProducts({ q: query })];
}

