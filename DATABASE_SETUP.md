# Database Setup Guide

## Prerequisites
- MySQL 5.7+ installed and running
- Database management tool (mysql CLI or GUI like MySQL Workbench)

## Setup Steps

### 1. Create Database and User
```bash
mysql -u root -p
```

```sql
CREATE DATABASE farm_fresh;
CREATE USER 'farm_fresh'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON farm_fresh.* TO 'farm_fresh'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Import SQL Schema and Data
```bash
mysql -u farm_fresh -p farm_fresh < server/data/sql_script.sql
```

Enter the password you set above when prompted.

### 3. Configure Environment Variables
Copy the `.env.example` to `.env` and update with your database credentials:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
DB_HOST=localhost
DB_USER=farm_fresh
DB_PASSWORD=your_secure_password
DB_NAME=farm_fresh
PORT=3000
```

### 4. Install Dependencies
```bash
cd server
npm install
cd ..
```

### 5. Start the Server
```bash
npm run dev
```

The server will connect to the database on startup and log a success message.

## Database Tables
- `users` - Farmers, consumers, and admins
- `products` - Product catalog with farmer references
- `orders` - Customer orders
- `order_items` - Individual items within orders
- `testimonials` - Customer reviews

## API Endpoints
All endpoints now query the database:
- `GET /api/users` - Fetch all users
- `GET /api/products` - Fetch all products (supports ?category and ?q query params)
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get product by ID
- `GET /api/orders` - Fetch all orders
- `POST /api/orders` - Create new order
- `GET /api/testimonials` - Fetch all testimonials

## Troubleshooting
- **Connection refused**: Ensure MySQL is running and credentials are correct
- **Database not found**: Run the SQL script first with the steps above
- **Permission denied**: Check user privileges with `GRANT ALL PRIVILEGES`
