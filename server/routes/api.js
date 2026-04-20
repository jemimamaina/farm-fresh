const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();
const { queryDatabase } = require('../db');

// Helper function to search products at application level
function searchProducts(items, query) {
  const q = query.toLowerCase();
  return items.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      (product.description && product.description.toLowerCase().includes(q)),
  );
}

router.get('/users', async (req, res) => {
  try {
    const users = await queryDatabase('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const { category, q } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (category && category !== 'All') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    let items = await queryDatabase(query, params);

    // Apply search filter if provided
    if (q) {
      items = searchProducts(items, q);
    }

    res.json(items);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const items = await queryDatabase('SELECT * FROM products');
    const filtered = searchProducts(items, q);
    res.json(filtered);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await queryDatabase(
      'SELECT * FROM products WHERE id = ?',
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await queryDatabase('SELECT * FROM orders');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const order = req.body;

    if (!order || typeof order !== 'object') {
      return res.status(400).json({ message: 'Invalid order payload' });
    }

    const orderId = randomUUID();
    const consumerId = order.consumerId || null;
    const status = 'pending';
    const paymentStatus = 'pending';
    const createdAt = new Date().toISOString();

    // Insert order into database
    await queryDatabase(
      'INSERT INTO orders (id, consumer_id, status, payment_status, created_at) VALUES (?, ?, ?, ?, ?)',
      [orderId, consumerId, status, paymentStatus, createdAt],
    );

    // Insert order items if provided
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        await queryDatabase(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [orderId, item.productId, item.quantity],
        );
      }
    }

    const newOrder = {
      id: orderId,
      consumerId,
      items: order.items || [],
      status,
      paymentStatus,
      createdAt,
    };

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await queryDatabase('SELECT * FROM testimonials');
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

// Farmer products endpoints
router.get('/farmer/products', async (req, res) => {
  try {
    const products = await queryDatabase('SELECT * FROM products WHERE farmer_id IS NOT NULL');
    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Failed to fetch farmer products' });
  }
});

router.get('/farmer/products/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const products = await queryDatabase(
      'SELECT * FROM products WHERE farmer_id = ?',
      [farmerId],
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    res.status(500).json({ message: 'Failed to fetch farmer products' });
  }
});

router.post('/farmer/products', async (req, res) => {
  try {
    const { farmerId, name, category, price, quantity, image, description } = req.body;

    if (!farmerId || !name || !category || !price || quantity === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: farmerId, name, category, price, quantity',
      });
    }

    const productId = randomUUID();
    const createdAt = new Date().toISOString();

    await queryDatabase(
      'INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [productId, farmerId, name, category, price, quantity, image || null, description || null],
    );

    const newProduct = {
      id: productId,
      farmer_id: farmerId,
      name,
      category,
      price,
      quantity,
      image: image || null,
      description: description || null,
    };

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating farmer product:', error);
    res.status(500).json({ message: 'Failed to create farmer product' });
  }
});

module.exports = router;
