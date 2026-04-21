const API_BASE = '/api';

async function getLocalFarmerProducts() {
  try {
    // Fetch farmer products from the API
    const farmerProducts = await fetchApi('/products');
    return Array.isArray(farmerProducts) ? farmerProducts : [];
  } catch (error) {
    console.warn('Failed to fetch farmer products from API, using localStorage:', error);
    const products = [];
   
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
  return fetchApi('/users');
}

export async function registerUser(userData) {
  return fetchApi('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
}

export async function loginUser(email, password) {
  return fetchApi('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchProducts() {
  // const staticProducts = await fetchApi('/products');
  const farmerProducts = await getLocalFarmerProducts();
  return  farmerProducts;
}

export async function fetchOrders() {
  return fetchApi('/orders');
}

export async function fetchUserOrders(userId) {
  return fetchApi(`/orders/user/${userId}`);
}

export async function fetchOrderById(orderId) {
  return fetchApi(`/orders/${orderId}`);
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

export async function updateOrderStatus(orderId, status, paymentStatus) {
  return fetchApi(`/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, paymentStatus }),
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
  return fetchApi('/products', {
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
    return fetchApi('/products');
  }
  return fetchApi(`/products/${encodeURIComponent(farmerId)}`);
}

