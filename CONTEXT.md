# FRAVIONT — Project Context File

> **PASTE THIS INTO YOUR AI IDE'S STEERING/RULES FILE**
> Update the "Current Phase" and "Completed" sections as you build.

---

## Project Identity

- **Name:** Fraviont
- **Type:** Luxury e-commerce store + admin panel
- **Products:** Perfumes, Cosmetics, Jewelry
- **Stack:** Next.js 15 (App Router), Tailwind v4, shadcn/ui, tRPC v11, Drizzle ORM, Neon Postgres, Upstash Redis, NextAuth v5, OpenRouter API, PayFast, Resend, **GSAP + @gsap/react**

---

## Absolute Rules (Never Break These)

1. **TypeScript strict mode** — no `any`, no type assertions without comment
2. **Server Components first** — add `"use client"` only when needed (event handlers, hooks, browser APIs)
3. **Prices in cents** — always store as integer, format with `formatPrice()` util
4. **Drizzle queries** — always use parameterized queries via Drizzle API, never raw interpolated SQL
5. **Admin protection** — all `/admin/*` routes and tRPC admin procedures must use `adminProcedure`
6. **No inline styles** — only Tailwind utilities or CSS variables
7. **Loading + Error states** — every server data dependency needs a Skeleton and error fallback
8. **Toast feedback** — every mutation needs success/error toast (react-hot-toast)
9. **Redis cache** — expensive queries (product lists, analytics, AI responses) must check Redis first
11. **GSAP only for animations** — no framer-motion, no CSS keyframes for choreographed animations. Use `useGSAP` from `@gsap/react` in all client components. Register plugins in `src/lib/gsap/config.ts`
12. **Skeleton on every data fetch** — every Server Component with async data uses `<Suspense fallback={<XSkeleton />}>`. Every Client Component `useQuery` checks `isPending` and renders the matching skeleton. Skeletons must match exact dimensions of loaded content to prevent layout shift
13. **Skeleton style** — dark shimmer (`#1a1a1a → #222222`), `rounded-none`, staggered `animation-delay` on multi-row skeletons

---

## Design Rules (Never Break These)

1. **Background: #0A0A0A** (obsidian) — never white, never light
2. **Primary text: #F5F0E8** (ivory) — never pure white
3. **Accent: #C9A84C** (gold-warm) — for CTAs, prices, highlights
4. **Fonts: Cormorant Garamond** (headings/display) + **Jost** (body/UI)
5. **No pill/rounded buttons** — use `rounded-none` or `rounded-sm` only
6. **GSAP for all animations** — use `useGSAP` from `@gsap/react`. Default ease: `power4.out`. Hero reveals: 1.0–1.4s. Hover states: 0.4–0.7s. Scroll reveals via `ScrollTrigger`. No framer-motion.
7. **No drop shadows** — use background elevation (darker/lighter bg) instead
8. **Generous spacing** — minimum 24px card padding, 64px+ between sections
9. **Skeleton on every data fetch** — `<Suspense fallback={<XSkeleton />}>` on Server Components. `if (isPending) return <XSkeleton />` on Client Components. Dark shimmer style (`#1a1a1a → #222222`), `rounded-none`.

---

## Project File Map

```
src/
├── app/
│   ├── (store)/              ← Customer-facing (public)
│   ├── (admin)/              ← Admin panel (ADMIN role required)
│   └── api/trpc/[trpc]/      ← tRPC API route
├── components/
│   ├── ui/                   ← shadcn components (DO NOT MODIFY)
│   ├── store/                ← Store-specific components
│   ├── admin/                ← Admin-specific components
│   └── shared/               ← Used in both
├── server/
│   ├── api/routers/          ← tRPC routers
│   ├── auth.ts               ← NextAuth config
│   └── db/
│       ├── schema.ts         ← Drizzle schema (source of truth)
│       └── index.ts          ← DB client
└── lib/
    ├── ai/client.ts          ← OpenRouter API client
    ├── redis/client.ts       ← Upstash Redis client
    ├── gsap/
    │   ├── config.ts         ← Register plugins, global defaults
    │   ├── easings.ts        ← EASE constants
    │   └── animations/       ← Named animation functions
    └── utils.ts              ← formatPrice, cn, etc.
```

---

## Database Schema Summary

Tables: `products`, `productVariants`, `orders`, `orderItems`, `customers`, `inventory_logs`
Plus NextAuth tables: `users`, `accounts`, `sessions`, `verification_tokens`

Key relationships:
- `products` 1→N `productVariants`
- `orders` 1→N `orderItems` → each references `products` + `productVariants`
- `orders` N→1 `customers`
- `productVariants` 1→N `inventory_logs`

---

## tRPC Router Map

```
appRouter
├── products.getAll({ category?, search?, page?, limit? })
├── products.getBySlug({ slug })
├── products.create(productInput)                    [admin]
├── products.update({ id, ...productInput })         [admin]
├── products.delete({ id })                          [admin]
├── orders.getAll({ status?, dateFrom?, dateTo? })   [admin]
├── orders.getById({ id })                           [admin]
├── orders.updateStatus({ id, status })              [admin]
├── inventory.getAll()                               [admin]
├── inventory.adjust({ variantId, quantity, note })  [admin]
├── analytics.getDashboardStats()                    [admin]
├── analytics.getRevenue({ period })                 [admin]
├── customers.getAll()                               [admin]
├── customers.getById({ id })                        [admin]
├── ai.chat({ message, sessionId })                  [public, rate-limited]
├── ai.generateDescription({ productId })            [admin]
└── ai.generateProfile({ answers, products })        [public]
```

---

## Current Build Phase

**Phase:** [ ] 0 - Foundation  [ ] 1 - Store  [ ] 2 - Admin  [ ] 3 - AI

**Current Step:** _______________

---

## Completed Steps

Mark with [x] when done:

### Phase 0: Foundation
- [ ] 0.1 Project scaffold
- [ ] 0.2 Database schema
- [ ] 0.3 Auth (NextAuth)
- [ ] 0.4 tRPC setup
- [ ] 0.5 Design system

### Phase 1: Store
- [ ] 1.1 Layout + Navigation
- [ ] 1.2 Homepage
- [ ] 1.3 Product catalog
- [ ] 1.4 Product detail
- [ ] 1.5 Cart
- [ ] 1.6 Checkout (Stripe)
- [ ] 1.7 Order confirmation
- [ ] 1.8 Customer account

### Phase 2: Admin
- [ ] 2.1 Admin layout
- [ ] 2.2 Dashboard
- [ ] 2.3 Products CRUD
- [ ] 2.4 Orders management
- [ ] 2.5 Inventory
- [ ] 2.6 Analytics charts
- [ ] 2.7 Customer CRM

### Phase 3: AI
- [ ] 3.1 OpenRouter client
- [ ] 3.2 Concierge chatbot
- [ ] 3.3 Description generator
- [ ] 3.4 Scent quiz
- [ ] 3.5 Semantic search
- [ ] 3.6 Admin AI digest
- [ ] 3.7 Inventory forecasting

---

## Known Issues / TODO

> Add issues here as they arise during development

- [ ] (empty — add as needed)

---

## Decisions Made

> Record architectural decisions here so the AI doesn't re-debate them

- Prices stored as integer cents (not decimal)
- PayFast for payments (redirect-based flow, ITN webhook — NOT Stripe)
- PayFast ITN endpoint at /api/payfast/itn
- pgvector on Neon for semantic search embeddings
- OpenRouter over direct Anthropic API for model flexibility
- pnpm as package manager
- Vercel for deployment
- Cloudflare R2 for image storage (or Vercel Blob)
