# ArewaMart API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://arewamart.com/api`

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are automatically set as HTTP-only cookies during login/registration.

---

## Authentication Endpoints

### POST /auth/register

Register a new customer account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "2348000000000"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  },
  "token": "jwt-token"
}
```

### POST /auth/login

Login to existing account.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
  "token": "jwt-token"
}
```

### POST /auth/logout

Logout current session. Requires authentication.

**Response (200):**
```json
{ "success": true }
```

---

## Products Endpoints

### GET /products

Fetch products with filtering, sorting, and pagination.

**Query Parameters:**
- `q` - Search query (searches name and Hausa name)
- `category` - Filter by category slug
- `vendor` - Filter by vendor slug
- `minPrice` - Minimum price in kobo
- `maxPrice` - Maximum price in kobo
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)

**Example:**
```
GET /products?q=kaftan&category=fashion&minPrice=40000&maxPrice=60000&page=1
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "product-id",
      "name": "Premium Hausa Kaftan",
      "nameHa": "Babbar Jallabiya ta Hausa",
      "price": 45000,
      "compareAt": 55000,
      "stock": 25,
      "vendor": { "id": "...", "name": "...", "slug": "..." },
      "category": { "id": "...", "name": "...", "slug": "..." },
      "images": [{ "url": "...", "alt": "..." }],
      "rating": 4.5,
      "reviewCount": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "pages": 3
  }
}
```

### GET /products/[slug]

Fetch single product by slug.

**Response (200):**
```json
{
  "id": "product-id",
  "name": "Premium Hausa Kaftan",
  "nameHa": "Babbar Jallabiya ta Hausa",
  "description": "...",
  "descriptionHa": "...",
  "price": 45000,
  "stock": 25,
  "vendor": { "id": "...", "name": "...", "slug": "...", "verified": true },
  "reviews": [ /* Review objects */ ]
}
```

---

## Categories Endpoints

### GET /categories

Fetch all product categories.

**Response (200):**
```json
[
  {
    "id": "cat-id",
    "name": "Fashion",
    "nameHa": "Kayan Sawa",
    "slug": "fashion",
    "icon": null
  }
]
```

---

## Vendors Endpoints

### GET /vendors

Fetch vendors with optional filtering.

**Query Parameters:**
- `verified` - Filter by verification status (true/false)
- `community` - Filter by community slug

**Response (200):**
```json
[
  {
    "id": "vendor-id",
    "name": "Arewa Fashion House",
    "slug": "arewa-fashion-house",
    "description": "...",
    "verified": true,
    "rating": 4.8,
    "reviewCount": 45,
    "fulfillmentRate": 0.98,
    "responseRate": 0.95,
    "community": { "id": "...", "name": "Dandalin Saye da Sayarwa" }
  }
]
```

### GET /vendors/[slug]

Fetch vendor details with products and reviews.

**Response (200):**
```json
{
  "id": "vendor-id",
  "name": "Arewa Fashion House",
  "slug": "arewa-fashion-house",
  "description": "...",
  "logoUrl": "...",
  "coverUrl": "...",
  "verified": true,
  "rating": 4.8,
  "products": [ /* Product array */ ],
  "reviews": [ /* Review array */ ]
}
```

### POST /vendors

Register as a vendor. Requires authentication.

**Request:**
```json
{
  "name": "My Shop",
  "slug": "my-shop",
  "description": "Shop description",
  "phone": "2348000000000",
  "whatsapp": "2348000000000",
  "location": "Kano, Nigeria",
  "communityId": "community-id-optional"
}
```

**Response (201):**
```json
{
  "id": "vendor-id",
  "name": "My Shop",
  "slug": "my-shop",
  "verified": false,
  "verificationStatus": "pending"
}
```

---

## Cart Endpoints

### GET /cart

Fetch current user's cart. Requires authentication.

**Response (200):**
```json
{
  "id": "cart-id",
  "userId": "user-id",
  "items": [
    {
      "id": "item-id",
      "productId": "product-id",
      "quantity": 2,
      "product": { /* Full product object */ }
    }
  ]
}
```

### POST /cart

Add item to cart. Requires authentication.

**Request:**
```json
{
  "productId": "product-id",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "id": "item-id",
  "cartId": "cart-id",
  "productId": "product-id",
  "quantity": 2
}
```

### DELETE /cart/[itemId]

Remove item from cart. Requires authentication.

**Response (200):**
```json
{ "success": true }
```

---

## Orders Endpoints

### POST /orders

Create a new order. Requires authentication.

**Request:**
```json
{
  "items": [
    { "productId": "product-id", "quantity": 2 }
  ],
  "address": "123 Main St, Kano, Nigeria",
  "deliveryNote": "Please deliver in the morning"
}
```

**Response (201):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-2024-00001",
  "status": "PENDING_PAYMENT",
  "subtotal": 90000,
  "deliveryFee": 5000,
  "total": 95000,
  "items": [ /* OrderItem array */ ]
}
```

### GET /orders

Fetch user's orders. Requires authentication.

**Response (200):**
```json
[
  {
    "id": "order-id",
    "orderNumber": "ORD-2024-00001",
    "status": "DELIVERED",
    "total": 95000,
    "createdAt": "2024-09-19T10:00:00Z",
    "items": [ /* OrderItem array */ ]
  }
]
```

### GET /orders/[orderId]

Fetch order details. Requires authentication and ownership.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "errors": [
    { "path": "email", "message": "Invalid email" }
  ]
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited:
- **Authenticated endpoints**: 1000 requests/hour
- **Public endpoints**: 100 requests/hour

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

---

## Webhook Events

### Payment Verification

After successful payment, a webhook is sent to your configured endpoint:

```json
{
  "event": "payment.verified",
  "orderId": "order-id",
  "orderNumber": "ORD-2024-00001",
  "amount": 95000,
  "currency": "NGN",
  "reference": "paystack-ref-id",
  "timestamp": "2024-09-19T10:00:00Z"
}
```

Webhook signature verification:
```
X-Signature: sha256=<HMAC-SHA256 of payload>
```

---

## SDK/Client Libraries

### JavaScript/TypeScript

```typescript
const response = await fetch('https://arewamart.com/api/products?category=fashion', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { products } = await response.json();
```

---

## Changelog

### v1.0.0 (2024-09)
- Initial API release
- Products, Vendors, Categories, Cart, Orders
- Authentication with JWT
- Basic filtering and pagination
