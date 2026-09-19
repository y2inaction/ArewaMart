# ArewaMart API Endpoints - Complete Reference

## Authentication (3 endpoints)
```
POST   /api/auth/register           - User registration
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
```

## User Profile (1 endpoint)
```
GET    /api/user/profile            - Get user profile
PATCH  /api/user/profile            - Update user profile
```

## Products & Search (2 endpoints)
```
GET    /api/products                - Search products with filtering & sorting
GET    /api/categories              - List all categories
```

## Cart (1 endpoint)
```
GET    /api/cart                    - Get user's cart
POST   /api/cart                    - Add item to cart
```

## Wishlist (2 endpoints)
```
GET    /api/wishlist                - List wishlist items
POST   /api/wishlist                - Add to wishlist
DELETE /api/wishlist/[id]           - Remove from wishlist
```

## Orders (4 endpoints)
```
GET    /api/orders                  - List user's orders
POST   /api/orders                  - Create new order
GET    /api/orders/[id]             - Get order details
PATCH  /api/orders/[id]             - Update order status
POST   /api/orders/[id]/cancel      - Cancel order
```

## Payments (2 endpoints)
```
POST   /api/payments/initialize     - Initialize Paystack payment
POST   /api/webhooks/paystack       - Handle Paystack webhooks
```

## Reviews (1 endpoint)
```
GET    /api/reviews                 - List product reviews
POST   /api/reviews                 - Create product review
```

## Addresses (2 endpoints)
```
GET    /api/addresses               - List user addresses
POST   /api/addresses               - Create address
PATCH  /api/addresses/[id]          - Update address
DELETE /api/addresses/[id]          - Delete address
```

## Refunds (1 endpoint)
```
GET    /api/refunds                 - List refund requests
POST   /api/refunds                 - Request refund
```

## Support Tickets (1 endpoint)
```
GET    /api/support/tickets         - List support tickets
POST   /api/support/tickets         - Create support ticket
```

## Notifications (2 endpoints)
```
GET    /api/notifications           - List notifications
PATCH  /api/notifications/[id]      - Mark notification read/unread
DELETE /api/notifications/[id]      - Delete notification
```

## Vendors (3 endpoints)
```
GET    /api/vendors                 - List vendors
POST   /api/vendors                 - Register as vendor
GET    /api/vendors/[slug]          - Get vendor profile
```

## Vendor Dashboard (3 endpoints)
```
GET    /api/vendor/products         - List vendor's products
POST   /api/vendor/products         - Create product
GET    /api/vendor/products/[id]    - Get product details
PATCH  /api/vendor/products/[id]    - Update product
DELETE /api/vendor/products/[id]    - Delete product
```

## Communities (1 endpoint)
```
GET    /api/communities             - List communities
```

## Admin - Vendors (2 endpoints)
```
GET    /api/admin/vendors           - List vendors for verification
POST   /api/admin/vendors/[id]/verify - Verify/reject vendor
```

## Admin - Orders (1 endpoint)
```
GET    /api/admin/orders            - List all orders with stats
```

## Admin - Products (2 endpoints)
```
GET    /api/admin/products          - List products for moderation
PATCH  /api/admin/products/[id]     - Toggle product active/featured
```

## Admin - Categories (1 endpoint)
```
GET    /api/admin/categories        - List categories
POST   /api/admin/categories        - Create category
```

## Admin - Dashboard (1 endpoint)
```
GET    /api/admin/dashboard/stats   - Get dashboard statistics
```

---

## Total: 40 API Endpoints

### Authentication Requirements
- Most endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Cookies are set with httpOnly flag for security
- Role-based access control enforced on admin endpoints

### Response Format
All endpoints return JSON:
```json
{
  "data": { /* response body */ },
  "error": "Error message if failed",
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

### Error Handling
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

### Status Codes
- 200: Success
- 201: Created
- 204: No Content
- 4xx: Client Error
- 5xx: Server Error

### Authentication Flow
1. Register: `POST /api/auth/register` → receive JWT token
2. Login: `POST /api/auth/login` → receive JWT token
3. Use token in all subsequent requests: `Authorization: Bearer <token>`
4. Logout: `POST /api/auth/logout` → clear cookies

### Roles (RBAC)
- CUSTOMER: Standard customer access
- VENDOR: Vendor with own products
- VENDOR_STAFF: Staff member of vendor
- COMMUNITY_ADMIN: Community administrator
- COMMUNITY_MANAGER: Community manager
- SUPPORT_AGENT: Support team member
- MODERATOR: Content moderator
- OPERATIONS_ADMIN: Operations administrator
- FINANCE_ADMIN: Finance administrator
- SUPER_ADMIN: Full system access

### Rate Limiting
Not yet implemented - plan to add:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for authenticated users

### Pagination
Applied to list endpoints:
- `page`: 1-indexed page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- Response includes: `total`, `pages`, `page`, `limit`

### Filtering & Sorting
Product search supports:
- Filter by: category, vendor, price range (minPrice/maxPrice), featured
- Sort by: newest, oldest, price-low, price-high, featured, popular
