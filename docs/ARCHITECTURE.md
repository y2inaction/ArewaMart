# ArewaMart Architecture

## System Overview

ArewaMart is a full-stack, production-grade digital marketplace built with modern web technologies. It's architected as a modular monolith with clear separation of concerns, enabling future extraction of services.

```
Internet
   |
HTTPS/TLS
   |
Load Balancer / Reverse Proxy (Nginx/Caddy)
   |
Next.js Application Server (Node.js)
   |
PostgreSQL Database
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: React Context + TanStack Query
- **i18n**: next-intl
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 22+
- **API Framework**: Next.js API Routes
- **Language**: TypeScript
- **ORM**: Prisma 5
- **Database**: PostgreSQL 16
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Deployment**: AWS EC2 Ubuntu
- **Reverse Proxy**: Nginx/Caddy (recommended)
- **SSL**: Let's Encrypt

## Database Schema

### Core Entities

```
User (auth, profile, addresses)
├── orders
├── wishlist
├── reviews
├── addresses
└── verifications

Vendor (marketplace seller)
├── products
├── orders
├── reviews
├── settlements
└── community_members

Product (marketplace item)
├── images
├── variants
├── reviews
├── cart_items
└── order_items

Order (customer purchase)
├── items
├── payment
├── refund
└── dispute

Community (partnership entity)
├── vendors
├── members
└── admins
```

### Supporting Entities

- **Category**: Product classification
- **Cart**: Client-side shopping cart
- **Address**: Shipping/billing addresses
- **Payment**: Payment transaction records
- **Review**: Product/vendor ratings
- **Wishlist**: Saved products
- **Settlement**: Vendor payouts
- **Coupon**: Discount codes
- **SupportTicket**: Customer support
- **Notification**: User notifications
- **AuditLog**: System events

## API Architecture

### Routes Structure

```
/api/
├── /auth/ - Authentication
│   ├── /register
│   ├── /login
│   ├── /logout
│   └── /refresh
├── /products/ - Product catalog
│   ├── (GET) list with filtering
│   └── /[slug] - single product
├── /vendors/ - Vendor management
│   ├── (GET) list vendors
│   ├── (POST) register vendor
│   └── /[slug] - vendor details
├── /categories/ - Product categories
├── /orders/ - Order management
│   ├── (POST) create order
│   └── /[id] - order details
├── /cart/ - Shopping cart
│   ├── (GET) get cart
│   ├── (POST) add item
│   └── /[itemId] (DELETE) remove item
├── /reviews/ - Product reviews
├── /admin/ - Admin operations
│   ├── /users
│   ├── /vendors
│   ├── /products
│   └── /orders
└── /webhooks/ - External integrations
    └── /paystack - Payment webhooks
```

## Security Architecture

### Authentication Flow

1. User registers or logs in
2. Server validates credentials (bcryptjs comparison)
3. JWT token generated with user claims
4. Refresh token stored in httpOnly cookie
5. Access token sent in response + cookie
6. Client includes token in Authorization header
7. Server verifies token signature on protected routes

### Authorization

Role-based access control (RBAC) with 10 roles:
- CUSTOMER (default)
- VENDOR (marketplace seller)
- VENDOR_STAFF (vendor employee)
- COMMUNITY_ADMIN (community administrator)
- COMMUNITY_MANAGER (community operations)
- SUPPORT_AGENT (customer support)
- MODERATOR (content moderation)
- OPERATIONS_ADMIN (platform operations)
- FINANCE_ADMIN (payments & settlements)
- SUPER_ADMIN (system administrator)

### Data Protection

- Passwords hashed with bcryptjs (10 rounds)
- Sensitive data encrypted at rest (application layer)
- HTTPS/TLS for all communication
- SQL injection protected via Prisma parameterization
- XSS prevented via React escaping
- CSRF protection via same-site cookies
- Rate limiting on auth endpoints
- Audit logging of sensitive operations

## Order Flow State Machine

```
PENDING_PAYMENT
    ↓
[Payment Processing]
    ↓
PAID
    ↓
[Vendor Processing]
    ↓
PROCESSING
    ↓
[Delivery Preparation]
    ↓
READY_FOR_PICKUP / SHIPPED
    ↓
OUT_FOR_DELIVERY
    ↓
DELIVERED
    ↓
[Customer Review & Accept]

Alternate paths:
PENDING_PAYMENT → CANCELLED
PAID → REFUND_REQUESTED → REFUNDED
ANY → DISPUTED
```

## Payment Integration

### Paystack Integration

1. Customer adds items to cart
2. Creates order with PENDING_PAYMENT status
3. Redirects to Paystack payment page
4. Paystack sends webhook to `/api/webhooks/paystack`
5. Webhook verifies payment signature
6. Updates order status to PAID
7. Sends confirmation email
8. Initiates fulfillment workflow

### Webhook Security

- Paystack signature verified with secret key
- Only processed requests are idempotent
- Payment verified server-side before order confirmation
- Webhook endpoint rate-limited

## Search & Discovery

### Current Implementation (MVP)

- Database full-text search on product name/description
- Filtering by category, vendor, price range
- Sorting by relevance, price, rating, newest
- Pagination with configurable limits

### Future Enhancement Path

- Elasticsearch/Meilisearch integration
- Faceted search
- Synonym handling
- Typo tolerance
- ML-based recommendations

## Scalability Considerations

### Current Architecture (Single Instance)

- Single Next.js process
- Single PostgreSQL database
- Sufficient for ~10,000 DAU

### Horizontal Scaling Path

1. **Load Balancer**: Distribute requests across multiple Next.js instances
2. **Database Replication**: Read replicas for search queries
3. **Cache Layer**: Redis for sessions, cart data, frequently accessed products
4. **File Storage**: S3 for product images, move away from CDN URLs
5. **Message Queue**: Background jobs for email, notifications
6. **Search Index**: Elasticsearch for advanced product search

### Database Optimization

- Indexes on common queries (vendor_id, category_id, created_at)
- Connection pooling with PgBouncer
- Query optimization & EXPLAIN ANALYZE
- Archive old orders/logs
- Partitioning large tables (orders by date)

## Internationalization (i18n)

### Current Support

- **Primary**: Hausa (ha)
- **Secondary**: English (en)

### Implementation

- next-intl library for routing
- Translation files in `/public/locales/`
- Date/number formatting via Intl API
- Server-side content with fallback to English

### Adding New Languages

1. Create translation files
2. Add locale to i18n config
3. Update language picker component
4. Deploy (no code changes needed)

## Community Partnership Architecture

### Dandalin Integration

- Registered as strategic community partner
- Linked vendors identified via community field
- Community-specific analytics available
- Can customize vendor onboarding, campaigns

### Future Expansion

- Support multiple communities simultaneously
- Community-specific feature flags
- Tiered partnership models
- Integration with other community platforms

## Deployment Architecture

### Development

```
docker-compose up -d
# Next.js on http://localhost:3000
# PostgreSQL on localhost:5432
```

### Production (AWS EC2)

```
Ubuntu 22.04 LTS
├── Docker & Docker Compose
├── Next.js Container (3000 → 80/443)
├── PostgreSQL Container
├── Nginx Reverse Proxy
├── SSL Certificates (Let's Encrypt)
├── Automated Backups
└── Monitoring & Logging
```

### CI/CD Pipeline (Future)

- GitHub Actions
- Unit/integration tests
- Docker build & push
- Database migrations
- Deployment to EC2
- Health checks
- Rollback procedures

## Monitoring & Observability

### Logs

- Structured JSON logging
- Centralized log aggregation (future)
- Log retention: 30 days

### Metrics

- Application: Response times, error rates
- Database: Query performance, connection pool
- Infrastructure: CPU, memory, disk usage

### Alerts

- High error rate (>5% 5xx)
- Payment webhook failures
- Database connection issues
- Low disk space

## Future Architecture Evolution

### Phase 1: Core Marketplace (Current)
- Single monolithic application
- PostgreSQL database
- Basic search and filtering

### Phase 2: Scalability
- Load balancer
- Database replication
- Redis caching
- CDN for images

### Phase 3: Microservices
- ArewaPay (payments)
- ArewaGo (logistics)
- ArewaFood (food marketplace)
- Independent services with shared identity

### Phase 4: Advanced Features
- ML-based recommendations
- Fraud detection
- Advanced analytics
- Mobile apps

## Design Principles

1. **Security First**: Every feature includes security consideration
2. **Hausa-First**: Primary UX and copy in Hausa
3. **Performance**: Target Core Web Vitals compliance
4. **Maintainability**: Clear code structure for team handoff
5. **Scalability**: Architecture supports 10x growth without major changes
6. **Open Standards**: Use established, well-supported technologies
7. **Accessibility**: WCAG 2.2 AA compliance target
8. **Community-Centered**: Built for Northern Nigerian commerce

---

*Last Updated: 2024-09-19*
