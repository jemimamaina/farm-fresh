# Database Migration Script

This script executes all SQL queries from `sql_script.sql` to set up the Farm Fresh database.

## What it does

The migration script will:
- Drop existing tables (if they exist)
- Create all required tables: `users`, `products`, `orders`, `order_items`, `testimonials`
- Insert sample data for testing
- Create performance indexes

## Usage

### Option 1: Using npm script (recommended)
```bash
cd server
npm run migrate
```

### Option 2: Direct execution
```bash
cd server/data
node migrate.js
```

### Option 3: Make executable and run directly
```bash
cd server/data
chmod +x migrate.js
./migrate.js
```

## Prerequisites

1. **Database Connection**: Ensure your MySQL database is running and accessible
2. **Environment Variables**: Set the following environment variables if different from defaults:
   - `DB_HOST` (default: localhost)
   - `DB_USER` (default: root)
   - `DB_PASSWORD` (default: root)
   - `DB_NAME` (default: farm_fresh)

3. **Database Creation**: The target database should exist. You can create it with:
   ```sql
   CREATE DATABASE IF NOT EXISTS farm_fresh;
   ```

## Output

The script provides detailed output showing:
- Number of SQL statements found
- Progress of each statement execution
- Success/failure status for each statement
- Final summary with counts

## Error Handling

- The script continues executing remaining statements even if some fail
- Failed statements are logged with error details
- The script exits with code 0 on success, 1 on critical failure

## Sample Data

The migration includes sample data for:
- 6 users (farmers, consumers, admin)
- 10 products across different categories
- 1 sample order with order items
- 4 testimonials
- Performance indexes

## Security Note

This script includes sample passwords for testing. In production, ensure passwords are properly hashed and use environment variables for sensitive data.