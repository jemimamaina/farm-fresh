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
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await queryDatabase('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

router.post('/auth/register', async(req, res) => {
  try {
    const { name, email, password, role, contact, farmLocation, deliveryAddress } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }

    // Check if user already exists
    const existingUsers = await queryDatabase('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const userId = randomUUID();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await queryDatabase(
      'INSERT INTO users (id, role, name, email, password, contact, farm_location, delivery_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, role, name, email, password, contact || null, farmLocation || null, deliveryAddress || null, createdAt],
    );

    const newUser = {
      id: userId,
      role,
      name,
      email,
      contact,
      farmLocation,
      deliveryAddress,
      createdAt,
    };

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
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
router.post('/products', async (req, res) => {
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

router.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await queryDatabase(
      'SELECT * FROM orders WHERE consumer_id = ? ORDER BY created_at DESC',
      [userId],
    );

    // Get order items for each order
    for (let order of orders) {
      const orderItems = await queryDatabase(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id],
      );
      order.items = orderItems;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = await queryDatabase(
      'SELECT * FROM orders WHERE id = ?',
      [orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const orderItems = await queryDatabase(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId],
    );
    order.items = orderItems;

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
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
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
router.post('/products', async (req, res) => {
  try {
    const product = req.body;

    if (!product || typeof product !== 'object') {
      return res.status(400).json({ message: 'Invalid product payload' });
    }

    const productId = randomUUID();
    const farmerId = product.farmerId || null;
    const status = 'pending';
    const paymentStatus = 'pending';
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert product into database
    await queryDatabase(
      'INSERT INTO products (id, consumer_id, status, payment_status, created_at) VALUES (?, ?, ?, ?, ?)',
      [productId, consumerId, status, paymentStatus, createdAt],
    );

    const newProduct = {
      id: productId,
      consumerId,
      items: product.items || [],
      status,
      paymentStatus,
      createdAt,
    };

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    if (!status && !paymentStatus) {
      return res.status(400).json({ message: 'Status or payment status must be provided' });
    }

    let updateFields = [];
    let updateValues = [];

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (paymentStatus) {
      updateFields.push('payment_status = ?');
      updateValues.push(paymentStatus);
    }

    updateValues.push(orderId);

    await queryDatabase(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

router.get('/testimonials', async (req, res) => {
 const testimonials = await queryDatabase('SELECT * from testimonials')
 res.json(testimonials)
})

module.exports = router;
