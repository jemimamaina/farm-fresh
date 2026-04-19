const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const router = express.Router();

const users = require(path.join(__dirname, '../data/users.json'));
const products = require(path.join(__dirname, '../data/products.json'));
const orders = require(path.join(__dirname, '../data/orders.json'));
const testimonials = require(path.join(__dirname, '../data/testimonials.json'));

function searchProducts(items, query) {
  const q = query.toLowerCase();
  return items.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      (product.description && product.description.toLowerCase().includes(q)),
  );
}

router.get('/users', (req, res) => {
  res.json(users);
});

router.get('/products', (req, res) => {
  let items = [...products];
  const { category, q } = req.query;

  if (category && category !== 'All') {
    items = items.filter((product) => product.category === category);
  }

  if (q) {
    items = searchProducts(items, q);
  }

  res.json(items);
});

router.get('/products/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  const items = searchProducts(products, q);
  res.json(items);
});

router.get('/products/:id', (req, res) => {
  const id = req.params.id;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

router.get('/orders', (req, res) => {
  res.json(orders);
});

router.post('/orders', (req, res) => {
  const order = req.body;

  if (!order || typeof order !== 'object') {
    return res.status(400).json({ message: 'Invalid order payload' });
  }

  const newOrder = {
    id: randomUUID(),
    ...order,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

router.get('/testimonials', (req, res) => {
  res.json(testimonials);
});

module.exports = router;
