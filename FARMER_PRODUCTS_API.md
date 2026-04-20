# Farmer Products API Migration

## Overview
Replaced all instances of `getLocalFarmerProducts()` with API calls to enable persistent storage of farmer products in the database instead of localStorage.

## Server Changes

### New API Endpoints (server/routes/api.js)

#### 1. GET /farmer/products
Retrieves all farmer products from the database.
```
GET /api/farmer/products
Response: Array of product objects
```

#### 2. GET /farmer/products/:farmerId
Retrieves products for a specific farmer.
```
GET /api/farmer/products/{farmerId}
Response: Array of product objects created by the farmer
```

#### 3. POST /farmer/products
Creates a new farmer product in the database.
```
POST /api/farmer/products
Body: {
  farmerId: string (UUID),
  name: string (required),
  category: string (required),
  price: number (required),
  quantity: number (required),
  image: string (optional),
  description: string (optional)
}
Response: 201 Created with the new product object
```

## Client Changes

### Updated Functions (client/src/js/api.js)

#### 1. getLocalFarmerProducts() - Now Async
- **Before**: Synchronous function fetching from localStorage
- **After**: Async function that calls `GET /farmer/products` API
- **Fallback**: If API fails, falls back to localStorage for backwards compatibility
- Returns all farmer products from the database

```javascript
async function getLocalFarmerProducts() {
  try {
    const farmerProducts = await fetchApi('/farmer/products');
    return Array.isArray(farmerProducts) ? farmerProducts : [];
  } catch (error) {
    // Fallback to localStorage if API fails
    ...
  }
}
```

#### 2. Updated Dependent Functions
All functions that depended on `getLocalFarmerProducts()` are now async:
- `fetchProducts()` - Combines database products with farmer products
- `getProductById()` - Includes farmer products in fallback
- `getProductsByCategory()` - Filters farmer products by category
- `searchProducts()` - Searches farmer products by query
- `resolveAllProducts()` - Returns all products (database + farmer)

All these functions now properly `await` the promise returned by `getLocalFarmerProducts()`.

#### 3. New Functions

**addFarmerProduct(farmerId, productData)**
```javascript
export async function addFarmerProduct(farmerId, productData) {
  return fetchApi('/farmer/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ farmerId, ...productData })
  });
}
```
Creates a new farmer product in the database. Use this instead of directly writing to localStorage.

**getFarmerProducts(farmerId)**
```javascript
export async function getFarmerProducts(farmerId) {
  if (!farmerId) {
    return fetchApi('/farmer/products');
  }
  return fetchApi(`/farmer/products/${encodeURIComponent(farmerId)}`);
}
```
Retrieves products for a specific farmer or all farmer products.

## Migration Path

### Phase 1 (Current)
✓ API endpoints created
✓ Client functions updated to use API
✓ Fallback to localStorage for backwards compatibility

### Phase 2 (Next Steps)
- Update `ui.js` to call `addFarmerProduct()` when creating products instead of localStorage
- Remove direct localStorage writes for farmer products
- Update product edit/delete operations to use API endpoints

### Phase 3 (Future)
- Remove localStorage fallback once all farmers' products are persisted in database
- Deprecate localStorage-based farmer product storage

## Example Usage

### Fetching Farmer Products
```javascript
import { getFarmerProducts } from './api.js';

// Get all farmer products
const allFarmerProducts = await getFarmerProducts();

// Get specific farmer's products
const farmerSpecificProducts = await getFarmerProducts('550e8400-e29b-41d4-a716-446655440001');
```

### Creating a Farmer Product
```javascript
import { addFarmerProduct } from './api.js';

const newProduct = await addFarmerProduct('550e8400-e29b-41d4-a716-446655440001', {
  name: 'Organic Tomatoes',
  category: 'Vegetables',
  price: 5.99,
  quantity: 100,
  image: 'tomatoes.jpg',
  description: 'Fresh organic tomatoes from our farm'
});
```

## Database Schema Update
The existing `products` table already supports farmer products:
- `farmer_id` column stores the UUID of the farmer who created the product
- Products with a `farmer_id` are automatically identified as farmer products
- Products with NULL `farmer_id` are from seed data or system products

## Error Handling
- If the database is unavailable, the API falls back to localStorage for farmer products
- Failed API calls for creating products will throw an error with appropriate message
- All errors are logged to console for debugging

## Testing Recommendations
1. Test farmer product creation through the API
2. Verify products appear in listings after creation
3. Test fallback to localStorage when database is unavailable
4. Verify product search and filtering includes farmer products
5. Test product edit/delete operations (when implemented)
