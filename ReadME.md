# 🌾 Farm Fresh Direct

A direct farmer-to-consumer marketplace platform connecting Kenyan farmers with consumers, eliminating exploitative intermediaries and promoting fair trade in local agriculture.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Farm Fresh Direct is a web-based marketplace that revolutionizes agricultural commerce in Kenya by creating direct connections between local farmers and consumers. The platform enables farmers to set their own prices, communicate directly with buyers, and maintain control over their produce while providing consumers with fresh, locally-sourced products at fair prices.

### Mission
- **For Farmers**: Eliminate middlemen exploitation, provide fair pricing, and enable direct consumer relationships
- **For Consumers**: Access fresh, local produce at transparent prices with direct farmer communication
- **For Community**: Support sustainable local agriculture and strengthen Kenyan farming communities

## ✨ Features

### 🛒 Core Marketplace Features
- **Product Catalog**: Browse fresh produce from verified Kenyan farmers
- **Category Filtering**: Filter by Fruits, Vegetables, Grains, and Dairy
- **Advanced Search**: Search across product names, categories, and descriptions
- **Product Details**: Comprehensive product information with images and farmer details
- **Shopping Cart**: Persistent cart with quantity management

### 👥 User Management
- **Dual User Roles**: Separate interfaces for farmers and consumers
- **Secure Authentication**: Registration and login with role-based access
- **Profile Management**: Personalized dashboards for each user type

### 🌱 Farmer Features
- **Product Management**: Add, edit, and manage product listings
- **Dashboard**: Overview of products, orders, and communications
- **Direct Communication**: Chat interface with potential buyers

### 🛍️ Consumer Features
- **Easy Browsing**: Intuitive product discovery and filtering
- **Farmer Connection**: Chat with farmers for questions and negotiations
- **Order Management**: Track orders and payment status

### 💳 Payment Integration
- **M-Pesa Simulation**: Mock payment flow for Kenyan mobile money
- **Order Tracking**: Real-time order and payment status updates

### 📱 User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Green Theme**: Agricultural branding with clean, accessible UI
- **Intuitive Navigation**: Hash-based routing for seamless browsing

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design
- **Routing**: Hash-based client-side routing

### Backend (Planned)
- **Runtime**: Node.js
- **Database**: MySQL
- **API**: RESTful endpoints
- **Authentication**: Session-based with role management

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Development Server**: Vite Dev Server

## 📁 Project Structure

```
farm-fresh/
├── client/                          # Frontend application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── css/
│   │   │   └── style.css           # Main stylesheet
│   │   ├── data/                   # Mock data files
│   │   │   ├── products.json       # Product catalog
│   │   │   ├── users.json          # User data
│   │   │   ├── orders.json         # Order history
│   │   │   └── testimonials.json   # Customer reviews
│   │   ├── js/
│   │   │   ├── main.js             # Application entry point
│   │   │   ├── ui.js               # UI rendering and interactions
│   │   │   └── api.js              # Mock API layer
│   │   └── index.html              # Main HTML template
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── server/                          # Backend application (planned)
├── docs/                            # Documentation
├── farm_features.md                 # Feature specifications
└── README.md                        # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farm-fresh
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Development Workflow

- **Development**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - Creates production build in `dist/`
- **Preview**: `npm run preview` - Preview production build locally

## 📖 Usage

### For Consumers
1. **Browse Products**: Visit the marketplace to explore fresh produce
2. **Search & Filter**: Use search bar or category filters to find specific items
3. **View Details**: Click on products to see full details and farmer information
4. **Chat with Farmers**: Use the chat feature to ask questions or negotiate
5. **Add to Cart**: Select quantities and add items to your shopping cart
6. **Checkout**: Complete your order with M-Pesa payment simulation

### For Farmers
1. **Register**: Create a farmer account with your farm details
2. **Add Products**: Use the farmer dashboard to list your produce
3. **Manage Inventory**: Update prices, quantities, and product information
4. **Communicate**: Chat with interested buyers
5. **Track Orders**: Monitor order status and customer interactions

### Navigation
- **Home**: Landing page with featured products and categories
- **Browse**: Full marketplace with search and filtering
- **Cart**: View and manage shopping cart
- **Login/Register**: User authentication
- **Farmer Dashboard**: Product management (farmers only)

## 👤 User Roles

### Consumer
- Browse and search products
- View detailed product information
- Chat with farmers
- Add items to cart and checkout
- Track order status

### Farmer
- Manage product listings (CRUD operations)
- View farmer dashboard
- Communicate with consumers
- Update product availability and pricing
- Access farmer-specific features

### Administrator (Future)
- Platform management
- User moderation
- Analytics and reporting

## 🔌 API Documentation

### Mock API Endpoints (Current Implementation)

#### Products
- `fetchProducts()` - Get all products
- `getProductById(id)` - Get specific product
- `getProductsByCategory(category)` - Filter by category
- `searchProducts(query)` - Search products

#### Users
- `fetchUsers()` - Get all users
- `getCurrentUser()` - Get logged-in user

#### Orders & Cart
- Cart managed via localStorage
- Order simulation for checkout flow

#### Communication
- Chat messages stored in localStorage
- Farmer-consumer messaging simulation

### Future Backend API
RESTful endpoints planned for:
- `/api/products` - Product management
- `/api/users` - User authentication and profiles
- `/api/orders` - Order processing
- `/api/chat` - Messaging system
- `/api/payments` - Payment processing

## 🤝 Contributing

We welcome contributions to Farm Fresh Direct! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

### Guidelines
- Follow existing code style and structure
- Add comments for complex logic
- Test UI changes across different screen sizes
- Ensure accessibility compliance
- Update documentation as needed

### Areas for Contribution
- Backend API development
- UI/UX improvements
- Mobile responsiveness
- Performance optimization
- Testing implementation
- Documentation enhancement

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Kenyan agricultural community
- Inspired by the need for fair trade in local farming
- Dedicated to supporting sustainable agriculture

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

**Farm Fresh Direct** - Connecting farmers and consumers for a better tomorrow 🌱