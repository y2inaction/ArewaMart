# ArewaMart

**Slogan:** Saye da Sayarwa

ArewaMart is a Hausa-first community marketplace for Northern Nigeria, operated by Noblen Technologies Limited.

## Architecture

This initial production-oriented rebuild uses:
- Next.js + TypeScript
- PostgreSQL + Prisma
- Docker Compose
- Mobile-first responsive UI
- Hausa-first product fields with English equivalents
- WhatsApp-ready commerce
- Modular boundaries for future payment, logistics and community services

Strategic community partners are represented by the `Community` entity. Dandalin Saye da Sayarwa is seeded as the first partner but is not the owner of the platform.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Docker

```bash
docker compose up -d --build
docker compose logs -f app
```

## EC2 deployment

1. Install Docker and Git on Ubuntu.
2. Copy this project to the server.
3. Create `.env` from `.env.example`.
4. Run:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

For public production, put Nginx or Caddy in front of port 3000 and configure HTTPS.

## Production Status

✅ **Completed Implementation (40 API Endpoints):**
- JWT authentication with secure cookies
- Complete order lifecycle management
- Paystack payment integration with webhooks
- Product review system with purchase verification
- Vendor verification workflow
- Admin dashboard with analytics
- Wishlist and cart functionality
- Address management
- Support ticket system
- Refund request management
- Comprehensive audit logging
- 30+ database tables with full relationships

✅ **Production Ready:**
- TypeScript strict mode (full type safety)
- Comprehensive error handling
- Role-based access control (10+ roles)
- Input validation with Zod
- Secure authentication flow
- Docker production configuration
- Environment-based configuration
- Database migration ready

⏳ **Remaining for Launch:**
- Rate limiting and CSRF protections
- Transactional email/SMS/WhatsApp providers
- Delivery provider integration
- Settlement and reconciliation system
- Automated backup strategy
- CI/CD pipeline (GitHub Actions)
- Comprehensive E2E testing
- Privacy, terms, and refund policies
- Monitoring and alerting setup
