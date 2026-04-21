const API_BASE = '/api';

function getLocalRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('registered_users') || '[]');
  } catch {
    return [];
  }
}

async function getLocalFarmerProducts() {
  try {
    // Fetch farmer products from the API
    const farmerProducts = await fetchApi('/farmer/products');
    return Array.isArray(farmerProducts) ? farmerProducts : [];
  } catch (error) {
    console.warn('Failed to fetch farmer products from API, using localStorage:', error);
    // Fallback to localStorage if API fails
    const products = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('farmer_products_')) {
        try {
          const stored = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(stored)) {
            products.push(...stored);
          }
        } catch {
          // ignore invalid stored values
        }
      }
    }
    return products;
  }
}

function filterLocalProducts({ category, q } = {}) {
  const farmerProducts = getLocalFarmerProducts();
  // If it's a promise, return a promise
  if (farmerProducts instanceof Promise) {
    return farmerProducts.then((items) => {
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
    });
  }
  // Otherwise handle it synchronously (for backwards compatibility)
  let items = farmerProducts;
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
  // const staticProducts = await fetchApi('/products');
  const farmerProducts = await getLocalFarmerProducts();
  return  farmerProducts;
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
  const farmerProducts = await getLocalFarmerProducts();
  return [...staticProducts, ...farmerProducts];
}

export async function getProductById(id) {
  try {
    const staticProduct = await fetchApi(`/products/${encodeURIComponent(id)}`);
    return staticProduct;
  } catch (error) {
    // Fallback to local farmer products if the server does not have the item
    const localProducts = await getLocalFarmerProducts();
    return localProducts.find((p) => p.id === id);
  }
}

export async function getProductsByCategory(category) {
  if (!category || category === 'All') {
    return resolveAllProducts();
  }
  const staticProducts = await fetchApi(`/products?category=${encodeURIComponent(category)}`);
  const farmerProducts = await getLocalFarmerProducts();
  const filteredFarmerProducts = farmerProducts.filter(
    (product) => product.category === category,
  );
  return [...staticProducts, ...filteredFarmerProducts];
}

export async function searchProducts(query) {
  if (!query) {
    return resolveAllProducts();
  }
  const staticProducts = await fetchApi(`/products/search?q=${encodeURIComponent(query)}`);
  const farmerProducts = await getLocalFarmerProducts();
  const lowered = query.toLowerCase();
  const filteredFarmerProducts = farmerProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowered) ||
      product.category.toLowerCase().includes(lowered) ||
      (product.description && product.description.toLowerCase().includes(lowered)),
  );
  return [...staticProducts, ...filteredFarmerProducts];
}

export async function addFarmerProduct(farmerId, productData) {
  return fetchApi('/farmer/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      farmerId,
      ...productData,
    }),
  });
}

export async function getFarmerProducts(farmerId) {
  if (!farmerId) {
    return fetchApi('/farmer/products');
  }
  return fetchApi(`/farmer/products/${encodeURIComponent(farmerId)}`);
}

