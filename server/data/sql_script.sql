-- Farm Fresh Database Schema and Data
-- Using UUID (GUID) for all primary and foreign keys
-- Created for MySQL/PostgreSQL compatibility

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS testimonials;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  contact VARCHAR(20),
  farm_location VARCHAR(255),
  delivery_address VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Products Table
-- ============================================
CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  farmer_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY,
  consumer_id CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (consumer_id) REFERENCES users(id)
);

-- ============================================
-- Order Items Table (for product items in orders)
-- ============================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- Testimonials Table
-- ============================================
CREATE TABLE testimonials (
  id CHAR(36) PRIMARY KEY,
  quote TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DATA - Users
-- ============================================
INSERT INTO users (id, role, name, email, contact, farm_location, is_featured) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'farmer', 'Joseph Mwangi', 'joseph@example.com', '0700123456', 'Kiambu', TRUE);

INSERT INTO users (id, role, name, email, contact, farm_location) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'farmer', 'Peter Kipchoge', 'peter@example.com', '0722334455', 'Kericho');

INSERT INTO users (id, role, name, email, contact, farm_location) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'farmer', 'Jane Wanjiru', 'jane@example.com', '0733445566', 'Mombasa');

INSERT INTO users (id, role, name, email, contact, delivery_address) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'consumer', 'Alice Njeri', 'alice@example.com', '0744556677', 'Nairobi');

INSERT INTO users (id, role, name, email, contact, delivery_address) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'consumer', 'David Okoro', 'david@example.com', '0755667788', 'Nakuru');

INSERT INTO users (id, role, name, email, contact) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'admin', 'Admin User', 'admin@farmfresh.com', '0799999999');

-- ============================================
-- INSERT DATA - Products
-- ============================================
INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Avocado - Hass', 'Fruits', 150.00, 100, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop', 'Fresh, creamy Hass avocados from Kiambu farms');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Tomatoes', 'Vegetables', 50.00, 200, 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=300&h=300&fit=crop', 'Ripe, juicy tomatoes perfect for cooking');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Bell Peppers', 'Vegetables', 120.00, 80, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop', 'Colorful bell peppers - red, yellow, green');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Maize (Corn)', 'Grains', 80.00, 150, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop', 'Fresh sweet corn from the field');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'Fresh Milk - Organic', 'Dairy', 120.00, 50, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop', 'Grade A organic milk from free-range cattle');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Oranges - Valencia', 'Fruits', 80.00, 160, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop', 'Juicy Valencia oranges, perfect for juice and fresh eating');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Potatoes', 'Vegetables', 60.00, 250, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop', 'Quality potatoes for all your cooking needs');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Carrots', 'Vegetables', 40.00, 200, 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=300&h=300&fit=crop', 'Sweet orange carrots, freshly harvested');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Cabbage', 'Vegetables', 30.00, 180, 'https://images.unsplash.com/photo-1598030304678-0a8c3272de4c?w=300&h=300&fit=crop', 'Fresh green cabbage');

INSERT INTO products (id, farmer_id, name, category, price, quantity, image, description) VALUES
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Mangoes', 'Fruits', 100.00, 120, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop', 'Sweet, succulent mangoes from coastal regions');

-- ============================================
-- INSERT DATA - Orders
-- ============================================
INSERT INTO orders (id, consumer_id, status, payment_status, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'pending', 'pending', '2026-02-25 10:00:00');

-- ============================================
-- INSERT DATA - Order Items
-- ============================================
INSERT INTO order_items (order_id, product_id, quantity) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 5);

-- ============================================
-- INSERT DATA - Testimonials
-- ============================================
INSERT INTO testimonials (id, quote, author, role, rating) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Farm Fresh Direct helped me reach customers directly without middlemen. My income doubled in just 3 months!', 'Joseph Mwangi', 'Farmer', 5);

INSERT INTO testimonials (id, quote, author, role, rating) VALUES
('850e8400-e29b-41d4-a716-446655440002', 'The freshest produce I''ve ever bought, at fair prices. I love supporting local Kenyan farmers directly.', 'Alice Njeri', 'Consumer', 5);

INSERT INTO testimonials (id, quote, author, role, rating) VALUES
('850e8400-e29b-41d4-a716-446655440003', 'No more dealing with exploitative brokers. The platform is easy to use and the prices are transparent.', 'Mary Kipchoge', 'Farmer', 5);

INSERT INTO testimonials (id, quote, author, role, rating) VALUES
('850e8400-e29b-41d4-a716-446655440004', 'I can chat directly with farmers and negotiate prices. It feels like building real relationships.', 'David Okoro', 'Consumer', 5);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_consumer_id ON orders(consumer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_users_email ON users(email);
