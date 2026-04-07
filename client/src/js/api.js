// simple mock API that imports JSON files and returns promises
import users from '../data/users.json';
import products from '../data/products.json';
import orders from '../data/orders.json';
import testimonials from '../data/testimonials.json';

export function fetchUsers() {
  const staticUsers = users;
  const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
  return Promise.resolve([...staticUsers, ...registeredUsers]);
}

export function fetchProducts() {
  const staticProducts = products;

  // Get all farmer products from localStorage
  const farmerProducts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('farmer_products_')) {
      const products = JSON.parse(localStorage.getItem(key) || '[]');
      farmerProducts.push(...products);
    }
  }

  return Promise.resolve([...staticProducts, ...farmerProducts]);
}

export function fetchOrders() {
  return Promise.resolve(orders);
}

export function fetchTestimonials() {
  return Promise.resolve(testimonials);
}

export function addOrder(order) {
  // in-memory for now; just return the order with an id
  const id = orders.length + 1;
  const newOrder = { id, ...order, status: 'pending', paymentStatus: 'pending', createdAt: new Date().toISOString() };
  orders.push(newOrder);
  return Promise.resolve(newOrder);
}

function resolveAllProducts() {
  const staticProducts = products;
  const farmerProducts = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('farmer_products_')) {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      farmerProducts.push(...saved);
    }
  }
  return [...staticProducts, ...farmerProducts];
}

export function getProductById(id) {
  const allProducts = resolveAllProducts();
  const prod = allProducts.find((p) => p.id === Number(id));
  return Promise.resolve(prod);
}

export function getProductsByCategory(category) {
  const allProducts = resolveAllProducts();
  const filtered = allProducts.filter((p) => p.category === category);
  return Promise.resolve(filtered);
}

export function searchProducts(query) {
  const q = query.toLowerCase();
  const allProducts = resolveAllProducts();
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
  return Promise.resolve(filtered);
}

