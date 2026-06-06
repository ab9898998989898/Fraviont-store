# Fraviont Store

A full-stack luxury e-commerce platform specializing in perfumes, cosmetics, and jewelry. Built with a modern TypeScript stack, featuring AI-powered product recommendations, comprehensive inventory management, and a complete admin dashboard for operational control.

## Problem & Purpose

This project addresses the need for a purpose-built, feature-complete e-commerce system for premium brands that require:

- **Sophisticated inventory tracking** with variant management, low-stock alerts, and reorder forecasting
- **Complex fulfillment workflows** including order status tracking, payment integration, and shipping management
- **AI-augmented operations** for product descriptions, customer profiling, and sales forecasting
- **Role-based access control** separating customer storefronts from admin dashboards
- **Real-time business intelligence** through analytics and performance dashboards

The platform positions itself as a direct-to-consumer sales channel with full operational visibility and customer engagement capabilities.

## Target Audience

- **Store operators**: Admin users managing inventory, orders, payments, and customer relationships
- **Customers**: End consumers browsing, purchasing, and engaging with the brand
- **Product managers**: Stakeholders requiring data-driven insights on sales, inventory, and customer behavior

## Tech Stack

### Frontend
- **Next.js 15** (App Router) — Server-side rendering and static generation
- **React 19** — Component architecture and UI state management
- **TypeScript** — Type-safe application code
- **Tailwind CSS 4** — Utility-first styling with PostCSS
- **shadcn/ui** — Accessible, composable UI components
- **GSAP** (@gsap/react) — Performant animations and page transitions
- **Recharts** — Server-rendered business dashboards
- **React Hook Form** + **Zod** — Client-side form validation and serialization
- **Lucide React** — SVG icon library

### Backend
- **Next.js API Routes** — Serverless function handlers
- **tRPC 11** — End-to-end type-safe API layer between client and server
- **NextAuth 5 (beta)** — Authentication with JWT sessions and credential/OAuth providers
- **Upstash Redis** — Distributed caching, rate limiting, session management
- **Upstash QStash** — Serverless job queue for async operations

### Database & Data Layer
- **Neon PostgreSQL** — Serverless relational database with connection pooling
- **Drizzle ORM 0.38** — Type-safe SQL queries with migrations
- **Drizzle Kit** — Schema generation and database tooling

### Integrations
- **OpenRouter API** — LLM access (Claude 3.5 Haiku/Sonnet, GPT-4o) for product generation and recommendations
- **PayFast** — Payment processing for South African merchants
- **Resend** — Email delivery for transactional and marketing messages
- **Vercel Blob** / **Cloudflare R2** — File storage for product images and assets
- **Google OAuth** — Social authentication provider

### Developer Experience
- **ESLint 9** — Code linting
- **Prettier** — Code formatting with Tailwind plugin
- **Vitest 2** — Unit testing with coverage reports
- **tsx** — TypeScript execution for scripts

## Key Features

### Customer-Facing Store
- **Product catalog** with filtering by category (perfumes, cosmetics, jewelry, gift sets)
- **Dynamic product details** with variant selection, pricing, inventory status
- **Shopping cart** with persistent state
- **Checkout flow** with address collection and payment via PayFast
- **User authentication** — Email/password signup, OAuth, JWT-based sessions
- **Account management** — Order history, saved preferences
- **AI-powered search** — Semantic product discovery and recommendations
- **Scent profile quiz** — AI generates personalized product recommendations
- **Luxury UI/UX** — Dark aesthetic, gold accents, refined typography (Cormorant)

### Admin Dashboard
- **Order management** — View, filter, track fulfillment status, generate tracking links
- **Product administration** — Create/edit products with variants, images, pricing, categories
- **Inventory control** — Real-time stock tracking, low-stock alerts, reorder management
- **Customer CRM** — View customer profiles, purchase history, engagement metrics
- **Financial analytics** — Revenue tracking, order value analysis, payment status monitoring
- **AI features** — Generate product descriptions, SEO metadata, daily digests, sales forecasts
- **Store settings** — Brand configuration, notification preferences, currency/localization

### AI Features
- **Sophia concierge** — Conversational shopping assistant grounded in live inventory
- **AI descriptions** — Auto-generate compelling product copy from metadata
- **SEO optimization** — AI-driven meta titles and descriptions
- **Customer profiling** — Generate scent family profiles from quiz responses
- **Daily digest** — AI-summarized sales performance and trends
- **Sales forecasting** — Reorder suggestions based on 90-day sales velocity
- **Semantic search** — Natural language product discovery

### Operational Features
- **Rate limiting** — Per-session chat rate limits via Upstash
- **Email notifications** — Welcome emails, order confirmations, admin alerts
- **Session management** — Single-session enforcement for admin logins
- **Audit logging** — Creation timestamps and status change tracking
- **Newsletter subscriptions** — Customer list building
- **Multi-currency support** — Configured via store settings (default: ZAR)

## Architecture & Design Decisions

### Authentication Strategy
- **JWT-based sessions** over traditional server sessions for scalability
- **Dual-provider setup**: Credentials (admin) + Google OAuth (customer self-signup)
- **Single-session enforcement** for admin users via `activeSessionId` tracking—prevents concurrent logins
- **Role-based access control** in middleware; admin routes redirect non-admins to homepage

### API Design
- **tRPC** chosen over REST for end-to-end type safety and automatic client validation
- **Procedure-level authorization** with `publicProcedure` and `adminProcedure` types
- **Modular routers** organized by domain (products, orders, inventory, analytics, AI, customers, newsletter, settings)

### Data Model
- **Normalized schema** with proper relationships (users ↔ customers ↔ orders ↔ orderItems)
- **Enums for state** (orderStatus, paymentStatus, productCategory, inventoryLogType)
- **JSONB columns** for flexible structures (images, tags, scent notes, customer AI profiles, shipping addresses)
- **Soft-delete pattern** via `isActive` flags rather than hard deletes
- **Audit fields** — `createdAt`, `updatedAt` on all mutable entities
- **Inventory tracking** — Separate logs table for stock adjustments and reorders

### Caching & Performance
- **Redis caching** for expensive operations (AI generation, analytics, search)
- **Cache invalidation** via time-based TTLs; manual invalidation for critical paths
- **Rate limiting** via token bucket on Redis; prevents abuse of AI chat endpoint

### File Storage
- **Vercel Blob** or **Cloudflare R2** abstraction for product images
- **Signed URLs** for secure image delivery
- **Lazy loading** to reduce initial page payload

### Frontend State Management
- **Zustand** — Lightweight, flexible store for cart state and UI toggles
- **React Query (TanStack Query)** — Server state synchronization with automatic caching and refetching
- **GSAP animations** — Performant page transitions and interactive elements
- **Skeleton loading** — Progressive UI during data fetches

### Email Architecture
- **React components** for templated emails via `@react-email/components`
- **Dynamic rendering** — serverside email generation triggered by auth events
- **Transactional focus** — Welcome, order confirmation, shipping alerts

## Setup & Installation

### Prerequisites
- **Node.js 18+** and pnpm 8+
- PostgreSQL database (recommend Neon for serverless option)
- Redis instance (recommend Upstash for serverless option)
- API keys for integrations (see Environment Variables)

### Local Development

```bash
# Clone repository
git clone https://github.com/theabdullahnadeem/Fraviont-store.git
cd Fraviont-store

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate and push database schema
pnpm db:generate
pnpm db:push

# Seed initial data (admin user, sample products)
pnpm db:seed

# Start development server
pnpm dev
```

Visit:
- **Store**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API Explorer**: http://localhost:3000/api/trpc/playground (if enabled)

### Build for Production

```bash
# Type check and lint
pnpm lint

# Run tests
pnpm test

# Build
pnpm build

# Start
pnpm start
```

## Environment Variables

```dotenv
# Database (Neon PostgreSQL with serverless driver)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/fraviont?sslmode=require

# Authentication (NextAuth v5)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000

# OAuth (Google Sign-In)
AUTH_GOOGLE_ID=<from-google-cloud-console>
AUTH_GOOGLE_SECRET=<from-google-cloud-console>

# LLM Access (OpenRouter)
OPENROUTER_API_KEY=sk-or-<token>

# Caching & Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# Payment Processing (PayFast - South Africa)
PAYFAST_MERCHANT_ID=<merchant-id>
PAYFAST_MERCHANT_KEY=<merchant-key>
PAYFAST_PASSPHRASE=<passphrase>
PAYFAST_SANDBOX=true  # Set to false for production

# Email Delivery (Resend)
RESEND_API_KEY=<token>

# File Storage (Vercel Blob or Cloudflare R2)
BLOB_READ_WRITE_TOKEN=<token>

# Background Jobs (Upstash QStash)
QSTASH_CURRENT_SIGNING_KEY=<key>
QSTASH_NEXT_SIGNING_KEY=<key>

# Public URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

All integrations default to sandbox/development modes. Update credentials and set `PAYFAST_SANDBOX=false` for production.

## Database Schema Overview

### Core Tables
- **users** — Authentication accounts (NextAuth standard + role, password, activeSessionId)
- **accounts** — OAuth provider links
- **sessions** — JWT session tokens
- **verificationTokens** — Email verification and password resets

### Products
- **products** — Base product records with metadata, pricing, categories, SEO
- **productVariants** — Size/volume/style variants with SKU, stock, pricing overrides
- **inventoryLogs** — Audit trail of stock movements (restock, sale, adjustment, return)

### Orders & Customers
- **customers** — Customer profiles linked to users, purchase history, AI preferences
- **orders** — Order headers with status, payment status, totals, shipping address
- **orderItems** — Line items linked to product variants with quantity and pricing snapshots

### CMS & Settings
- **journals** — Blog/content articles with categories and featured flags
- **newsletters** — Email subscriber list
- **storeSettings** — Global configuration (brand name, currency, notification preferences)

## Development Workflow

### Database Changes
```bash
# After modifying schema.ts
pnpm db:generate      # Create migration
pnpm db:push          # Apply to database
pnpm db:studio        # Inspect in Drizzle Studio
```

### Adding API Endpoints
1. Create procedure in `src/server/api/routers/<domain>.ts`
2. Export from router, add to `root.ts` appRouter
3. Auto-imported on client via `api.<router>.<procedure>()`

### Component Development
- UI components in `src/components/ui/` (shadcn/ui based)
- Store-specific components in `src/components/store/`
- Admin components in `src/components/admin/`
- Shared utilities in `src/components/shared/`

### Testing
```bash
pnpm test              # Run all tests
pnpm test:coverage     # Generate coverage report
```

Tests use **Vitest** with **fast-check** for property-based testing.

## Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repo to Vercel dashboard
# Environment variables configured in Vercel project settings
# Auto-deploy on push to main
```

Database migrations run automatically via Drizzle; ensure `DATABASE_URL` points to production database.

### Manual Deployment
1. Build: `pnpm build`
2. Deploy artifact to Node.js host (Railway, Render, etc.)
3. Set all environment variables in hosting platform
4. Run migrations: `pnpm db:push --prod`
5. Start: `pnpm start`

## Project Structure

```
Fraviont-store/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (store)/            # Customer storefront routes
│   │   │   ├── page.tsx
│   │   │   ├── shop/
│   │   │   ├── product/[slug]/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── account/
│   │   ├── admin/              # Admin dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   └── trpc/[trpc].ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── products.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── inventory.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── ai.ts
│   │   │   │   ├── newsletter.ts
│   │   │   │   └── settings.ts
│   │   │   ├── root.ts
│   │   │   └── trpc.ts
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── db/
│   │       ├── index.ts
│   │       ├── schema.ts       # Drizzle ORM schema
│   │       ├── seed.ts
│   │       ├── seed-admin.ts
│   │       └── seed-journal.ts
│   ├── components/
│   │   ├── ui/                 # Headless components
│   │   ├── store/
│   │   ├── admin/
│   │   └── shared/
│   ├── lib/
│   │   ├── ai/                 # OpenRouter client, prompts
│   │   ├── redis/              # Upstash client, rate limiting
│   │   └── utils.ts
│   ├── trpc/
│   │   └── react.tsx           # tRPC React client setup
│   ├── types/                  # Shared TypeScript types
│   └── middleware.ts           # Auth middleware
├── public/                      # Static assets
├── drizzle/
│   └── migrations/
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test:coverage
```

Tests are written with **Vitest** and cover critical paths like:
- API procedure authorization and validation
- Product filtering and search logic
- Order state transitions
- Rate limiting behavior
- AI response parsing

## Common Tasks

### Add a Product
1. Admin → Products → Create
2. Fill metadata, upload images, set category
3. Create variants with SKU and pricing
4. Generate AI description (optional)
5. Publish

### Process an Order
1. Admin → Orders → Find order
2. Confirm payment via PayFast integration
3. Update status → Processing
4. Add tracking number
5. System sends email to customer

### Update Store Settings
1. Admin → Settings
2. Modify brand name, currency, notification preferences
3. Save

### Run AI Features
- **Chat**: Customer → Product page → Chat with Sophia
- **Description generation**: Admin → Product → Generate Description
- **Daily digest**: Admin → Dashboard (auto-runs, cached)
- **Forecast**: Admin → Inventory → AI Forecast

## Performance Considerations

- **Database connection pooling** via Neon serverless driver
- **Static generation** of product pages where possible
- **Incremental Static Regeneration (ISR)** for product updates
- **Redis caching** for expensive AI and analytics queries
- **Image optimization** via Next.js Image component
- **Code splitting** — per-route bundle optimization
- **WebFont preloading** — Cormorant Garamond for luxury aesthetic

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct and IP whitelisted (Neon)
- Test with: `psql $DATABASE_URL -c "SELECT 1;"`
- Check Neon dashboard for connection limits

### Auth Failing
- Regenerate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Verify Google OAuth credentials match deployment URL
- Check JWT token expiry in browser DevTools

### AI Requests Failing
- Confirm OpenRouter API key is valid and has credits
- Check rate limits: `UPSTASH_REDIS_REST_TOKEN` connectivity
- Review OpenRouter usage dashboard

### Email Not Sending
- Verify Resend API key and sender domain
- Check spam folder
- Review Resend delivery logs

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes, ensure tests pass: `pnpm test`
3. Format code: `pnpm lint` (and fix if needed)
4. Commit: `git commit -m "description"`
5. Push and open PR

## License

This project is proprietary software. All rights reserved.

---

**Live URL**: Confidential (NDA restrictions)  
**Maintained by**: [@theabdullahnadeem](https://github.com/theabdullahnadeem)
