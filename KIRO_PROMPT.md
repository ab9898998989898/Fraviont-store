# KIRO_PROMPT.md — Master Prompts for Fraviont

> These are the exact prompts to paste into Kiro, in order.
> **Read this file top to bottom before you start.**

---

## SETUP (Do Once Before Any Prompts)

1. Put ALL markdown files in the root of your project:
   ```
   fraviont/
   ├── .kiro/steering/fraviont.md   ← Steering rules (CRITICAL)
   ├── README.md
   ├── TECH_STACK.md
   ├── AI_FEATURES.md
   ├── DESIGN_SYSTEM.md
   ├── ADMIN_PANEL.md
   ├── STORE_FEATURES.md
   ├── IMPLEMENTATION_GUIDE.md
   ├── CONTEXT.md
   └── CHANGELOG.md
   ```

2. Open Kiro → Steering panel → confirm `.kiro/steering/fraviont.md` is loaded

3. Run the scaffold command manually before ANY prompts:
   ```bash
   pnpm create next-app@latest fraviont --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   cd fraviont
   ```

4. Then use the prompts below IN ORDER. Verify each works before moving to the next.

---

## HOW TO USE THESE PROMPTS

- Paste ONE prompt at a time into Kiro chat
- After each step: run `pnpm dev`, check for errors, then move on
- If Kiro drifts from the spec, paste this reset: **"Stop. Re-read CONTEXT.md and TECH_STACK.md before continuing."**
- Mark each step as `[x]` done in CONTEXT.md as you complete it

---

---

# PHASE 0: FOUNDATION

---

## PROMPT 0.1 — Install Dependencies

```
Read TECH_STACK.md section "Full package.json Dependencies".
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP" section for the GSAP package list.

Install ALL listed dependencies using pnpm. Run these commands:

pnpm add drizzle-orm @neondatabase/serverless @trpc/server @trpc/client @trpc/react-query @tanstack/react-query next-auth @auth/drizzle-adapter @upstash/redis @upstash/ratelimit resend @react-email/components zod clsx tailwind-merge lucide-react zustand date-fns recharts react-hot-toast superjson

pnpm add gsap @gsap/react

pnpm add -D drizzle-kit @types/node prettier prettier-plugin-tailwindcss

Then install shadcn:
pnpx shadcn@latest init --defaults

Then add these shadcn components:
pnpx shadcn@latest add button card dialog form input label table tabs badge select dropdown-menu sheet command chart toast separator skeleton progress

Create .env.example with ALL variables from README.md.
Create .env.local from .env.example (leave values blank for now).
Do NOT create any src/ files yet.
```

---

## PROMPT 0.1b — GSAP Setup

```
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP" section completely before writing any code.

Create these files EXACTLY as shown in DESIGN_SYSTEM.md:

1. src/lib/gsap/config.ts
   - Import gsap, ScrollTrigger, TextPlugin from "gsap" and "gsap/ScrollTrigger" etc.
   - Register plugins inside if (typeof window !== "undefined") guard
   - Set gsap.defaults({ ease: "power3.out", duration: 0.9 })
   - Set ScrollTrigger.defaults({ toggleActions: "play none none reverse", start: "top 88%" })
   - Export { gsap, ScrollTrigger }

2. src/lib/gsap/easings.ts
   - Export the EASE object with all keys from DESIGN_SYSTEM.md

3. src/lib/gsap/animations/hero.ts — animateHero() function
4. src/lib/gsap/animations/scrollReveal.ts — revealSection(), revealStagger(), horizontalScroll()
5. src/lib/gsap/animations/productCard.ts — setupCardHover(), magneticButton()
6. src/lib/gsap/animations/navigation.ts — openMobileMenu(), setupNavScroll()
7. src/lib/gsap/animations/textEffects.ts — charReveal(), countUp(), goldShimmer()
8. src/lib/gsap/animations/scentProfile.ts — animateScentNotes()
9. src/lib/gsap/animations/admin.ts — animateKPICards(), animateChartReveal()

10. Add the page curtain div to src/app/layout.tsx:
    <div id="page-curtain" style={{ position:"fixed", inset:0, zIndex:9999, backgroundColor:"#C9A84C", transform:"scaleY(0)", transformOrigin:"bottom", pointerEvents:"none" }} />

IMPORTANT: All animation functions are plain TypeScript — they accept DOM element refs and return GSAP timelines.
They are called INSIDE useGSAP(() => { ... }, { scope: containerRef }) in components.
Never call GSAP outside of useGSAP or useEffect.
```

---

## PROMPT 0.2 — Database Schema

```
Read TECH_STACK.md sections "Drizzle ORM + Neon" and the full schema code block.
Read CONTEXT.md "Database Schema Summary".

Create these files EXACTLY as specified:

1. src/server/db/schema.ts
   - All tables: products, productVariants, orders, orderItems, customers, inventory_logs
   - All enums: productCategoryEnum, orderStatusEnum, paymentStatusEnum, inventoryLogTypeEnum
   - All NextAuth required tables (users, accounts, sessions, verificationTokens) for DrizzleAdapter
   - Prices stored as INTEGER (cents), never decimal
   - Use uuid() primary keys with defaultRandom()
   - Include createdAt/updatedAt timestamps on all main tables

2. src/server/db/index.ts
   - Neon HTTP client using neon() from @neondatabase/serverless
   - drizzle() instance with schema imported

3. drizzle.config.ts
   - dialect: "postgresql"
   - schema: "./src/server/db/schema.ts"
   - out: "./drizzle/migrations"

4. Add to package.json scripts:
   "db:generate": "drizzle-kit generate"
   "db:push": "drizzle-kit push"
   "db:studio": "drizzle-kit studio"

Do NOT run db:push yet. Do NOT create any other files.
```

---

## PROMPT 0.3 — tRPC Setup

```
Read TECH_STACK.md section "tRPC v11".
Read CONTEXT.md "tRPC Router Map".

Create these files:

1. src/server/api/trpc.ts
   - createTRPCContext() using auth() from NextAuth
   - Base router and procedure helpers
   - publicProcedure (no auth check)
   - protectedProcedure (throws UNAUTHORIZED if no session)
   - adminProcedure (throws UNAUTHORIZED if session.user.role !== "ADMIN")
   - Use superjson transformer

2. src/server/api/root.ts
   - appRouter combining ALL sub-routers (create empty placeholder routers for now)
   - Export AppRouter type

3. src/server/api/routers/products.ts — empty router stub
4. src/server/api/routers/orders.ts — empty router stub
5. src/server/api/routers/inventory.ts — empty router stub
6. src/server/api/routers/analytics.ts — empty router stub
7. src/server/api/routers/customers.ts — empty router stub
8. src/server/api/routers/ai.ts — empty router stub

9. src/app/api/trpc/[trpc]/route.ts — Next.js App Router handler (GET + POST)

10. src/trpc/server.ts — server-side caller using createCallerFactory
11. src/trpc/client.tsx — TRPCReactProvider with QueryClient + createTRPCReact

Verify: no TypeScript errors with `pnpm tsc --noEmit`.
```

---

## PROMPT 0.4 — Auth Setup

```
Read TECH_STACK.md section "Authentication (NextAuth.js v5)".

Create:

1. src/server/auth.ts
   - NextAuth() with DrizzleAdapter(db)
   - Google provider
   - Resend email provider (magic link), from: "noreply@fraviont.com"
   - Session callback: spread session.user + add id and role from user record
   - Augment Session type to include user.id (string) and user.role (string)

2. src/app/api/auth/[...nextauth]/route.ts
   - Export { GET, POST } from handlers

3. src/middleware.ts
   - Protect /admin/* → redirect to /admin/login if no session OR role !== "ADMIN"
   - Protect /account/* → redirect to /login if no session
   - matcher: ["/admin/:path*", "/account/:path*"]

4. Add "role" column to the users table in src/server/db/schema.ts if not already there
   role: text("role").default("USER").notNull()

Do NOT create login page UI yet. Only auth logic.
```

---

## PROMPT 0.5 — Design System & Skeletons

```
Read DESIGN_SYSTEM.md completely — especially "Color Palette", "Typography", "Skeleton Loading System", and the skeleton component code blocks.

Update these files:

1. src/styles/globals.css (or src/app/globals.css):
   - Import Google Fonts: Cormorant Garamond (300,400,500,600,italic), Jost (300,400,500,600), Cinzel (400,500)
   - Set ALL CSS custom properties from DESIGN_SYSTEM.md "Color Palette" section
   - Override ALL shadcn :root CSS variables to the dark luxury theme from TECH_STACK.md
   - Add the @theme block with Tailwind v4 custom tokens
   - Set html { background: #0A0A0A; color: #F5F0E8; }
   - Add the .skeleton CSS class with dark shimmer animation from DESIGN_SYSTEM.md
   - Add @keyframes skeleton-shimmer

2. tailwind.config.ts:
   - Expose all custom color tokens as Tailwind utilities
   - Add fontFamily for display, sans, accent

3. src/lib/utils.ts:
   - cn(), formatPrice(), formatDate(), generateOrderNumber()

4. Override src/components/ui/skeleton.tsx with the dark luxury version from DESIGN_SYSTEM.md (rounded-none, dark shimmer bg)

5. Create ALL skeleton components from DESIGN_SYSTEM.md "Skeleton Components" section:
   - src/components/shared/skeletons/ProductCardSkeleton.tsx
   - src/components/shared/skeletons/ProductGridSkeleton.tsx
   - src/components/shared/skeletons/ProductDetailSkeleton.tsx
   - src/components/shared/skeletons/KPICardSkeleton.tsx
   - src/components/shared/skeletons/TableSkeleton.tsx
   - src/components/shared/skeletons/ChatMessageSkeleton.tsx

Use the EXACT JSX from DESIGN_SYSTEM.md for each skeleton — dimensions must match.
After: run `pnpm dev` and confirm the page background is #0A0A0A.
```

---

---

# PHASE 1: STORE (CUSTOMER-FACING)

---

## PROMPT 1.1 — Store Layout & Navigation

```
Read DESIGN_SYSTEM.md sections "Navigation", "Component Specifications", and "Motion / Animation — GSAP".
Read STORE_FEATURES.md completely.

Create:

1. src/app/(store)/layout.tsx
   - Renders <Navigation /> above, <Footer /> below, children in between
   - Dark background #0A0A0A
   - Include <ChatWidget /> placeholder (just a comment for now)

2. src/components/store/Navigation.tsx  ["use client" — needs scroll + state]
   - Desktop: sticky top nav
     Left: "FRAVIONT" in Cinzel font, letter-spacing: 0.2em
     Center: nav links — PERFUMES | COSMETICS | JEWELRY | COLLECTIONS
     Right: Search icon, Account icon, Cart icon with item count badge
   - Scroll behavior: use setupNavScroll() from src/lib/gsap/animations/navigation.ts
     inside useGSAP() — transparent at top → bg-charcoal/95 + backdrop-blur after 80px
   - Mobile: hamburger button → full-screen dark overlay
     Use openMobileMenu() from navigation.ts — GSAP stagger on links
   - All links use next/link
   - Colors: ivory text, gold-warm on hover/active
   - No rounded corners on any element

3. src/components/store/Footer.tsx
   - Dark background (#0D0D0D)
   - 3-column link grid + newsletter signup + social icons + copyright line
   - Minimal — plenty of whitespace

Run `pnpm dev`. Nav must be visible, dark, with gold hover states. No TypeScript errors.
```

---

## PROMPT 1.2 — Homepage

```
Read DESIGN_SYSTEM.md "Page-Specific Design → Homepage" and "Motion / Animation — GSAP".
Read STORE_FEATURES.md "Homepage Sections".

Create src/app/(store)/page.tsx as a Server Component with these sections.
Each section that needs interactivity is a "use client" sub-component.
Do NOT use framer-motion anywhere.

Build these sections in order:

1. HeroSection.tsx ["use client"]
   Full viewport, dark bg (#0A0A0A), Cormorant headline "The Art of Presence" (7rem, weight 300)
   Use useGSAP() with animateHero() from src/lib/gsap/animations/hero.ts
   Pass refs for: headline, subheadline, divider line, ctaButtons, scrollIndicator
   Apply magneticButton() to primary CTA on mount
   Use CSS gradient placeholder — no external images needed yet

2. CategoryShowcase.tsx ["use client"]
   3 dark cards: Perfumes | Cosmetics | Jewelry
   useGSAP(): apply setupCardHover() to each card, revealStagger() with ScrollTrigger

3. NewArrivals — Server Component wrapper with Suspense
   <Suspense fallback={<ProductGridSkeleton count={4} />}>
   Hardcoded mock data for now (4 products). useGSAP() scroll reveal on grid items.

4. AIQuizCTA.tsx ["use client"]
   Full-width dark panel. useGSAP(): revealSection() on scroll.

5. Newsletter — static, no animation needed

All scroll reveals use revealSection() or revealStagger() from scrollReveal.ts.
Import gsap and ScrollTrigger ONLY from src/lib/gsap/config.ts — never directly from "gsap".
```

---

## PROMPT 1.3 — Products tRPC Router + Catalog Page

```
Read TECH_STACK.md schema (products table).
Read STORE_FEATURES.md "Product Catalog" section.
Read CONTEXT.md "tRPC Router Map".

Step A — Build the tRPC router:
Update src/server/api/routers/products.ts with:
- getAll: publicProcedure, input { category?, search?, page? (default 1), limit? (default 12) }
  Query products where isActive=true, filter by category if provided, 
  basic ILIKE search on name if search provided.
  Check Redis cache first (key: "products:{hash-of-input}", TTL: 120s).
  Return: { products: Product[], total: number, hasMore: boolean }

- getBySlug: publicProcedure, input { slug: string }
  Return single product with its variants. Cache in Redis (TTL: 300s).

Step B — Build catalog UI:
1. src/app/(store)/shop/page.tsx — Server Component with Suspense:
   <Suspense fallback={<ProductGridSkeleton count={9} />}><ProductGridData /></Suspense>
2. src/components/store/ProductCard.tsx ["use client"] — implement per DESIGN_SYSTEM.md spec
   useGSAP(): call setupCardHover() on mount for image scale + overlay reveal
3. src/components/store/ProductGrid.tsx — responsive grid (3-col desktop, 2-col tablet, 1-col mobile)
   useGSAP(): revealStagger() on all cards when grid mounts
4. src/components/store/FiltersPanel.tsx ["use client"] — category tabs + price range
   Updates URL search params on change (useRouter + useSearchParams)

All data-dependent UI must have a shadcn <Skeleton> loading state.
ProductCard must be a <Link href={`/product/${product.slug}`}> wrapper.
```

---

## PROMPT 1.4 — Product Detail Page

```
Read STORE_FEATURES.md "Product Detail Page".
Read DESIGN_SYSTEM.md "Product Detail Page" section.

Create:

1. src/app/(store)/product/[slug]/page.tsx
   - Server Component, fetches via api.products.getBySlug
   - generateMetadata() for SEO (title, description, og:image)
   - generateStaticParams() for static generation if products list available
   - 2-col layout: gallery left (55%), product info right (45%, sticky)

2. src/components/store/ProductGallery.tsx ["use client"]
   - Main large image + thumbnail strip
   - Click thumbnail → update main image (useState)
   - All images use next/image

3. src/components/store/VariantSelector.tsx ["use client"]
   - Toggle buttons for variants (e.g., 50ml / 100ml)
   - Selected variant highlighted with gold border
   - Updates selected variant in parent via callback

4. src/components/store/ScentProfile.tsx ["use client"]
   - Only renders if product.scentNotes exists
   - Visual fragrance pyramid (top/heart/base rings)
   - useGSAP(): call animateScentNotes() from src/lib/gsap/animations/scentProfile.ts

5. src/components/store/AddToCart.tsx ["use client"]  
   - Quantity stepper (1-10)
   - "Add to Collection" primary gold button
   - useGSAP(): brief scale pulse (0.97 → 1) on button click via gsap.to
   - For now: just a toast ("Added to cart") — cart logic comes in step 1.5

6. Expandable accordions using shadcn for: Description | Details | Shipping & Returns

Ensure no hydration warnings. Run `pnpm dev` and test the /product/[slug] route.
```

---

## PROMPT 1.5 — Cart (Zustand + Redis)

```
Read STORE_FEATURES.md "Cart" section.
Read TECH_STACK.md "Upstash Redis" use cases (cart storage).
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP".

Create:

1. src/lib/stores/cart.store.ts
   Zustand store (no "use client" on the file — export the hook).
   Implement CartStore from STORE_FEATURES.md:
   - items, addItem, removeItem, updateQuantity, clearCart, total, itemCount
   - Persist to localStorage via zustand/middleware persist
   - CartItem type: { id, productId, variantId?, name, image, price, quantity, slug, variantName? }

2. src/lib/redis/client.ts
   - Redis.fromEnv() Upstash client
   - getCart(sessionId): returns CartItem[] | null
   - setCart(sessionId, items): setex 7 days

3. src/server/api/routers/cart.ts — add to appRouter
   - sync mutation (protectedProcedure): saves cart to DB cart table for logged-in users
   - get query (publicProcedure): retrieves persisted cart by sessionId from Redis

4. src/components/store/CartDrawer.tsx ["use client"]
   Uses shadcn <Sheet> as the structural wrapper (open/close state)
   GSAP inside the Sheet content (not the Sheet itself):
   - On open: useGSAP({ dependencies:[open] }) → revealStagger() on line items
   - Each line item: image, name, variant tag, qty stepper, price, remove (X) button
   - Remove item: gsap.to(item, { x:40, opacity:0, height:0, duration:0.35 }) before removing from state
   - Subtotal row with formatPrice() — gold color
   - Free shipping progress bar: gsap.to(bar, { width: pct, duration:0.6, ease: EASE.enter })
   - "Proceed to Checkout" primary gold button
   - Empty cart state: centered dark message with a bag icon + "Your cart is empty"

5. Wire up AddToCart.tsx to useCartStore().addItem()
6. Wire up Navigation.tsx cart icon badge to useCartStore().itemCount
7. Wire up cart icon click to open CartDrawer

Session ID: stored in a cookie via js-cookie or document.cookie directly.
Sync cart to Redis on every addItem/removeItem/updateQuantity call.
```

---

## PROMPT 1.6 — Checkout (PayFast)

```
Read TECH_STACK.md "Payments (PayFast)" section COMPLETELY before writing any code.
Read STORE_FEATURES.md "Checkout Flow" section.

IMPORTANT: Payment gateway is PayFast, NOT Stripe. Redirect-based flow, NOT embedded.

Create:

1. src/lib/payfast/client.ts
   - generatePayFastForm() function — EXACTLY as in TECH_STACK.md
   - verifyITN() function — EXACTLY as in TECH_STACK.md
   - Use crypto (Node built-in) for MD5 signature

2. src/app/api/payfast/itn/route.ts — ITN handler
   - Parse form body
   - Call verifyITN()
   - If COMPLETE: update order status to "confirmed", paymentStatus to "paid"
   - Return "OK" 200 to PayFast (required — PayFast checks for this)

3. src/app/api/checkout/create-order/route.ts
   - POST handler: receives cart items + customer info
   - Creates order in DB with status "pending"
   - Calls generatePayFastForm() with order data
   - Returns { actionUrl, fields } to client

4. src/app/(store)/checkout/page.tsx ["use client"]
   - Step 1: Contact & shipping form (react-hook-form + zod)
   - Step 2: Order summary + "Pay with PayFast" button
   - On submit: POST to /api/checkout/create-order → receive actionUrl + fields
   - Call redirectToPayFast(actionUrl, fields) — creates a hidden form and submits it
   - Show loading state while redirecting

5. src/app/(store)/checkout/success/page.tsx
   - Reads ?order= from URL params
   - Fetches order details
   - Shows confirmation: order number, items, estimated delivery
   - "Continue Shopping" button

6. src/app/(store)/checkout/cancel/page.tsx
   - "Payment was cancelled" message
   - "Return to Cart" button
```

---

---

# PHASE 2: ADMIN PANEL

---

## PROMPT 2.1 — Admin Layout & Sidebar

```
Read ADMIN_PANEL.md "Navigation Structure" and "Admin UI Design Rules".
Read DESIGN_SYSTEM.md for color reference.

Create:

1. src/app/(admin)/layout.tsx
   - Server Component — check session, redirect to /admin/login if not admin
   - Renders AdminSidebar + AdminHeader + children
   - Background: #0D0D0D (slightly darker than store)

2. src/components/admin/AdminSidebar.tsx ["use client"]
   - Width: 240px, collapsible to 64px icon-only mode
   - Background: #111111
   - Logo: "FRAVIONT" Cinzel at top, "ADMIN" label in ash below
   - Nav items with lucide-react icons (from ADMIN_PANEL.md):
     Dashboard, Orders, Products, Inventory, Analytics, Customers, Settings
   - Active item: 2px left gold border + gold text color + slightly lighter bg
   - Collapsed state: show only icons, tooltip on hover
   - Use next/link for all nav items, usePathname to detect active

3. src/components/admin/AdminHeader.tsx
   - Height: 64px, bg: #111111, border-bottom: 1px solid #1E1E1E
   - Left: Page title (dynamic)
   - Right: user avatar (initials if no image) + dropdown (Profile, Sign Out)

4. src/app/(admin)/login/page.tsx
   - Simple centered dark form
   - "Sign in with Google" button
   - "Sign in with Email" magic link option
   - FRAVIONT branding
```

---

## PROMPT 2.2 — Admin Dashboard

```
Read ADMIN_PANEL.md "Dashboard" section completely.

Create:

1. src/server/api/routers/analytics.ts
   Update with getDashboardStats adminProcedure:
   - todayRevenue: sum of order totals where createdAt = today AND paymentStatus = "paid"
   - yesterdayRevenue: same for yesterday
   - todayOrders: count of today's orders
   - weekOrders: count this week
   - avgOrderValue: average total this month
   - recentOrders: last 10 orders joined with customer name/email
   - lowStockVariants: variants where stock <= lowStockThreshold, joined with product name

2. src/app/(admin)/dashboard/page.tsx — Server Component
   4 KPI cards + 2-column layout (chart + AI digest | recent orders + alerts)

3. src/components/admin/KPICard.tsx ["use client"]
   Shows: label, value (data-value attribute), % change badge, trend icon
   useGSAP(): on mount call animateKPICards() from src/lib/gsap/animations/admin.ts
   Background: #171717, border: 1px solid #1E1E1E
   Render with <KPICardSkeleton /> while data is loading

4. src/components/admin/RevenueChart.tsx ["use client"]
   Line chart using recharts (wrapped in shadcn <ChartContainer>)
   useGSAP(): call animateChartReveal() on mount — chart draws in from left
   Gold line color, dark background

5. src/components/admin/AIDigestCard.tsx ["use client"]  
   Fetches from ai.getDailyDigest — show <ChatMessageSkeleton /> x3 while loading
   Gold left border, Cormorant text, date header

6. src/components/admin/RecentOrdersTable.tsx
   shadcn Table — order#, customer, date, total, status badge

7. src/components/admin/LowStockAlerts.tsx
   List of variants with orange/red stock badges

All KPI values show skeleton while loading. Cache dashboard stats in Redis (TTL: 300s).
```

---

## PROMPT 2.3 — Products CRUD (Admin)

```
Read ADMIN_PANEL.md "Product Management" section completely.
Read TECH_STACK.md schema (products + productVariants tables) for field reference.

Update src/server/api/routers/products.ts — add admin procedures:
- create: adminProcedure, full product input with zod schema matching DB schema
- update: adminProcedure, { id, ...partial product fields }
- delete: adminProcedure, { id } — soft delete (set isActive: false)
- getById: adminProcedure, { id } — returns product with variants

Create:

1. src/app/(admin)/products/page.tsx — products table
   shadcn Table with: image thumbnail, name, category, price, stock total, status toggle, actions
   Search by name, filter by category, filter by active/inactive

2. src/app/(admin)/products/new/page.tsx
3. src/app/(admin)/products/[id]/page.tsx
   Both render <ProductForm /> with appropriate props

4. src/components/admin/ProductForm.tsx ["use client"]
   react-hook-form + full zod schema validation
   ALL fields from ADMIN_PANEL.md "Product Form Fields"
   Category-specific fields: show/hide based on selected category (useWatch)
   Variant management: add/remove/edit variants array field
   Image upload: file input, preview, stores as array of URLs
   "✨ Generate with AI" button: calls ai.generateDescription mutation, 
     populates description fields when response arrives
   Toast on save success/error

Tip: Use a <Tabs> component to organize: Basic Info | Media | Description | Variants | SEO
```

---

## PROMPT 2.4 — Orders Management (Admin)

```
Read ADMIN_PANEL.md "Orders Management" section.

Update src/server/api/routers/orders.ts:
- getAll: adminProcedure, input { status?, dateFrom?, dateTo?, search?, page?, limit? }
  Join with customers and order items. Return paginated results.
- getById: adminProcedure, returns full order with items, customer, status history
- updateStatus: adminProcedure, { id, status, trackingNumber? }
  If status = "shipped" and trackingNumber provided: trigger shipping email (TODO placeholder)
- addNote: adminProcedure, { id, note }

Create:

1. src/app/(admin)/orders/page.tsx
   Full orders table per ADMIN_PANEL.md "Table Columns" spec
   Filters: status multi-select, date range picker, payment status
   Search bar: by order number or email
   Status badges with correct colors from ADMIN_PANEL.md

2. src/app/(admin)/orders/[id]/page.tsx
   Order detail per ADMIN_PANEL.md "Order Detail Page" spec:
   - Status timeline (visual steps: Pending → Confirmed → Processing → Shipped → Delivered)
   - Line items table with product thumbnails
   - Customer info sidebar (name, email, order history count, LTV)
   - Status update: shadcn Select dropdown + Save button
   - Tracking number: text input + Save
   - PayFast refund: "Process Refund" button (disabled for now, shows TODO toast)
   - Notes: textarea + Save
```

---

## PROMPT 2.5 — Inventory Management

```
Read ADMIN_PANEL.md "Inventory Management" section.

Update src/server/api/routers/inventory.ts:
- getAll: adminProcedure — all variants with product info, current stock, threshold
- adjust: adminProcedure, { variantId, type, quantityChange, note }
  Updates productVariants.stock, inserts row into inventory_logs
- getLogs: adminProcedure, { variantId? } — returns log history

Create:

1. src/app/(admin)/inventory/page.tsx
   Two view modes (toggle): Table view and Cards view
   Filters: "Low Stock" (< threshold), "Out of Stock" (= 0), category
   Sort by: stock level, product name, last updated

2. src/components/admin/StockAdjustmentModal.tsx ["use client"]
   shadcn Dialog — variant name, current stock display, 
   type select (Restock/Sale/Adjustment/Return), quantity input, note input
   Shows new total preview: "New Total: X units"
   On save: calls inventory.adjust mutation + toast

3. src/components/admin/InventoryTable.tsx
   shadcn Table with: product image, name, variant, SKU, current stock (colored badge),
   threshold, last updated, "Adjust" button

Stock badge colors:
- > threshold: green
- <= threshold and > 0: orange  
- = 0: red
```

---

## PROMPT 2.6 — Analytics Dashboard

```
Read ADMIN_PANEL.md "Analytics & Finance" section completely.

Update src/server/api/routers/analytics.ts with:
- getRevenue: adminProcedure, { period: "7d" | "30d" | "90d" | "12m" }
  Returns array of { date, revenue } data points
- getOrderStats: adminProcedure — cancellation rate, return rate, avg fulfillment time
- getTopProducts: adminProcedure, { limit: 10 } — by units and by revenue
- getCustomerStats: adminProcedure — new vs returning, LTV, acquisition over time
- getPnL: adminProcedure — revenue, platform fees (2.9% estimate), refunds, net

Create src/app/(admin)/analytics/page.tsx with 5 tabs (shadcn Tabs):

Tab 1 Revenue: period selector toggle + line/area chart (recharts)
Tab 2 Orders: volume chart + fulfillment time bar chart + stats cards
Tab 3 Products: top products table (units + revenue columns) + category donut chart
Tab 4 Customers: new vs returning line chart + stats cards
Tab 5 Finance: P&L table per ADMIN_PANEL.md "Finance (P&L)" spec

All charts: gold primary color, dark bg, recharts via shadcn ChartContainer.
All data has Redis cache (TTL: 300s).
```

---

---

# PHASE 3: AI FEATURES

---

## PROMPT 3.1 — OpenRouter Client + AI Router Base

```
Read AI_FEATURES.md completely before any code.
Read TECH_STACK.md "OpenRouter API" section.

Create:

1. src/lib/ai/client.ts
   - callAI() function EXACTLY as in TECH_STACK.md
   - Accepts: model, messages, system, temperature, max_tokens
   - Throws descriptive error on non-OK response
   - Include HTTP-Referer and X-Title headers

2. src/lib/ai/prompts.ts
   - SOPHIA_SYSTEM_PROMPT (from AI_FEATURES.md section 1)
   - buildDescriptionPrompt() (from AI_FEATURES.md section 2)
   - buildProfilePrompt() (from AI_FEATURES.md section 3)
   - buildDailyDigestPrompt() (from AI_FEATURES.md section 5)
   - buildForecastPrompt() (from AI_FEATURES.md section 6)

3. Update src/server/api/routers/ai.ts with:
   - chat: publicProcedure with rate limiting (10 msg/min per sessionId via Upstash)
   - generateDescription: adminProcedure (calls claude-3-5-sonnet)
   - generateProfile: publicProcedure (for quiz results)
   - getDailyDigest: adminProcedure (check Redis cache first, TTL: 23 hours)

All prompts must use EXACTLY the text from AI_FEATURES.md — do not rewrite them.
```

---

## PROMPT 3.2 — Concierge Chatbot (Sophia)

```
Read AI_FEATURES.md section "1. Luxury Concierge Chatbot" completely.
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP".

Create:

1. src/components/store/ChatWidget.tsx ["use client"]

Floating trigger button:
- Fixed bottom-right (right: 24px, bottom: 24px)
- Circular, 56px, bg: gold-warm, text: obsidian
- Letter "S" in Cormorant italic
- useGSAP(): on mount, gsap.fromTo(btn, { scale:0, opacity:0 }, { scale:1, opacity:1, duration:0.6, ease: EASE.elastic, delay:1.5 })
- Apply magneticButton() from productCard.ts to the floating button

Chat panel — GSAP, NOT framer-motion:
- Panel is a fixed div with visibility controlled by isOpen state
- useGSAP({ dependencies: [isOpen] }):
  OPEN:  gsap.fromTo(panel, { x: 420, opacity:0 }, { x:0, opacity:1, duration:0.55, ease: EASE.luxury })
  CLOSE: gsap.to(panel, { x: 420, opacity:0, duration:0.4, ease: EASE.exit, onComplete: () => setVisible(false) })
- Width: 380px, full-height, dark bg #171717, border-left: 1px solid iron
- Header: "Sophia" italic Cormorant + "Personal Concierge" Jost label + close X
- Messages area: scrollable
  User messages: right-aligned, bg: rgba(201,168,76,0.12), gold border-left
  AI messages: left-aligned, bg: #1E1E1E
  useGSAP per message: each new message slides up (y:16 → 0, opacity:0 → 1)
- Typing indicator: 3 gold dots, CSS animation (3 spans with animation-delay 0/0.2/0.4s)
- Input: textarea (Enter sends, Shift+Enter newlines) + gold Send button
- Quick suggestions on empty chat: 3 pill-style suggestion chips

Session ID: useState initialized with crypto.randomUUID().
Wire up to ai.chat tRPC mutation.
Add <ChatWidget /> to src/app/(store)/layout.tsx.
autoScroll messages container to bottom on new message (plain JS scrollTop).
```

---

## PROMPT 3.3 — AI Description Generator (Admin)

```
Read AI_FEATURES.md section "2. AI Product Description Generator".

Update src/server/api/routers/ai.ts — generateDescription procedure:
- adminProcedure, input { productId: string }
- Fetch product from DB (name, category, scentNotes, ingredients, tags)
- Check Redis cache (key: "ai:desc:{productId}", TTL: 3600)
- If cache miss: call buildDescriptionPrompt() → callAI() with claude-3-5-sonnet
- Parse JSON response: { short, long }
- Cache the result
- Return { short, long }

Update the ProductForm "✨ Generate with AI" button:
- Calls generateDescription mutation with current productId
- On success: populate shortDescription and description fields via react-hook-form setValue
- Show loading spinner on button while pending: "Crafting your copy..."
- Show success toast: "Copy generated! Review and save."
- Show error toast if generation fails
```

---

## PROMPT 3.4 — Scent Profile Quiz

```
Read AI_FEATURES.md section "3. Personalization Profile Builder".
Read STORE_FEATURES.md "Scent Quiz" section.
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP".

Create src/app/(store)/quiz/page.tsx ["use client"]

Screens controlled by: useState<"intro" | "question" | "loading" | "results">

SCREEN: intro
  Full viewport dark panel. useGSAP(): charReveal() on headline, revealStagger() on body + button.
  "Begin" button → set screen to "question"

SCREEN: question
  Gold progress bar at top — GSAP: gsap.to(bar, { width: `${(step/5)*100}%`, duration:0.5, ease: EASE.enter })
  Question text in Cormorant 3rem
  4 option cards — on select: gsap.to(card, { borderColor: "#C9A84C", backgroundColor: "rgba(201,168,76,0.08)", duration:0.25 })
  "Next" button — disabled until selection made
  Question transitions — GSAP, NOT framer-motion:
    EXIT current:  gsap.to(questionEl, { x:-60, opacity:0, duration:0.35, ease: EASE.exit })
    ENTER next:    gsap.fromTo(questionEl, { x:60, opacity:0 }, { x:0, opacity:1, duration:0.45, ease: EASE.enter })
    Sequence with gsap.timeline()

SCREEN: loading
  Full dark panel. Centered "Sophia is curating your selection..." text (Cormorant italic, large).
  3 gold dots pulsing — useGSAP():
    gsap.to(dots, { opacity:0.2, duration:0.6, stagger:0.2, yoyo:true, repeat:-1, ease:"sine.inOut" })

SCREEN: results
  useGSAP(): staggered reveal of all result elements
  - Profile statement (italic Cormorant, large) — charReveal()
  - Collection name badge — gsap.fromTo with scale 0.8 → 1
  - 3 product cards — revealStagger() with 0.12s stagger
  - Each card has AI personal note below in ash text
  - "Add to Cart" on each card, "Retake Quiz" ghost button at bottom

Wire up ai.generateProfile tRPC mutation.
On mutation success: set screen to "results" with data.
On mutation error: show toast + stay on loading screen with retry button.
```

---

---

# PHASE 4: POLISH

---

## PROMPT 4.1 — Error & Empty States + Final Skeleton Audit

```
Read DESIGN_SYSTEM.md "Skeleton Loading System" and all skeleton component code blocks.

PART A — Skeleton Audit:
Check every page and client component that fetches data. Verify:
  Server Components: wrapped in <Suspense fallback={<XSkeleton />}> using components from src/components/shared/skeletons/
  Client Components: if (isPending) return <XSkeleton /> at the TOP of render, before any JSX
  Skeleton dimensions match the loaded content exactly — measure and compare

Pages to audit:
  (store): /, /shop, /product/[slug], /cart, /checkout, /account, /account/orders, /quiz results
  (admin): /dashboard, /orders, /orders/[id], /products, /products/[id], /inventory, /analytics, /customers

PART B — Error States:
Create src/components/shared/ErrorCard.tsx:
  Dark bg (#171717), border: 1px solid iron, centered content
  "Something went wrong" in ivory Cormorant
  Subtext in ash Jost (don't show raw error messages to users)
  Optional retry button (ghost style)
  useGSAP(): gsap.fromTo on mount (y:20, opacity:0 → y:0, opacity:1)

Add error.tsx to:
  src/app/(store)/error.tsx
  src/app/(admin)/error.tsx
  Both use <ErrorCard /> and the dark luxury style

PART C — Empty States:
Create src/components/shared/EmptyState.tsx:
  Takes: icon (lucide), title, description, optional action button
  Dark, centered, generous padding
  useGSAP(): subtle fade-up on mount

Wire up empty states to:
  Product grid (no results): "No products found" + "Clear Filters" ghost button
  Orders table (admin, no orders): "No orders yet" + "View Products" link
  Customer list (no customers): "No customers yet"
  Inventory low stock (all good): "All stock levels healthy" with green-tinted card

PART D — Global pages:
src/app/not-found.tsx:
  Large "404" in Cormorant (20rem, weight 200, gold color, opacity 0.15 — decorative)
  "Page Not Found" headline over it
  "Return Home" primary button
  useGSAP(): charReveal() on headline, fade-up on button
```

---

## PROMPT 4.2 — SEO & Metadata

```
Read STORE_FEATURES.md "SEO Requirements" section.

For every page that needs it, add:

1. generateMetadata() returning proper title, description, openGraph
   - Homepage: site-level metadata
   - /shop: "Shop Luxury Perfumes, Cosmetics & Jewelry | Fraviont"
   - /product/[slug]: product-specific metadata with og:image
   - /shop/[category]: category-specific metadata

2. JSON-LD structured data (as <script type="application/ld+json"> in page.tsx):
   - Homepage: Organization schema
   - Product pages: Product schema (name, price, availability, image, description)
   - Catalog: BreadcrumbList

3. Update src/app/layout.tsx:
   - Default metadata with metadataBase pointing to NEXT_PUBLIC_SITE_URL
   - Twitter card metadata
   - Viewport and theme-color meta tags

4. Create public/robots.txt:
   Allow all, Sitemap: /sitemap.xml

5. Create src/app/sitemap.ts:
   Dynamic sitemap including all active product pages + static pages
```

---

## PROMPT 4.3 — Mobile Responsiveness Audit

```
Open the browser dev tools and test every page at these breakpoints:
- 375px (iPhone SE)
- 390px (iPhone 14)
- 768px (iPad)
- 1024px (iPad landscape)
- 1440px (Desktop)

Fix any layout issues found. Common things to check:

Store:
- Navigation: hamburger menu works, overlay is full-screen, links are tappable (44px min)
- Homepage hero: headline font scales down gracefully (use clamp() or responsive font sizes)
- Product grid: 1 or 2 columns on mobile, not 3
- Product detail: stacked layout on mobile (gallery on top, info below)
- Cart drawer: full-width on mobile
- Checkout form: single column on mobile

Admin:
- Sidebar: collapses to bottom tab bar on mobile, or hamburger overlay
- Tables: horizontal scroll on mobile, not broken layout
- Charts: full-width on mobile
- KPI cards: 2x2 grid on mobile, not 4-col

Add these Tailwind utilities wherever needed: sm:, md:, lg: breakpoints.
```

---

## PROMPT 4.4 — Customer Account Pages

```
Read STORE_FEATURES.md "Customer Account" section.

Create:

1. src/app/(store)/account/layout.tsx
   - Protected (middleware handles redirect)
   - Left sidebar: Dashboard | Orders | Profile (same dark style as store)

2. src/app/(store)/account/page.tsx
   - "Welcome back, {name}" — useGSAP(): charReveal() on name
   - 3 stat cards: Total Orders, Total Spent (gold), Member Since
   - useGSAP(): revealStagger() on cards
   - Recent 3 orders as compact cards

3. src/app/(store)/account/orders/page.tsx
   - Server Component with <Suspense fallback={<TableSkeleton rows={6} cols={5} />}>
   - Orders: order number, date, status badge, total
   - Click row → GSAP height expand to show line items

4. src/app/(store)/account/profile/page.tsx ["use client"]
   - react-hook-form: name, phone (email read-only if OAuth)
   - Address book with add/edit/delete
   - Marketing preferences toggle
   - "Delete Account" ghost red button → confirmation dialog

5. Add to tRPC:
   orders.getMyOrders: protectedProcedure
   customers.getMyProfile: protectedProcedure
   customers.updateMyProfile: protectedProcedure
```

---

## PROMPT 3.5 — Inventory Demand Forecast (AI)

```
Read AI_FEATURES.md section "6. Inventory Demand Forecasting".

1. Add getForecast to src/server/api/routers/ai.ts:
   - adminProcedure
   - Query last 90 days inventory_logs (type='sale') grouped by variantId
   - Query current stock for all variants
   - Check Redis cache key "ai:forecast" TTL 3600 first
   - Call callAI() model: "openai/gpt-4o", parse JSON array response
   - Return typed ForecastItem[]

2. src/app/(admin)/inventory/forecast/page.tsx ["use client"]
   - <TableSkeleton rows={10} cols={6} /> while loading
   - "Regenerate" button — clears cache, re-fetches
     useGSAP(): gsap.to(refreshIcon, { rotation: 360, duration: 0.7, ease: EASE.enter }) on click
   - Forecast table: Product | Variant | In Stock | 30d Forecast | Reorder Qty | Urgency
   - Urgency badges: critical=crimson pulsing, high=amber, medium=iron, low=graphite
   - useGSAP(): revealStagger() on rows with 0.04s stagger
   - "Export Reorder CSV" button → triggers file download

3. Add forecast link to /admin/inventory sidebar and LowStockAlerts card
```

---

## PROMPT 3.6 — Email Templates (Resend + React Email)

```
Create email templates in src/emails/ using @react-email/components.
All emails: dark bg #0A0A0A, centered 600px container, FRAVIONT Cinzel header, gold dividers.

1. src/emails/OrderConfirmation.tsx
   Props: { orderNumber, customerName, items, total, shippingAddress, estimatedDelivery }
   - "Your order has been received" headline
   - Line items table with image, name, qty, price
   - Order total in gold
   - "View Your Order" CTA → /account/orders

2. src/emails/ShippingNotification.tsx
   Props: { orderNumber, customerName, trackingNumber, carrier, estimatedDelivery }
   - "Your order is on its way" headline
   - Tracking number prominent display
   - "Track Package" CTA

3. src/emails/AbandonedCart.tsx
   Props: { customerName, items, recoveryUrl, totalValue }
   - Uses buildAbandonedCartEmail() from AI_FEATURES.md section 7 for subject + body
   - Cart items preview (max 3)
   - "Complete Your Order" gold CTA

4. src/emails/MagicLink.tsx
   Props: { url, host }
   - Minimal brand-consistent sign-in email

5. src/lib/email/send.ts — email sending utilities:
   sendOrderConfirmation(order): call from PayFast ITN handler on COMPLETE
   sendShippingNotification(order): call from orders.updateStatus when status="shipped"
   sendAbandonedCartEmail(customer, cart): call from cron job

6. Wire sendOrderConfirmation into src/app/api/payfast/itn/route.ts after order update
```

---

## PROMPT 4.5 — Performance & GSAP Cleanup

```
Read DESIGN_SYSTEM.md "Motion / Animation — GSAP" for ScrollTrigger refresh guidance.

1. GSAP/ScrollTrigger audit — open browser console on each page and fix:
   - "trigger element not found" warnings → fix refs/selectors
   - "Cannot tween a null target" errors → add null guard: if (!ref.current) return
   - Confirm every useGSAP has { scope: containerRef } set

2. Add ScrollTrigger.refresh() calls:
   In src/app/(store)/layout.tsx:
     document.fonts.ready.then(() => ScrollTrigger.refresh())
   On product page after images load:
     <Image onLoad={() => ScrollTrigger.refresh()} ... />

3. Next.js performance:
   Wrap in dynamic(() => import(), { ssr:false }):
     ChatWidget.tsx
     ProductGallery.tsx
   Verify all <Image> have sizes prop set
   Add priority prop to hero image and first product image

4. Run `pnpm build` — fix ALL TypeScript errors and warnings before this step is done
   Run `pnpm tsc --noEmit` separately to see all type errors at once
```

---

## PROMPT 4.6 — Deployment & Cron Jobs

```
Read DEPLOYMENT.md for full deployment checklist.

1. Create vercel.json in project root:
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    { "path": "/api/cron/daily-digest", "schedule": "0 6 * * *" },
    { "path": "/api/cron/abandoned-cart", "schedule": "0 */2 * * *" }
  ]
}

2. src/app/api/cron/daily-digest/route.ts
   GET handler: verify Authorization: Bearer {CRON_SECRET} header
   Clear Redis "ai:digest" cache, regenerate via getDailyDigest logic
   Return NextResponse.json({ success: true })

3. src/app/api/cron/abandoned-cart/route.ts
   GET handler: verify CRON_SECRET
   Scan Redis for cart keys older than 2 hours with items
   For each: check no completed order in last 8 hours
   Call sendAbandonedCartEmail()
   Return NextResponse.json({ processed: count })

4. Add to .env.example:
   CRON_SECRET=your-random-secret-here

5. Final pre-deploy checklist:
   pnpm build → must pass with zero errors
   pnpm tsc --noEmit → zero errors
   Check all .env.local values are set in Vercel dashboard
   Run pnpm db:push on production Neon DB
   Test PayFast sandbox flow end-to-end
   Test /admin login and role guard
```

