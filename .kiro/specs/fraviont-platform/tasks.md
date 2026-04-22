# Implementation Plan: Fraviont Platform

## Overview

Full-stack luxury e-commerce platform built on Next.js 15 App Router, tRPC v11, Drizzle ORM, Upstash Redis, NextAuth v5, GSAP, and PayFast. Implementation follows five phases: Foundation → Store → Admin → AI Features → Email & Deployment. Each phase builds on the previous, ending with all components wired together and property-based tests validating correctness invariants.

## Tasks

- [x] 1. Phase 0 — Foundation: Project scaffold and core infrastructure
  - [x] 1.1 Scaffold Next.js 15 App Router project with TypeScript strict mode, Tailwind CSS v4, ESLint, and `src/` directory structure
    - Run `pnpx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint, and `src/` options
    - Configure `tsconfig.json` with `strict: true` and path alias `@/*` → `./src/*`
    - Configure `next.config.ts` with `experimental.ppr`, `experimental.reactCompiler`, and `images.remotePatterns` for R2/Vercel Blob
    - Install all production dependencies: drizzle-orm, @neondatabase/serverless, @trpc/server, @trpc/client, @trpc/react-query, @tanstack/react-query, next-auth, @auth/drizzle-adapter, @upstash/redis, @upstash/ratelimit, resend, @react-email/components, zod, clsx, tailwind-merge, lucide-react, gsap, @gsap/react, recharts, react-hot-toast, zustand, date-fns, sharp, superjson
    - Install dev dependencies: drizzle-kit, vitest, @vitest/coverage-v8, fast-check, prettier, prettier-plugin-tailwindcss
    - Install shadcn/ui components: button, card, dialog, form, input, label, table, tabs, badge, select, dropdown-menu, sheet, command, chart, toast, separator, accordion
    - Create `.env.example` with all required keys: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OPENROUTER_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_SANDBOX, NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, BLOB_READ_WRITE_TOKEN, CRON_SECRET
    - _Requirements: 1.1, 1.2, 1.16_

  - [x] 1.2 Implement GSAP animation system
    - Create `src/lib/gsap/config.ts` — register ScrollTrigger and TextPlugin inside `typeof window !== "undefined"` guard, set global defaults (`ease: "power3.out"`, `duration: 0.9`), set ScrollTrigger defaults (`toggleActions: "play none none reverse"`, `start: "top 88%"`), export `{ gsap, ScrollTrigger }`
    - Create `src/lib/gsap/easings.ts` — export `EASE` constant with keys: luxury, enter, exit, elastic, text, gold, hover
    - Create `src/lib/gsap/animations/hero.ts` — implement `animateHero(refs)` returning a GSAP timeline: headline clip-path reveal, subheadline letter-spacing expand, divider scaleX draw, CTA buttons stagger fade-up, scroll indicator
    - Create `src/lib/gsap/animations/scrollReveal.ts` — implement `revealSection()`, `revealStagger()`, `horizontalScroll()` using ScrollTrigger
    - Create `src/lib/gsap/animations/productCard.ts` — implement `setupCardHover()` (image scale + overlay opacity) and `magneticButton()` (mousemove magnetic pull)
    - Create `src/lib/gsap/animations/navigation.ts` — implement `openMobileMenu()` (overlay fade + links stagger) and `setupNavScroll()` (transparent → dark background at 80px scroll)
    - Create `src/lib/gsap/animations/textEffects.ts` — implement `charReveal()`, `countUp()`, `goldShimmer()`
    - Create `src/lib/gsap/animations/scentProfile.ts` — implement `animateScentNotes()` (rings expand + labels fade via ScrollTrigger)
    - Create `src/lib/gsap/animations/admin.ts` — implement `animateKPICards()` (cards fade+scale + countUp) and `animateChartReveal()` (clip-path left-to-right draw)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 1.3 Implement luxury design system in globals.css and override shadcn theme
    - Set `background: #0A0A0A` and `color: #F5F0E8` on `body` in `src/app/globals.css`
    - Import Google Fonts: Cormorant Garamond (300, 400, 500, 600, italic), Jost (300, 400, 500, 600), Cinzel (400, 500)
    - Define all CSS custom properties from DESIGN_SYSTEM.md: obsidian, charcoal, graphite, iron, smoke, ivory, parchment, ash, gold-bright, gold-warm, gold-antique, gold-deep, gold-glow
    - Override shadcn `:root` CSS variables: `--background: 0 0% 4%`, `--foreground: 43 20% 93%`, `--primary: 45 73% 52%`, `--card: 0 0% 8%`, `--border: 0 0% 16%`, `--muted: 0 0% 12%`, `--accent: 45 73% 52%`
    - Define `@theme` block with Tailwind v4 colour tokens and font families (display: Cormorant Garamond, sans: Jost, accent: Cinzel)
    - Define `.skeleton` CSS class with dark shimmer animation (`background: linear-gradient(90deg, #1a1a1a 25%, #222222 50%, #1a1a1a 75%)`, `animation: skeleton-shimmer 1.8s ease-in-out infinite`)
    - Override `src/components/ui/skeleton.tsx` to use `rounded-none` and the `.skeleton` class
    - Create all 6 skeleton components in `src/components/shared/skeletons/`: `ProductCardSkeleton`, `ProductGridSkeleton`, `ProductDetailSkeleton`, `KPICardSkeleton`, `TableSkeleton`, `ChatMessageSkeleton` — dimensions must match loaded counterparts exactly
    - Create `src/app/layout.tsx` with root layout: Google Fonts, `#page-curtain` div (fixed, z-9999, gold `#C9A84C` bg, `scaleY(0)` initial), TRPCProvider, Toaster
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 2.11_

  - [x] 1.4 Define Drizzle ORM schema and database client
    - Create `src/server/db/index.ts` — Neon HTTP client + Drizzle instance with schema
    - Create `src/server/db/schema.ts` with all enums: `productCategoryEnum` (perfumes, cosmetics, jewelry, gift_sets), `orderStatusEnum` (pending, confirmed, processing, shipped, delivered, cancelled, refunded), `paymentStatusEnum` (pending, paid, failed, refunded), `inventoryLogTypeEnum` (restock, sale, adjustment, return)
    - Define tables: `products` (id UUID PK, slug unique, name, shortDescription, description, aiDescription, price integer cents, compareAtPrice, category enum, subcategory, images jsonb, tags jsonb, ingredients, scentNotes jsonb, embedding vector(1536), isActive, isFeatured, metaTitle, metaDescription, createdAt, updatedAt)
    - Define `productVariants` (id, productId FK cascade, sku unique, name, price override, stock, lowStockThreshold, weight, createdAt, updatedAt)
    - Define `customers` (id, userId FK to users, email unique, name, phone, totalOrders, totalSpent cents, aiProfile jsonb, tags jsonb, createdAt, updatedAt)
    - Define `orders` (id, orderNumber unique, customerId FK, email, status enum, paymentStatus enum, payfastPaymentId, subtotal, discountTotal, shippingTotal, taxTotal, total — all integer cents, shippingAddress jsonb, trackingNumber, notes, createdAt, updatedAt)
    - Define `orderItems` (id, orderId FK cascade, productId FK, variantId FK, name, sku, quantity, unitPrice cents, totalPrice cents, image)
    - Define `inventoryLogs` (id, variantId FK, type enum, quantityChange, newQuantity, note, createdAt)
    - Define NextAuth tables: `users` (id text PK, name, email unique, emailVerified, image, role default "USER"), `accounts`, `sessions`, `verificationTokens`
    - Export TypeScript types: `ScentNotes`, `Address`, `AIProfile`, `CartItem`
    - Create `drizzle.config.ts` pointing to `src/server/db/schema.ts`
    - Add `package.json` scripts: `db:generate`, `db:push`, `db:studio`, `db:seed`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 1.5 Set up tRPC v11 with all routers and server/client helpers
    - Create `src/server/api/trpc.ts` — `createTRPCRouter`, `publicProcedure`, `protectedProcedure` (throws UNAUTHORIZED if no session), `adminProcedure` (throws UNAUTHORIZED if no session or role !== "ADMIN"), tRPC context with session
    - Create stub routers in `src/server/api/routers/`: `products.ts`, `orders.ts`, `inventory.ts`, `analytics.ts`, `customers.ts`, `ai.ts` — each exports a router with placeholder procedures
    - Create `src/server/api/root.ts` — combine all sub-routers into `appRouter`, export `AppRouter` type
    - Create `src/app/api/trpc/[trpc]/route.ts` — tRPC HTTP handler supporting GET and POST
    - Create `src/trpc/server.ts` — `createCaller` for use in Server Components (RSC)
    - Create `src/trpc/client.ts` — `createTRPCClient` with superjson transformer
    - Create `src/trpc/react.tsx` — `TRPCReactProvider` wrapping TanStack Query + tRPC client, export `api` hook object
    - _Requirements: 1.9, 1.10, 1.11_

  - [x] 1.6 Configure NextAuth v5 with Google and Resend providers
    - Create `src/server/auth.ts` — NextAuth with DrizzleAdapter, Google provider, Resend provider (from: `noreply@fraviont.com`), session callback augmenting `user.id` and `user.role`
    - Create `src/types/next-auth.d.ts` — augment Session interface with `user.id: string` and `user.role: string`, augment User interface with `role: string`
    - Create `src/middleware.ts` — auth middleware: redirect `/admin/*` unauthenticated → `/admin/login`, non-ADMIN → `/`; redirect `/account/*` unauthenticated → `/login`; export `config` matcher
    - _Requirements: 1.12, 1.13, 1.14_

  - [x] 1.7 Implement utility functions and Redis client
    - Create `src/lib/utils.ts` — export `cn()` (clsx + tailwind-merge), `formatPrice(cents: number): string` (ZAR format, e.g. "R285.00"), `formatDate(date: Date | string): string`, `generateOrderNumber(): string` (e.g. "FRV-20240115-XXXX")
    - Create `src/lib/redis/client.ts` — `redis` (Redis.fromEnv()), `getCart(sessionId)`, `setCart(sessionId, items)` (7-day TTL), `chatRateLimiter` (Ratelimit sliding window 10/min), `withCache<T>(key, ttl, fn)` generic cache helper
    - _Requirements: 1.15, 8.3_

  - [x] 1.8 Checkpoint — Foundation complete
    - Run `pnpm tsc --noEmit` and confirm zero TypeScript errors
    - Ensure all imports resolve and no circular dependencies exist
    - _Requirements: 1.17_


- [x] 2. Phase 1 — Store: Customer-facing storefront
  - [x] 2.1 Implement store layout with Navigation and Footer
    - Create `src/app/(store)/layout.tsx` — wraps children with Navigation above, Footer below, `#0A0A0A` background; include `ChatWidget` (added in Phase 3)
    - Create `src/components/store/Navigation.tsx` — `"use client"`: brand "FRAVIONT" in Cinzel with `letter-spacing: 0.2em` left; centred links PERFUMES, COSMETICS, JEWELRY, COLLECTIONS via `next/link`; Search, Account, Cart icons right; cart badge from `useCartStore().itemCount`; hamburger for mobile; `setupNavScroll()` and `openMobileMenu()` inside `useGSAP`; gold hover/active states
    - Create `src/components/store/Footer.tsx` — `#0D0D0D` background, 3-column link grid, newsletter signup input, social icons, copyright line
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 2.2 Build homepage sections
    - Create `src/app/(store)/page.tsx` — Server Component composing all homepage sections
    - Create `src/components/store/HeroSection.tsx` — `"use client"`: full-viewport dark bg, Cormorant Garamond headline "The Art of Presence" 7rem weight 300, `animateHero()` inside `useGSAP`, `magneticButton()` on primary CTA
    - Create `src/components/store/CategoryShowcase.tsx` — `"use client"`: three dark cards for Perfumes, Cosmetics, Jewelry; `setupCardHover()` and `revealStagger()` inside `useGSAP` with ScrollTrigger
    - Create `NewArrivalsSection` as a Server Component in `src/app/(store)/page.tsx` — wrapped in `<Suspense fallback={<ProductGridSkeleton count={4} />}>`, fetches up to 4 featured products via tRPC caller
    - Create `AIQuizCTA` section — `"use client"`: full-width dark panel, `revealSection()` inside `useGSAP`
    - Create `NewsletterSection` — email input and subscribe button
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 2.3 Implement products tRPC router (public procedures)
    - In `src/server/api/routers/products.ts`, implement `products.getAll` as `publicProcedure`: accept `{ category?, search?, page=1, limit=12 }`, check Redis `products:list:{hash}` (TTL 120s) via `withCache`, query Drizzle with filters, return `{ products, total, hasMore }`
    - Implement `products.getBySlug` as `publicProcedure`: accept `{ slug }`, check Redis `products:slug:{slug}` (TTL 300s), return product with variants
    - _Requirements: 6.1, 6.2, 7.1_

  - [x] 2.4 Build product catalog page with ProductCard, ProductGrid, and FiltersPanel
    - Create `src/app/(store)/shop/page.tsx` — Server Component with `<Suspense fallback={<ProductGridSkeleton count={9} />}>` wrapping data component; reads `category`, `search`, `page` from searchParams
    - Create `src/components/store/ProductCard.tsx` — `"use client"`: 3:4 aspect-ratio image, category label, product name, short description, price in gold via `formatPrice()`, wrapped in `<Link href={/product/${slug}}>`, `setupCardHover()` inside `useGSAP`
    - Create `src/components/store/ProductGrid.tsx` — `"use client"`: responsive 3/2/1 column grid, `revealStagger()` on mount inside `useGSAP`; renders `<ProductGridSkeleton />` when `isPending`
    - Create `src/components/store/FiltersPanel.tsx` — `"use client"`: category tabs and price range filter, updates URL search params via `useRouter` + `useSearchParams`
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 2.5 Build product detail page
    - Create `src/app/(store)/product/[slug]/page.tsx` — Server Component with `generateMetadata()` for SEO and `generateStaticParams()` for static generation; wraps detail in `<Suspense fallback={<ProductDetailSkeleton />}>`
    - Create `src/components/store/ProductGallery.tsx` — `"use client"`: main large image + thumbnail strip, clicking thumbnail updates main image
    - Create `src/components/store/VariantSelector.tsx` — `"use client"`: toggle buttons per variant, selected variant highlighted with gold border
    - Create `src/components/shared/ScentProfile.tsx` — `"use client"`: fragrance pyramid with top/heart/base note rings, `animateScentNotes()` inside `useGSAP`; only rendered when product has `scentNotes`
    - Create `src/components/store/AddToCart.tsx` — `"use client"`: quantity stepper (1–10), "Add to Collection" gold button, `useCartStore().addItem`, GSAP scale pulse (0.97→1.0) on click inside `useGSAP`
    - Wire two-column layout (55% gallery / 45% sticky info) with shadcn Accordion for Description, Details, Shipping & Returns
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [x] 2.6 Implement Zustand cart store and CartDrawer
    - Create `src/lib/stores/cart.store.ts` — Zustand store with persist middleware: state `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, computed `total` (sum of price×quantity), computed `itemCount`; `CartItem` type as defined in schema
    - Create `src/components/store/CartDrawer.tsx` — `"use client"`: shadcn `<Sheet>` wrapper; `revealStagger()` on line items inside `useGSAP({ dependencies: [open] })`; GSAP exit animation on remove (`x: 40, opacity: 0, height: 0, duration: 0.35`); free shipping progress bar animated with `gsap.to(bar, { width: pct, duration: 0.6, ease: EASE.enter })`; subtotal via `formatPrice()` in gold; empty state with bag icon and "Your cart is empty"
    - Wire Navigation cart icon click to open CartDrawer; cart badge from `useCartStore().itemCount`
    - Implement Redis cart sync: on `addItem`/`removeItem`/`updateQuantity`, call `setCart(sessionId, items)` using session ID from cookie
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12_

  - [x] 2.7 Implement PayFast client and checkout flow
    - Create `src/lib/payfast/client.ts` — `generatePayFastForm(params: PayFastParams)`: build fields object, generate MD5 signature with passphrase, return `{ actionUrl, fields }`; `verifyITN(body)`: verify MD5 signature + validate with PayFast server, return boolean; sandbox/production URL switching via `PAYFAST_SANDBOX` env var
    - Create `src/app/api/payfast/itn/route.ts` — POST handler: parse form body, call `verifyITN()`, on invalid return 400, on COMPLETE update order `status=confirmed` + `paymentStatus=paid`, decrement stock, return 200 "OK"
    - Create `src/app/api/checkout/create-order/route.ts` — POST handler: create order in DB with `status=pending`, call `generatePayFastForm`, return `{ actionUrl, fields }`
    - Create `src/app/(store)/checkout/page.tsx` — `"use client"`: react-hook-form + zod contact/shipping form, order summary; on submit POST to `/api/checkout/create-order`, receive `{ actionUrl, fields }`, create hidden HTML form, auto-submit to redirect to PayFast
    - Create `src/app/(store)/checkout/success/page.tsx` — show order number, items, estimated delivery, "Continue Shopping" button
    - Create `src/app/(store)/checkout/cancel/page.tsx` — "Return to Cart" button
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12_

  - [x] 2.8 Build customer account pages
    - Implement `orders.getMyOrders` as `protectedProcedure` in `src/server/api/routers/orders.ts` — return orders for the current session user
    - Create `src/app/(store)/account/page.tsx` — order history list with order number, date, total, status badge; wrapped in `<Suspense>`
    - Create `src/app/(store)/account/orders/[id]/page.tsx` — order detail with line items table
    - Create `src/app/(store)/account/profile/page.tsx` — profile settings form (name, email display)
    - _Requirements: 1.14 (account route protection)_

  - [x] 2.9 Checkpoint — Store phase complete
    - Run `pnpm tsc --noEmit` and confirm zero TypeScript errors
    - Verify all store pages render with correct skeleton fallbacks
    - _Requirements: 1.17_


- [x] 3. Phase 2 — Admin Panel
  - [x] 3.1 Build admin layout with sidebar, header, and login page
    - Create `src/app/(admin)/layout.tsx` — Server Component: check session via `auth()`, redirect to `/admin/login` if no session or role !== "ADMIN"; render `AdminSidebar` + `AdminHeader` + `{children}`
    - Create `src/components/admin/AdminSidebar.tsx` — `"use client"`: 240px width, collapsible to 64px icon-only; `#111111` background; "FRAVIONT" in Cinzel + "ADMIN" in ash at top; nav items with lucide-react icons (Dashboard, Orders, Products, Inventory, Analytics, Customers, Settings) using `next/link` + `usePathname`; active item: 2px left gold border, gold text, lighter background
    - Create `src/components/admin/AdminHeader.tsx` — `"use client"`: 64px height, `#111111` bg, 1px `#1E1E1E` bottom border, dynamic page title left, user avatar dropdown (Profile, Sign Out) right
    - Create `src/app/(admin)/login/page.tsx` — "Sign in with Google" and "Sign in with Email" (magic link) buttons, FRAVIONT branding
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [x] 3.2 Implement analytics tRPC router and admin dashboard
    - In `src/server/api/routers/analytics.ts`, implement `analytics.getDashboardStats` as `adminProcedure`: check Redis `analytics:dashboard` (TTL 300s), query DB for todayRevenue, yesterdayRevenue, todayOrders, weekOrders, avgOrderValue, recentOrders (last 10), lowStockVariants (stock <= threshold), return via `withCache`
    - Implement `analytics.getRevenue` as `adminProcedure`: accept `{ period: "7d"|"30d"|"90d"|"12m" }`, return `{ date, revenue }[]` cached 300s
    - Implement `analytics.getOrderStats`, `analytics.getTopProducts`, `analytics.getCustomerStats`, `analytics.getPnL` as `adminProcedure` procedures, each cached 300s
    - Create `src/app/(admin)/dashboard/page.tsx` — Server Component: 4 KPI cards + two-column layout (RevenueChart + AIDigestCard | RecentOrdersTable + LowStockAlerts); each section wrapped in `<Suspense>` with appropriate skeleton
    - Create `src/components/admin/KPICard.tsx` — `"use client"`: `#171717` bg, 1px `#1E1E1E` border, label, value, percentage change badge, trend icon; `animateKPICards()` + `countUp()` inside `useGSAP`; renders `<KPICardSkeleton />` while loading
    - Create `src/components/admin/RevenueChart.tsx` — `"use client"`: recharts LineChart in shadcn `<ChartContainer>`, gold line colour, dark background; `animateChartReveal()` inside `useGSAP`
    - Create `src/components/admin/AIDigestCard.tsx` — `"use client"`: fetches `ai.getDailyDigest`, shows `<ChatMessageSkeleton />` ×3 while loading, gold left border, Cormorant Garamond text
    - Create `src/components/admin/RecentOrdersTable.tsx` — shadcn Table: order number, customer, date, total, status badge
    - Create `src/components/admin/LowStockAlerts.tsx` — list variants with orange (stock <= threshold) or red (stock = 0) badges
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

  - [x] 3.3 Implement products admin tRPC procedures and CRUD UI
    - In `src/server/api/routers/products.ts`, implement admin procedures: `products.getById` (adminProcedure, returns product + variants), `products.create` (adminProcedure, full Zod-validated input), `products.update` (adminProcedure, partial update), `products.delete` (adminProcedure, soft delete `isActive: false`); invalidate Redis cache keys on create/update/delete
    - Create `src/app/(admin)/products/page.tsx` — Server Component: `<Suspense fallback={<TableSkeleton />}>` wrapping products table; search by name, filter by category and active/inactive
    - Create `src/app/(admin)/products/new/page.tsx` and `src/app/(admin)/products/[id]/page.tsx` — render `ProductForm` for create/edit
    - Create `src/components/admin/ProductForm.tsx` — `"use client"`: react-hook-form + Zod validation; tabs: Basic Info, Media, Description, Variants, SEO; `useWatch` to show/hide category-specific fields; variants as array field (add/remove/edit); image upload with file preview and URL array storage; "Generate with AI" button calling `ai.generateDescription`; success/error toasts on save
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12_

  - [x] 3.4 Implement orders admin tRPC procedures and management UI
    - In `src/server/api/routers/orders.ts`, implement: `orders.getAll` (adminProcedure, paginated with filters: status, dateFrom, dateTo, search, page, limit; joined with customer + items), `orders.getById` (adminProcedure, full order + items + customer), `orders.updateStatus` (adminProcedure, `{ id, status, trackingNumber? }`), `orders.addNote` (adminProcedure, `{ id, note }`)
    - Create `src/app/(admin)/orders/page.tsx` — orders table with status multi-select filter, date range filter, payment status filter, search bar; status badges with colour mapping (pending=amber, confirmed/processing=sapphire, shipped/delivered=emerald, cancelled/refunded=crimson)
    - Create `src/app/(admin)/orders/[id]/page.tsx` — order detail with visual status timeline (Pending→Confirmed→Processing→Shipped→Delivered), line items table (thumbnails, names, quantities, unit prices, totals), update status form with tracking number input
    - Create `src/components/admin/StatusTimeline.tsx` — visual step indicator for order status progression
    - Create `src/components/shared/StatusBadge.tsx` — order status badge with colour mapping
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

  - [x] 3.5 Implement inventory management
    - In `src/server/api/routers/inventory.ts`, implement: `inventory.getAll` (adminProcedure, returns variants joined with product), `inventory.adjust` (adminProcedure, `{ variantId, type, quantityChange, note? }` — updates stock, inserts inventory log), `inventory.getLogs` (adminProcedure, `{ variantId? }`)
    - Create `src/app/(admin)/inventory/page.tsx` — `<Suspense fallback={<TableSkeleton />}>` wrapping inventory table
    - Create `InventoryTable` component — shows product name, SKU, current stock, low stock threshold, last updated; colour-coded stock levels
    - Create `src/components/admin/StockAdjustmentModal.tsx` — `"use client"`: shadcn Dialog, form with type (restock/adjustment/return), quantity change, note; calls `inventory.adjust` mutation; success/error toast
    - _Requirements: (inventory management — implied by admin panel requirements and tRPC router map)_

  - [x] 3.6 Build analytics dashboard with 5-tab layout
    - Create `src/app/(admin)/analytics/page.tsx` — shadcn Tabs with 5 tabs: Revenue, Orders, Products, Customers, Finance
    - Revenue tab: line chart of revenue over time (7d/30d/90d/12m period selector) using `analytics.getRevenue`
    - Orders tab: order volume chart + order status breakdown using `analytics.getOrderStats`
    - Products tab: top products by sales using `analytics.getTopProducts`
    - Customers tab: new vs returning, LTV distribution using `analytics.getCustomerStats`
    - Finance tab: P&L summary using `analytics.getPnL`
    - All charts use recharts in shadcn `<ChartContainer>` with gold accent colour and dark background
    - _Requirements: 11.7 (analytics charts)_

  - [x] 3.7 Build customer CRM
    - In `src/server/api/routers/customers.ts`, implement: `customers.getAll` (adminProcedure, `{ search?, page?, limit? }`, returns `{ customers, total }`), `customers.getById` (adminProcedure, returns customer + orders)
    - Create `src/app/(admin)/customers/page.tsx` — `<Suspense fallback={<TableSkeleton />}>` wrapping customers table; search by name/email; columns: name, email, total orders, LTV, joined date, tags
    - Create `src/app/(admin)/customers/[id]/page.tsx` — customer detail: profile info, AI profile display, order history table, tags
    - _Requirements: (customer CRM — implied by admin panel requirements and tRPC router map)_

  - [x] 3.8 Checkpoint — Admin phase complete
    - Run `pnpm tsc --noEmit` and confirm zero TypeScript errors
    - Verify all admin pages render with correct skeleton fallbacks and auth protection
    - _Requirements: 1.17_


- [x] 4. Phase 3 — AI Features
  - [x] 4.1 Implement OpenRouter client and prompt library
    - Create `src/lib/ai/client.ts` — `callAI({ model, messages, system, temperature, max_tokens })`: fetch to `https://openrouter.ai/api/v1/chat/completions` with Authorization, HTTP-Referer, X-Title headers; return `choices[0].message.content`; throw on non-OK response
    - Create `src/lib/ai/prompts.ts` — export: `SOPHIA_SYSTEM_PROMPT` (luxury concierge persona), `buildDescriptionPrompt(product)` (luxury editorial copy generator), `buildProfilePrompt(answers, products)` (scent profile from quiz answers), `buildDailyDigestPrompt(stats)` (daily performance narrative), `buildForecastPrompt(stockData, salesData)` (restock recommendations)
    - _Requirements: (AI integration — implied by AI feature requirements)_

  - [x] 4.2 Implement AI tRPC router with all procedures
    - In `src/server/api/routers/ai.ts`, implement `ai.chat` as `publicProcedure`: accept `{ message, sessionId }`, check `chatRateLimiter` (throw `TOO_MANY_REQUESTS` if exceeded), build messages array with `SOPHIA_SYSTEM_PROMPT`, call `callAI({ model: "anthropic/claude-3-5-haiku", messages })`, return `{ reply }`
    - Implement `ai.generateDescription` as `adminProcedure`: accept `{ productId }`, check Redis `ai:description:{productId}` (TTL 3600s), fetch product from DB, call `callAI({ model: "anthropic/claude-3-5-sonnet", system: buildDescriptionPrompt(product) })`, cache result, return `{ description, aiDescription }`
    - Implement `ai.generateProfile` as `publicProcedure`: accept `{ answers, products }`, call `callAI({ model: "anthropic/claude-3-5-haiku", system: buildProfilePrompt(answers, products) })`, return `{ profile, recommendations }`
    - Implement `ai.getDailyDigest` as `adminProcedure`: check Redis `ai:digest` (TTL 23h), on miss generate on-demand via `callAI({ model: "openai/gpt-4o", system: buildDailyDigestPrompt(stats) })`, return `{ digest, generatedAt }`
    - Implement `ai.getForecast` as `adminProcedure`: check Redis `ai:forecast` (TTL 3600s), fetch stock + sales data, call `callAI({ model: "openai/gpt-4o", system: buildForecastPrompt(stockData, salesData) })`, return `ForecastResult[]`
    - Implement `ai.semanticSearch` as `publicProcedure`: accept `{ query }`, check Redis `search:semantic:{queryHash}` (TTL 300s), generate embedding via `text-embedding-3-small`, pgvector cosine similarity search on `products.embedding`, fallback to ILIKE text search if no results, cache and return ranked products
    - _Requirements: (AI router — implied by tRPC router map and AI feature requirements)_

  - [x] 4.3 Build Sophia concierge ChatWidget
    - Create `src/components/store/ChatWidget.tsx` — `"use client"`: fixed bottom-right floating button with GSAP elastic mount and `magneticButton()` on mount; ChatPanel slides in/out via GSAP; `MessageList` with `UserMessage` (right-aligned, gold bg) and `AIMessage` (left-aligned, dark bg); `TypingIndicator` (3 gold dots with CSS animation-delay); `QuickSuggestions` (3 chips shown when empty); `MessageInput` (textarea, Enter=send, Shift+Enter=newline); calls `ai.chat` mutation; new messages animate in (`y: 16→0, opacity: 0→1`)
    - Add `ChatWidget` to `src/app/(store)/layout.tsx`
    - _Requirements: (Sophia concierge — implied by AI feature requirements and component tree)_

  - [x] 4.4 Wire AI description generator into ProductForm
    - In `src/components/admin/ProductForm.tsx`, wire the "Generate with AI" button to call `api.ai.generateDescription.useMutation()`; on success, populate the description and aiDescription fields via `form.setValue`; show loading state on button during pending; show error toast on failure
    - _Requirements: 12.10_

  - [x] 4.5 Build scent profile quiz
    - Create `src/app/(store)/quiz/page.tsx` — multi-step quiz UI with questions about scent preferences, occasion, and style
    - Create quiz step components with GSAP slide transitions between steps
    - On quiz completion, call `ai.generateProfile({ answers, products })` mutation; display personalised scent profile and product recommendations
    - _Requirements: (scent quiz — implied by AI feature requirements)_

  - [x] 4.6 Implement semantic search with pgvector embeddings
    - Enable pgvector extension in Neon and add `embedding vector(1536)` column to products schema (already defined in schema.ts)
    - In `ai.semanticSearch` procedure (implemented in 4.2), ensure embedding generation uses OpenAI `text-embedding-3-small` via OpenRouter
    - Create a search UI component or integrate into the existing search modal in Navigation
    - Add a script or admin action to generate and store embeddings for existing products
    - _Requirements: (semantic search — implied by AI router and design)_

  - [x] 4.7 Implement admin daily digest cron job
    - Create `src/app/api/cron/daily-digest/route.ts` — POST handler: verify `Authorization: Bearer ${CRON_SECRET}` header, fetch `DashboardStats` from DB, call `callAI({ model: "openai/gpt-4o", system: buildDailyDigestPrompt(stats) })`, store result in Redis `ai:digest` with 23h TTL, return 200
    - Wire `AIDigestCard` to display the cached digest (already implemented in 3.2)
    - _Requirements: 11.8 (AIDigestCard)_

  - [x] 4.8 Implement inventory forecasting
    - In `ai.getForecast` procedure (implemented in 4.2), fetch last 90 days of sales data and current stock levels from DB
    - Display forecast results in the admin inventory page — add a "Forecast" tab or section showing `ForecastResult[]` with variantId, currentStock, suggestedReorder, urgency
    - _Requirements: (inventory forecasting — implied by AI router)_

  - [x] 4.9 Checkpoint — AI phase complete
    - Run `pnpm tsc --noEmit` and confirm zero TypeScript errors
    - Verify rate limiting, caching, and fallback error handling work correctly
    - _Requirements: 1.17_


- [x] 5. Phase 4 — Email, Deployment & Property-Based Tests
  - [x] 5.1 Build React Email templates
    - Create `src/lib/email/templates/OrderConfirmation.tsx` — React Email component: order number, line items table with images, subtotal/shipping/total, estimated delivery, "Track Order" button
    - Create `src/lib/email/templates/ShippingNotification.tsx` — React Email component: order number, tracking number, carrier, "Track Shipment" button
    - Create `src/lib/email/templates/LowStockAlert.tsx` — React Email component: list of low-stock variants with current stock and threshold, "Manage Inventory" button
    - Create `src/lib/email/templates/AbandonedCart.tsx` — React Email component: cart items with images and prices, "Complete Your Order" CTA
    - Create `src/lib/email/templates/WelcomeEmail.tsx` — React Email component: welcome message, featured categories, "Start Shopping" button
    - Wire `OrderConfirmation` send in the PayFast ITN handler after successful payment (fire-and-forget, wrapped in try/catch)
    - Wire `ShippingNotification` send in `orders.updateStatus` when status changes to "shipped"
    - _Requirements: (email templates — implied by design and TECH_STACK.md)_

  - [x] 5.2 Implement cron jobs
    - Create `src/app/api/cron/abandoned-cart/route.ts` — POST handler: verify `CRON_SECRET`, query orders with `status=pending` older than 1 hour that have associated cart items, send `AbandonedCart` email via Resend, return 200
    - Create `vercel.json` with cron configuration: `daily-digest` at `0 6 * * *` (06:00 UTC), `abandoned-cart` at `0 * * * *` (hourly)
    - _Requirements: (cron jobs — implied by design file structure)_

  - [x] 5.3 Create database seed script
    - Create `src/server/db/seed.ts` — seed script with: 3–5 sample products per category (perfumes, cosmetics, jewelry, gift_sets) with realistic names, descriptions, prices in cents, images, scentNotes for perfumes, variants with stock; 1 admin user; sample orders
    - Wire `db:seed` script in `package.json` to run `tsx src/server/db/seed.ts`
    - _Requirements: 1.8_

  - [x] 5.4 Configure production deployment
    - Create/update `next.config.ts` with PPR, React Compiler, and image remote patterns for R2/Vercel Blob
    - Create `vercel.json` with cron job definitions and any required headers/rewrites
    - Ensure all environment variables are documented in `.env.example`
    - _Requirements: 1.16_

  - [x] 5.5 Set up Vitest and fast-check testing infrastructure
    - Create `vitest.config.ts` with `environment: "node"`, `globals: true`, `setupFiles: ["./src/test/setup.ts"]`, path alias `@` → `./src`
    - Create `src/test/setup.ts` — global test setup: mock environment variables (DATABASE_URL, PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_SANDBOX, NEXTAUTH_URL)
    - Add `test` and `test:coverage` scripts to `package.json`
    - _Requirements: (testing infrastructure — implied by design testing strategy)_

  - [x] 5.6 Write property test for formatPrice round-trip
    - Create `src/test/properties/formatPrice.test.ts`
    - **Property 1: formatPrice Round-Trip** — for any positive integer cents (1 to 10,000,000), `formatPrice(cents)` returns a non-empty string and `parseFloat` of the numeric portion is a finite number greater than zero
    - **Validates: Requirements 1.4, 1.15**
    - _Requirements: 1.4, 1.15_

  - [x] 5.7 Write property test for products.getAll response shape
    - Create `src/test/properties/productsGetAll.test.ts`
    - **Property 2: products.getAll Response Shape Invariant** — for any valid `{ page, limit }` combination, response always has `products` array (length ≤ limit), non-negative integer `total`, boolean `hasMore`; when `hasMore` is true, `total > page * limit`
    - **Validates: Requirements 6.1**
    - _Requirements: 6.1_

  - [x] 5.8 Write property test for PayFast signature generation
    - Create `src/test/properties/payfastSignature.test.ts`
    - **Property 3: PayFast Signature Generation Produces Valid MD5** — for any valid `PayFastParams`, `generatePayFastForm(params).fields.signature` is a 32-character lowercase hex string and all required fields are present
    - **Validates: Requirements 9.1**
    - _Requirements: 9.1_

  - [x] 5.9 Write property test for PayFast ITN verification round-trip
    - Create `src/test/properties/payfastITN.test.ts`
    - **Property 4: PayFast ITN Verification Round-Trip** — for any valid `PayFastParams`, the generated signature passes local MD5 check; any tampered field causes the check to fail
    - **Validates: Requirements 9.2**
    - _Requirements: 9.2_

  - [x] 5.10 Write property test for cart state invariants
    - Create `src/test/properties/cartStore.test.ts`
    - **Property 5: Cart State Invariants** — for any sequence of `addItem` calls, `itemCount` equals sum of all quantities; `total` equals sum of `price × quantity`; `removeItem(id)` removes the item; `clearCart()` results in `itemCount === 0` and empty `items`
    - **Validates: Requirements 8.1**
    - _Requirements: 8.1_

  - [x] 5.11 Write property test for semantic search ordering
    - Create `src/test/properties/semanticSearch.test.ts`
    - **Property 6: Semantic Search Results Ordered by Similarity** — for any search query returning multiple results, adjacent results satisfy `a.similarityScore >= b.similarityScore`; use mocked embeddings in CI
    - **Validates: Requirements (semantic search ordering)_**
    - _Requirements: (semantic search)_

  - [x] 5.12 Write property test for AI chat rate limiting
    - Create `src/test/properties/chatRateLimit.test.ts`
    - **Property 7: AI Chat Rate Limiting** — for any session ID, after exactly 10 `ai.chat` calls within a 60-second window, the 11th call is rejected with `TOO_MANY_REQUESTS`; use mocked Redis in tests
    - **Validates: Requirements (AI rate limiting)_**
    - _Requirements: (AI rate limiting)_

  - [x] 5.13 Final checkpoint — All tests pass, platform complete
    - Run `pnpm tsc --noEmit` — zero TypeScript errors
    - Run `pnpm test --run` — all property tests and unit tests pass
    - Verify all phases are wired together: store → cart → checkout → PayFast → ITN → order confirmation email
    - Verify admin panel: auth protection, CRUD operations, analytics, AI digest
    - _Requirements: 1.17_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All prices are stored as integer cents — never use decimal or float types in the DB
- Import `gsap` and `ScrollTrigger` only from `src/lib/gsap/config.ts` — never directly from the `gsap` package in component files
- Use `useGSAP` from `@gsap/react` for all animations — never raw `useEffect`
- Every Server Component with async data needs `<Suspense fallback={<XSkeleton />}>`
- Every Client Component `useQuery` must check `isPending` and render the matching skeleton
- All admin tRPC procedures must use `adminProcedure` — never `publicProcedure` or `protectedProcedure`
- Property tests (Properties 1–7) are defined in the design document's Correctness Properties section
- Checkpoints ensure incremental validation at the end of each phase
