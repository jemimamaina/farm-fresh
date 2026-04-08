# Project Guidelines

## Code Style
- Use ES6+ JavaScript with modern syntax (arrow functions, template literals, destructuring)
- Follow BEM-like CSS naming conventions in [style.css](client/src/css/style.css)
- Reference [ui.js](client/src/js/ui.js) for UI rendering patterns using template literals and `.join('')`

## Architecture
- Monolithic frontend with hash-based routing (no external router library)
- Data persistence via localStorage for MVP scalability
- Promise-based API layer in [api.js](client/src/js/api.js) for easy backend migration
- User roles: Farmer (CRUD products), Consumer (browse/cart/chat), Admin (placeholder)
- See [ProductOverview.md](ProductOverview.md) for vision and scope

## Build and Test
- Install: `cd client/ && npm install`
- Develop: `npm run dev` (runs on http://localhost:5173)
- Build: `npm run build`
- Preview: `npm run preview`
- Testing: Not configured yet (placeholder "npm test" fails)

## Conventions
- Custom notification system replaces native alerts - use `notify.success()`, `notify.error()`, etc. (documented in [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md))
- Data keys: `farmfresh_current_user`, `farmfresh_cart`, `farmer_products_{farmerId}`, `farmfresh_chat_{productId}_{farmerId}`
- Farmer products use `Date.now()` as ID (watch for millisecond collisions)
- UI rendering: Large template literals with `.join('')` for batch updates
- See [farm_features.md](farm_features.md) for feature list by role</content>
<parameter name="filePath">/home/sgatana/projects/eramstech/farm-fresh/.github/copilot-instructions.md