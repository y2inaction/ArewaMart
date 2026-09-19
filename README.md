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

## Important production work

Before taking real payments, add:
- Paystack server-side initialization and webhook signature verification
- real authentication and RBAC
- vendor verification workflow
- multi-vendor order splitting
- settlement and reconciliation
- delivery provider integration
- rate limiting and CSRF protections where applicable
- transactional email/SMS/WhatsApp providers
- backups and monitoring
- automated tests and CI/CD
- privacy, terms, refund and consumer-protection workflows

No fake payment confirmation is implemented in this starter.
