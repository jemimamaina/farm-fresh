# 🌾 Farm Fresh Direct

Farm Fresh Direct is a farmer-to-consumer marketplace for Kenyan agriculture. It connects farmers directly with shoppers, reduces middleman overhead, and supports fresh local produce through a web-based buyer and seller experience.

## 📋 Table of Contents
- [Overview](#overview)
- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Backend API](#backend-api)
- [Data](#data)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Farm Fresh Direct enables Kenyan farmers to list produce, manage inventory, and communicate directly with consumers. Consumers can browse fresh local produce, add items to cart, and complete a simulated checkout flow.

## ⭐ Highlights

- Direct farmer-to-consumer marketplace
- Product browsing, search, and category filtering
- Farmer product management and inventory CRUD
- Shopping cart and checkout simulation
- Mock M-Pesa-inspired payment flow
- Backend API with Express and MySQL
- LocalStorage fallback for frontend persistence

## 🛠️ Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- Vite
- HTML5 + CSS3
- Hash-based routing and client-side rendering

### Backend
- Node.js
- Express
- MySQL (`mysql2`)
- CORS-enabled local API

### Packages
- `concurrently` for running both client and server together
- `vite` for frontend development
- `express`, `cors`, `mysql2` for backend API

## 📁 Project Structure

```
farm-fresh/
├── client/                        # Frontend application
│   ├── public/                    # Static assets
│   ├── src/                       # Source files
│   │   ├── css/                   # Styles
│   │   ├── js/                    # Frontend logic
│   │   └── index.html             # App shell
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite config
├── server/                        # Backend application
│   ├── data/                      # Seed data and SQL schema
│   ├── routes/                    # API route definitions
│   ├── db.js                      # MySQL connection helper
│   ├── index.js                   # Server entry point
│   └── package.json               # Backend dependencies
├── docs/                          # Documentation files
├── farm_features.md               # MVP feature plan
└── package.json                   # Monorepo workspace config
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16 or newer
- npm
- MySQL server
- Git

### Install dependencies

```bash
git clone <repository-url>
cd farm-fresh
npm install
```

> `npm install` at the root installs workspaces for both `client` and `server`.

### Configure the backend

The server reads these environment variables:

- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASSWORD` (default: `root`)
- `DB_NAME` (default: `farm_fresh`)

### Create the database

Run the SQL schema and seed script located at `server/data/sql_script.sql`:

```bash
mysql -u root -p
CREATE DATABASE farm_fresh;
USE farm_fresh;
SOURCE server/data/sql_script.sql;
```

### Run locally

Start both services from the root:

```bash
npm run dev
```

Start individually:

```bash
cd client && npm run dev
cd ../server && npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

> The server is designed to start even if the database connection fails, but product and order APIs may be limited in that case.

## 🧪 Scripts

From the root:

- `npm run dev` — run client and server concurrently
- `npm run dev:client` — run frontend only
- `npm run dev:server` — run backend only
- `npm run build` — build the client and run server build placeholder
- `npm run test` — placeholder test command

From `client/`:

- `npm run dev`
- `npm run build`
- `npm run preview`

From `server/`:

- `npm run dev`
- `npm start`

## 📖 Usage

### Consumer flow
1. Browse products across categories
2. Search by name, category, or description
3. View product details and farmer information
4. Add items to cart
5. Checkout with a simulated payment flow
6. Review order status

### Farmer flow
1. Register as a farmer
2. Add and manage product listings
3. Update prices, quantity, and descriptions
4. Use chat to communicate with buyers
5. Track incoming order data

### Data persistence

The frontend uses browser storage for temporary data and fallback behavior, including:

- `farmfresh_current_user`
- `farmfresh_cart`
- `farmer_products_{farmerId}`
- `farmfresh_chat_{productId}_{farmerId}`

## 🔌 Backend API

The current backend API exposes these endpoints under `/api`.

### Products
- `GET /api/products`
- `GET /api/products?category=<category>`
- `GET /api/products/search?q=<term>`
- `GET /api/products/:id`

### Users
- `GET /api/users`

### Orders
- `GET /api/orders`
- `POST /api/orders`

### Testimonials
- `GET /api/testimonials`

### Farmer Products
- `GET /api/farmer/products`
- `GET /api/farmer/products/:farmerId`
- `POST /api/farmer/products`

## 📁 Data

Seed and sample data are available in `server/data`:

- `sql_script.sql` — schema and seed data
- `users.json`
- `products.json`
- `orders.json`
- `testimonials.json`

## 👥 User Roles

### Consumer
- Browse and search products
- Add items to cart
- Checkout and track orders
- Chat with farmers

### Farmer
- Add, update, and manage product listings
- View inventory and product details
- Communicate with buyers
- Access farmer-specific workflows

### Administrator (future)
- Manage users
- Moderate platform content
- Access reporting and analytics

## 🤝 Contributing

We welcome contributions.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally
5. Commit with a clear message
6. Push and open a pull request

### Suggested improvements
- Add backend user authentication
- Implement real payment integration
- Build a farmer order management dashboard
- Add automated tests
- Improve mobile responsiveness
- Expand documentation

## 📄 License

This project is currently configured with the `ISC` license in `package.json`.
