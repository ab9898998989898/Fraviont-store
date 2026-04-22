# 🖤 FRAVIONT — Luxury E-Commerce Platform

> *Perfumes · Cosmetics · Jewelry*

A full-stack, luxury e-commerce platform with a complete admin dashboard, AI-powered shopping experiences, and a dark, refined aesthetic designed to rival the world's most exclusive boutiques.

---

## 🗂 Documentation Index

| File | Purpose |
|------|---------|
| [`README.md`](./README.md) | This file — overview & quick start |
| [`TECH_STACK.md`](./TECH_STACK.md) | Full technology breakdown & rationale |
| [`AI_FEATURES.md`](./AI_FEATURES.md) | All AI integration specs |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Luxury design tokens, GSAP animations, skeleton system |
| [`ADMIN_PANEL.md`](./ADMIN_PANEL.md) | Admin dashboard specs & features |
| [`STORE_FEATURES.md`](./STORE_FEATURES.md) | Customer-facing store specs |
| [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) | Step-by-step build guide with pitfalls |
| [`KIRO_PROMPT.md`](./KIRO_PROMPT.md) | **Exact prompts to paste into Kiro IDE** |
| [`CONTEXT.md`](./CONTEXT.md) | Live project context (feed into Kiro steering) |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Vercel deployment, DNS, PayFast production setup |
| [`DB_SEED.md`](./DB_SEED.md) | Database seed guide with full seed file |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history & changes |

---

## ⚡ Project Summary

**Fraviont** is a luxury direct-to-consumer (DTC) brand selling:
- Haute perfumes & fragrances
- Premium cosmetics & skincare
- Fine jewelry & accessories

### Core Requirements
- ✅ Storefront with luxury UI/UX (dark, gold, refined)
- ✅ Admin panel — orders, inventory, finance, analytics
- ✅ AI shopping concierge & recommendations
- ✅ Full inventory management system
- ✅ Sales & revenue analytics dashboard
- ✅ Real-time order tracking
- ✅ Semantic product search
- ✅ AI-generated descriptions

---

## 🚀 Quick Start (After Setup)

```bash
# 1. Clone and install
git clone https://github.com/your-org/fraviont
cd fraviont
pnpm install

# 2. Copy env variables
cp .env.example .env.local

# 3. Push database schema
pnpm db:push

# 4. Seed initial data
pnpm db:seed

# 5. Start dev server
pnpm dev
```

Visit:
- Store → `http://localhost:3000`
- Admin → `http://localhost:3000/admin`

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/fraviont

# Auth (NextAuth)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Payments (PayFast)
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_SANDBOX=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Storage (Cloudflare R2 or Vercel Blob)
BLOB_READ_WRITE_TOKEN=
```

---

## 📁 Project Structure

```
fraviont/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (store)/            # Customer-facing store
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── shop/           # Product catalog
│   │   │   ├── product/[slug]/ # Product detail
│   │   │   ├── cart/           # Cart
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── account/        # Customer account
│   │   ├── (admin)/            # Admin panel
│   │   │   ├── dashboard/      # Overview
│   │   │   ├── orders/         # Order management
│   │   │   ├── products/       # Product management
│   │   │   ├── inventory/      # Stock management
│   │   │   ├── customers/      # CRM
│   │   │   ├── analytics/      # Finance & sales
│   │   │   └── settings/       # Store config
│   │   └── api/                # API routes
│   │       └── trpc/           # tRPC handler
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── store/              # Store-specific components
│   │   ├── admin/              # Admin-specific components
│   │   └── shared/             # Shared components
│   ├── server/
│   │   ├── api/                # tRPC routers
│   │   │   ├── routers/
│   │   │   │   ├── products.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── inventory.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── customers.ts
│   │   │   │   └── ai.ts
│   │   │   └── root.ts
│   │   └── db/
│   │       ├── schema.ts       # Drizzle schema
│   │       └── index.ts        # DB client
│   ├── lib/
│   │   ├── ai/                 # OpenRouter client + AI utilities
│   │   ├── redis/              # Upstash Redis client
│   │   ├── stripe/             # Stripe utilities
│   │   └── utils.ts
│   └── styles/
│       └── globals.css         # Global CSS + Tailwind + design tokens
├── drizzle/
│   └── migrations/             # DB migrations
├── public/
│   └── fonts/                  # Custom fonts (Cormorant, etc.)
├── TECH_STACK.md
├── AI_FEATURES.md
├── DESIGN_SYSTEM.md
├── ADMIN_PANEL.md
├── STORE_FEATURES.md
├── IMPLEMENTATION_GUIDE.md
├── CONTEXT.md
├── CHANGELOG.md
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```
