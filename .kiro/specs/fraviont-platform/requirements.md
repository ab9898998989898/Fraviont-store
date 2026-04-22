# Requirements Document

## Introduction

Fraviont is a full-stack luxury e-commerce platform for selling perfumes, cosmetics, and jewelry. The platform consists of a customer-facing storefront with a dark, editorial aesthetic and a complete admin panel for managing products, orders, inventory, analytics, and customers. The system integrates AI-powered features including a personal shopping concierge (Sophia), product description generation, a scent profile quiz, and semantic search. Payments are processed via PayFast (South African gateway) using a redirect-based flow. All animations are implemented exclusively with GSAP. The platform is built on Next.js 15 App Router, tRPC v11, Drizzle ORM with Neon Postgres, Upstash Redis, and NextAuth v5.

## Glossary

- **Platform**: The complete Fraviont e-commerce system (storefront + admin panel)
- **Store**: The customer-facing storefront at the root route group `(store)`
- **Admin_Panel**: The admin dashboard at the route group `(admin)`, accessible only to users with role `ADMIN`
- **Product**: A sellable item in one of the categories: perfumes, cosmetics, jewelry, or gift_sets
- **Variant**: A specific size, colour, or configuration of a Product (e.g., 50ml, Rose Gold)
- **Order**: A confirmed purchase containing one or more OrderItems
- **OrderItem**: A single line in an Order referencing a Product and optional Variant
- **Customer**: A registered user who has placed at least one order
- **Cart**: A temporary collection of items a shopper intends to purchase
- **ITN**: Instant Transaction Notification  the PayFast webhook that confirms payment
- **Concierge**: The AI shopping assistant named Sophia
- **Skeleton**: A dark-shimmer placeholder UI that matches the exact dimensions of the content it replaces
- **GSAP**: GreenSock Animation Platform  the only permitted animation library
- **Redis**: Upstash serverless Redis used for caching, rate limiting, and cart storage
- **DB**: Neon serverless Postgres accessed via Drizzle ORM
- **tRPC**: Type-safe API layer connecting Next.js server and client
- **adminProcedure**: A tRPC procedure that throws UNAUTHORIZED if the caller does not have role `ADMIN`
- **protectedProcedure**: A tRPC procedure that throws UNAUTHORIZED if the caller has no session
- **publicProcedure**: A tRPC procedure accessible without authentication
- **formatPrice**: A utility function that converts integer cents to a formatted currency string
- **Cents**: Integer representation of prices (e.g., R285.00 stored as 28500)
- **Slug**: A URL-safe unique identifier for a Product (e.g., `fraviont-oud-noir`)
- **SKU**: Stock Keeping Unit  a unique identifier for a Variant
- **LTV**: Lifetime Value  total amount a Customer has spent
- **OpenRouter**: The AI API gateway used to access Claude, GPT-4o, and other models
- **PayFast**: The South African payment gateway used for all transactions
- **Resend**: The transactional email service
- **Vercel_Blob**: Cloud storage for product images
- **Drizzle**: The ORM used for all database queries
- **useGSAP**: The React hook from `@gsap/react` used to scope and clean up GSAP animations
- **ScrollTrigger**: GSAP plugin for scroll-based animation triggers
- **Sophia**: The name of the AI concierge chatbot
- **ScentNotes**: A JSON object with `top`, `middle`, and `base` arrays of fragrance note strings
- **AIProfile**: A JSON object storing AI-generated customer preference data
- **DailyDigest**: An AI-generated summary of store performance delivered to the admin dashboard

## Requirements

### Requirement 1: Project Foundation & Infrastructure

**User Story:** As a developer, I want a fully configured Next.js 15 project with all dependencies, database schema, tRPC, and authentication set up, so that I have a solid foundation to build all platform features on.

#### Acceptance Criteria

1. THE Platform SHALL be scaffolded as a Next.js 15 App Router project with TypeScript strict mode, Tailwind CSS v4, ESLint, and the `src/` directory structure.
2. THE Platform SHALL install all dependencies listed in TECH_STACK.md including drizzle-orm, @neondatabase/serverless, @trpc/server, @trpc/client, @trpc/react-query, @tanstack/react-query, next-auth, @auth/drizzle-adapter, @upstash/redis, @upstash/ratelimit, resend, zod, clsx, tailwind-merge, lucide-react, zustand, date-fns, recharts, react-hot-toast, superjson, gsap, and @gsap/react.
3. THE Platform SHALL define a Drizzle ORM schema in `src/server/db/schema.ts` containing tables: `products`, `productVariants`, `orders`, `orderItems`, `customers`, `inventory_logs`, and all NextAuth required tables (`users`, `accounts`, `sessions`, `verificationTokens`).
4. THE Platform SHALL store all monetary values as INTEGER CENTS in the database and never as decimal or float types.
5. THE Platform SHALL use UUID primary keys with `defaultRandom()` on all main tables.
6. THE Platform SHALL include `createdAt` and `updatedAt` timestamp columns on all main tables.
7. THE Platform SHALL define enums: `productCategoryEnum` (perfumes, cosmetics, jewelry, gift_sets), `orderStatusEnum` (pending, confirmed, processing, shipped, delivered, cancelled, refunded), `paymentStatusEnum` (pending, paid, failed, refunded), and `inventoryLogTypeEnum` (restock, sale, adjustment, return).
8. THE Platform SHALL expose database scripts in `package.json`: `db:generate`, `db:push`, `db:studio`, and `db:seed`.
9. THE Platform SHALL configure a tRPC v11 router in `src/server/api/root.ts` combining sub-routers for products, orders, inventory, analytics, customers, and ai.
10. THE Platform SHALL implement three tRPC procedure types: `publicProcedure` (no auth), `protectedProcedure` (requires session), and `adminProcedure` (requires session with role `ADMIN`).
11. THE Platform SHALL expose the tRPC handler at `src/app/api/trpc/[trpc]/route.ts` supporting both GET and POST methods.
12. THE Platform SHALL configure NextAuth v5 with DrizzleAdapter, Google OAuth provider, and Resend magic-link email provider sending from `noreply@fraviont.com`.
13. THE Platform SHALL augment the NextAuth Session type to include `user.id` (string) and `user.role` (string).
14. THE Platform SHALL implement middleware in `src/middleware.ts` that redirects unauthenticated requests to `/admin/*` to `/admin/login` and requests from non-ADMIN users to `/`.
15. THE Platform SHALL provide a `src/lib/utils.ts` exporting `cn()`, `formatPrice()`, `formatDate()`, and `generateOrderNumber()`.
16. THE Platform SHALL create a `.env.example` file containing all required environment variable keys: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OPENROUTER_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_SANDBOX, NEXT_PUBLIC_SITE_URL, RESEND_API_KEY, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, BLOB_READ_WRITE_TOKEN, and CRON_SECRET.
17. IF a TypeScript compilation error exists, THEN THE Platform SHALL surface it via `pnpm tsc --noEmit` with zero errors before any phase is considered complete.

### Requirement 2: GSAP Animation System

**User Story:** As a developer, I want a centralised GSAP animation system with reusable animation functions, so that all choreographed motion across the platform is consistent, performant, and maintainable.

#### Acceptance Criteria

1. THE Platform SHALL register GSAP plugins (ScrollTrigger, TextPlugin) inside a `typeof window !== "undefined"` guard in `src/lib/gsap/config.ts` and export `{ gsap, ScrollTrigger }`.
2. THE Platform SHALL set GSAP global defaults: `ease: "power3.out"`, `duration: 0.9` and ScrollTrigger defaults: `toggleActions: "play none none reverse"`, `start: "top 88%"`.
3. THE Platform SHALL export an `EASE` constant object from `src/lib/gsap/easings.ts` with keys: luxury, enter, exit, elastic, text, gold, hover.
4. THE Platform SHALL implement `animateHero(refs)` in `src/lib/gsap/animations/hero.ts` that returns a GSAP timeline animating headline (clip-path reveal), subheadline (letter-spacing expand), divider line (scaleX draw), CTA buttons (stagger fade-up), and scroll indicator.
5. THE Platform SHALL implement `revealSection()`, `revealStagger()`, and `horizontalScroll()` in `src/lib/gsap/animations/scrollReveal.ts` using ScrollTrigger.
6. THE Platform SHALL implement `setupCardHover()` and `magneticButton()` in `src/lib/gsap/animations/productCard.ts`.
7. THE Platform SHALL implement `openMobileMenu()` and `setupNavScroll()` in `src/lib/gsap/animations/navigation.ts`.
8. THE Platform SHALL implement `charReveal()`, `countUp()`, and `goldShimmer()` in `src/lib/gsap/animations/textEffects.ts`.
9. THE Platform SHALL implement `animateScentNotes()` in `src/lib/gsap/animations/scentProfile.ts`.
10. THE Platform SHALL implement `animateKPICards()` and `animateChartReveal()` in `src/lib/gsap/animations/admin.ts`.
11. THE Platform SHALL include a `#page-curtain` div in `src/app/layout.tsx` with fixed positioning, z-index 9999, gold background (#C9A84C), and initial `scaleY(0)` transform for page transition animations.
12. WHEN a component requires animation, THE Platform SHALL call animation functions exclusively inside `useGSAP(() => { ... }, { scope: containerRef })` from `@gsap/react` and never inside raw `useEffect`.
13. THE Platform SHALL import `gsap` and `ScrollTrigger` only from `src/lib/gsap/config.ts` and never directly from the `gsap` package in component files.
14. THE Platform SHALL apply `magneticButton()` to every primary CTA button on mount.

### Requirement 3: Luxury Design System & Skeleton Loading

**User Story:** As a shopper, I want a visually refined dark luxury interface with consistent typography, colours, and smooth loading states, so that the platform feels premium and trustworthy.

#### Acceptance Criteria

1. THE Platform SHALL set the page background to `#0A0A0A` (obsidian) and primary text to `#F5F0E8` (ivory) globally in `src/app/globals.css`.
2. THE Platform SHALL import Google Fonts: Cormorant Garamond (weights 300, 400, 500, 600, italic), Jost (weights 300, 400, 500, 600), and Cinzel (weights 400, 500).
3. THE Platform SHALL define all CSS custom properties from the DESIGN_SYSTEM.md colour palette including obsidian, charcoal, graphite, iron, smoke, ivory, parchment, ash, gold-bright, gold-warm, gold-antique, gold-deep, and gold-glow.
4. THE Platform SHALL override all shadcn `:root` CSS variables to the dark luxury theme: `--background: 0 0% 4%`, `--foreground: 43 20% 93%`, `--primary: 45 73% 52%`, `--card: 0 0% 8%`, `--border: 0 0% 16%`.
5. THE Platform SHALL define a `@theme` block in `globals.css` exposing Tailwind v4 custom colour tokens and font families (display: Cormorant Garamond, sans: Jost, accent: Cinzel).
6. THE Platform SHALL define a `.skeleton` CSS class with a dark shimmer animation using `background: linear-gradient(90deg, #1a1a1a 25%, #222222 50%, #1a1a1a 75%)` and `animation: skeleton-shimmer 1.8s ease-in-out infinite`.
7. THE Platform SHALL override `src/components/ui/skeleton.tsx` to use `rounded-none` and the dark shimmer `.skeleton` class.
8. THE Platform SHALL create `ProductCardSkeleton`, `ProductGridSkeleton`, `ProductDetailSkeleton`, `KPICardSkeleton`, `TableSkeleton`, and `ChatMessageSkeleton` components in `src/components/shared/skeletons/` with dimensions that exactly match their loaded counterparts.
9. WHEN a Server Component fetches async data, THE Platform SHALL wrap the data-dependent child in `<Suspense fallback={<XSkeleton />}>`.
10. WHEN a Client Component uses `useQuery`, THE Platform SHALL render the matching Skeleton when `isPending` is true.
11. THE Platform SHALL use `rounded-none` or `rounded-sm` on all buttons and interactive elements  never pill-shaped or fully rounded.
12. THE Platform SHALL use background colour elevation (darker/lighter backgrounds) instead of CSS drop-shadows for depth.
13. THE Platform SHALL maintain a minimum of 24px padding inside cards and 64px spacing between page sections.

### Requirement 4: Store Layout, Navigation & Footer

**User Story:** As a shopper, I want a sticky navigation bar and a footer that are consistent across all store pages, so that I can easily browse categories and access key links.

#### Acceptance Criteria

1. THE Platform SHALL render a `(store)` route group layout at `src/app/(store)/layout.tsx` that includes Navigation above, Footer below, and page content in between on a `#0A0A0A` background.
2. THE Platform SHALL display the brand name "FRAVIONT" in Cinzel font with `letter-spacing: 0.2em` on the left side of the desktop navigation.
3. THE Platform SHALL display centred navigation links: PERFUMES, COSMETICS, JEWELRY, COLLECTIONS using `next/link`.
4. THE Platform SHALL display Search, Account, and Cart icons on the right side of the navigation, with the Cart icon showing an item count badge when the cart is non-empty.
5. WHEN the page is scrolled more than 80px, THE Navigation SHALL transition its background from transparent to `rgba(17,17,17,0.96)` with `backdrop-filter: blur(12px)` using `setupNavScroll()` inside `useGSAP`.
6. THE Platform SHALL render a full-screen dark overlay mobile menu triggered by a hamburger button, with navigation links staggered in using `openMobileMenu()` from `src/lib/gsap/animations/navigation.ts`.
7. THE Platform SHALL render a Footer with a dark background (`#0D0D0D`), a 3-column link grid, newsletter signup, social icons, and copyright line.
8. THE Platform SHALL apply gold (`#C9A84C`) colour to navigation links on hover and active states.

### Requirement 5: Homepage

**User Story:** As a shopper, I want an editorial homepage with a hero section, category showcase, new arrivals, and an AI quiz call-to-action, so that I can discover the brand and find products that interest me.

#### Acceptance Criteria

1. THE Platform SHALL render a full-viewport Hero section with a dark background, a Cormorant Garamond headline "The Art of Presence" at 7rem weight 300, and animate it using `animateHero()` inside `useGSAP`.
2. THE Platform SHALL apply `magneticButton()` to the primary hero CTA button on mount.
3. THE Platform SHALL render a Category Showcase section with three dark cards for Perfumes, Cosmetics, and Jewelry, applying `setupCardHover()` and `revealStagger()` via `useGSAP` with ScrollTrigger.
4. THE Platform SHALL render a New Arrivals section as a Server Component wrapped in `<Suspense fallback={<ProductGridSkeleton count={4} />}>` displaying up to 4 featured products.
5. THE Platform SHALL render an AI Quiz CTA section as a full-width dark panel with a scroll-triggered `revealSection()` animation.
6. THE Platform SHALL render a Newsletter section with an email input and subscribe button.
7. THE Platform SHALL use Server Components for data-fetching sections and `"use client"` only for sections requiring interactivity or GSAP animations.
8. THE Platform SHALL import `gsap` and `ScrollTrigger` only from `src/lib/gsap/config.ts` in all homepage components.

### Requirement 6: Product Catalog & Filtering

**User Story:** As a shopper, I want to browse products by category with filtering and sorting options, so that I can find items that match my preferences.

#### Acceptance Criteria

1. THE Platform SHALL implement `products.getAll` as a `publicProcedure` accepting optional inputs: `category`, `search`, `page` (default 1), and `limit` (default 12), returning `{ products, total, hasMore }`.
2. WHEN `products.getAll` is called, THE Platform SHALL check Redis for a cached result using a key derived from the input hash before querying the DB, with a TTL of 120 seconds.
3. THE Platform SHALL render the catalog at `src/app/(store)/shop/page.tsx` as a Server Component with `<Suspense fallback={<ProductGridSkeleton count={9} />}>` wrapping the data component.
4. THE Platform SHALL render a `ProductCard` component with a 3:4 aspect-ratio image, category label, product name, short description, price in gold colour, and an "Add to Cart" link.
5. WHEN a shopper hovers over a ProductCard, THE Platform SHALL animate the image scale and overlay reveal using `setupCardHover()` inside `useGSAP`.
6. THE Platform SHALL render a `ProductGrid` in a responsive layout: 3 columns on desktop, 2 on tablet, 1 on mobile, with `revealStagger()` applied to all cards on mount.
7. THE Platform SHALL render a `FiltersPanel` with category tabs and price range filter that updates URL search params on change using `useRouter` and `useSearchParams`.
8. THE Platform SHALL wrap each `ProductCard` in a `<Link href={/product/${product.slug}}>`.
9. WHEN `isPending` is true in a Client Component querying products, THE Platform SHALL render `<ProductGridSkeleton />`.

### Requirement 7: Product Detail Page

**User Story:** As a shopper, I want to view detailed product information including images, variants, scent notes, and descriptions, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Platform SHALL implement `products.getBySlug` as a `publicProcedure` accepting `{ slug: string }`, returning the product with its variants, cached in Redis with a TTL of 300 seconds.
2. THE Platform SHALL render the product detail page at `src/app/(store)/product/[slug]/page.tsx` as a Server Component with `generateMetadata()` for SEO and `generateStaticParams()` for static generation.
3. THE Platform SHALL render a two-column layout: gallery on the left (55% width) and product info on the right (45% width, sticky).
4. THE Platform SHALL render a `ProductGallery` component with a main large image and a thumbnail strip, where clicking a thumbnail updates the main image.
5. THE Platform SHALL render a `VariantSelector` component displaying toggle buttons for each variant, with the selected variant highlighted by a gold border.
6. WHEN a product has `scentNotes`, THE Platform SHALL render a `ScentProfile` component showing a visual fragrance pyramid with top, heart, and base note rings, animated using `animateScentNotes()` inside `useGSAP`.
7. THE Platform SHALL render an `AddToCart` component with a quantity stepper (110) and a primary gold "Add to Collection" button.
8. WHEN the "Add to Collection" button is clicked, THE Platform SHALL animate a brief scale pulse (0.97 to 1.0) on the button using `gsap.to` inside `useGSAP`.
9. THE Platform SHALL render expandable accordion sections for Description, Details, and Shipping & Returns using shadcn components.
10. THE Platform SHALL render a `<ProductDetailSkeleton />` while product data is loading.

### Requirement 8: Shopping Cart

**User Story:** As a shopper, I want to add products to a cart, adjust quantities, and see a running total, so that I can manage my intended purchases before checkout.

#### Acceptance Criteria

1. THE Platform SHALL implement a Zustand cart store in `src/lib/stores/cart.store.ts` with state: `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `total`, and `itemCount`, persisted to localStorage via the Zustand persist middleware.
2. THE Platform SHALL define `CartItem` as: `{ id, productId, variantId?, name, image, price, quantity, slug, variantName? }`.
3. THE Platform SHALL implement Redis cart utilities in `src/lib/redis/client.ts`: `getCart(sessionId)` returning `CartItem[] | null` and `setCart(sessionId, items)` with a 7-day TTL.
4. WHEN a shopper adds, removes, or updates a cart item, THE Platform SHALL sync the cart to Redis using the session ID stored in a cookie.
5. THE Platform SHALL render a `CartDrawer` component using a shadcn `<Sheet>` as the structural wrapper, with GSAP animations inside the sheet content.
6. WHEN the CartDrawer opens, THE Platform SHALL animate line items using `revealStagger()` inside `useGSAP({ dependencies: [open] })`.
7. WHEN a shopper removes an item from the cart, THE Platform SHALL animate the item out using `gsap.to(item, { x: 40, opacity: 0, height: 0, duration: 0.35 })` before removing it from state.
8. THE Platform SHALL display a free shipping progress bar in the CartDrawer, animated using `gsap.to(bar, { width: pct, duration: 0.6, ease: EASE.enter })`.
9. THE Platform SHALL display the cart subtotal using `formatPrice()` in gold colour.
10. WHEN the cart is empty, THE Platform SHALL display a centred message with a bag icon and the text "Your cart is empty".
11. THE Platform SHALL display the cart item count badge on the Navigation cart icon, sourced from `useCartStore().itemCount`.
12. THE Platform SHALL wire the Navigation cart icon click to open the CartDrawer.

### Requirement 9: Checkout & PayFast Payment

**User Story:** As a shopper, I want to complete a purchase by entering my shipping details and paying via PayFast, so that I can receive my order.

#### Acceptance Criteria

1. THE Platform SHALL implement `generatePayFastForm(params)` in `src/lib/payfast/client.ts` that builds a signed PayFast payment form using MD5 signature with the merchant passphrase, returning `{ actionUrl, fields }`.
2. THE Platform SHALL implement `verifyITN(body)` in `src/lib/payfast/client.ts` that verifies the MD5 signature and validates the ITN with the PayFast server, returning a boolean.
3. THE Platform SHALL use the sandbox URL `https://sandbox.payfast.co.za/eng/process` when `PAYFAST_SANDBOX=true` and the production URL `https://www.payfast.co.za/eng/process` otherwise.
4. THE Platform SHALL implement a POST handler at `src/app/api/payfast/itn/route.ts` that parses the form body, calls `verifyITN()`, and updates the order `status` to `confirmed` and `paymentStatus` to `paid` when `payment_status === "COMPLETE"`.
5. WHEN the ITN handler receives an invalid signature, THE Platform SHALL return HTTP 400.
6. WHEN the ITN handler successfully processes a COMPLETE payment, THE Platform SHALL return HTTP 200 with body "OK".
7. THE Platform SHALL implement a POST handler at `src/app/api/checkout/create-order/route.ts` that creates an order in the DB with status `pending` and returns `{ actionUrl, fields }` from `generatePayFastForm`.
8. THE Platform SHALL render a checkout page at `src/app/(store)/checkout/page.tsx` with a contact and shipping form (react-hook-form + zod) and an order summary.
9. WHEN the shopper submits the checkout form, THE Platform SHALL POST to `/api/checkout/create-order`, receive `{ actionUrl, fields }`, create a hidden HTML form, and submit it to redirect the shopper to PayFast.
10. THE Platform SHALL render a success page at `src/app/(store)/checkout/success/page.tsx` showing the order number, items, and estimated delivery with a "Continue Shopping" button.
11. THE Platform SHALL render a cancellation page at `src/app/(store)/checkout/cancel/page.tsx` with a "Return to Cart" button.
12. THE Platform SHALL never store raw card data anywhere in the system.

### Requirement 10: Admin Panel Layout & Authentication

**User Story:** As an admin, I want a secure, dedicated admin panel with a sidebar navigation, so that I can manage all aspects of the store from a single interface.

#### Acceptance Criteria

1. THE Platform SHALL render an `(admin)` route group layout at `src/app/(admin)/layout.tsx` as a Server Component that checks the session and redirects to `/admin/login` if the user is not authenticated or does not have role `ADMIN`.
2. THE Platform SHALL render an `AdminSidebar` component with a width of 240px, collapsible to 64px icon-only mode, on a `#111111` background.
3. THE Platform SHALL display "FRAVIONT" in Cinzel font and "ADMIN" in ash colour at the top of the sidebar.
4. THE Platform SHALL render sidebar navigation items with lucide-react icons for: Dashboard, Orders, Products, Inventory, Analytics, Customers, and Settings, using `next/link` and `usePathname` to detect the active item.
5. WHEN a sidebar item is active, THE Platform SHALL display a 2px left gold border, gold text colour, and a slightly lighter background.
6. THE Platform SHALL render an `AdminHeader` component with a height of 64px, `#111111` background, 1px solid `#1E1E1E` bottom border, dynamic page title on the left, and a user avatar dropdown (Profile, Sign Out) on the right.
7. THE Platform SHALL render an admin login page at `src/app/(admin)/login/page.tsx` with "Sign in with Google" and "Sign in with Email" (magic link) options and FRAVIONT branding.
8. THE Platform SHALL protect all `/admin/*` routes via middleware, redirecting unauthenticated users to `/admin/login` and non-ADMIN users to `/`.

### Requirement 11: Admin Dashboard & KPI Cards

**User Story:** As an admin, I want a dashboard showing today's revenue, order counts, recent orders, and low stock alerts, so that I can quickly assess the health of the store.

#### Acceptance Criteria

1. THE Platform SHALL implement `analytics.getDashboardStats` as an `adminProcedure` returning: `todayRevenue`, `yesterdayRevenue`, `todayOrders`, `weekOrders`, `avgOrderValue`, `recentOrders` (last 10), and `lowStockVariants` (stock <= threshold).
2. WHEN `analytics.getDashboardStats` is called, THE Platform SHALL check Redis for a cached result with a TTL of 300 seconds before querying the DB.
3. THE Platform SHALL render the admin dashboard at `src/app/(admin)/dashboard/page.tsx` as a Server Component with 4 KPI cards and a two-column layout containing a revenue chart and AI digest alongside recent orders and low stock alerts.
4. THE Platform SHALL render a `KPICard` component on a `#171717` background with a 1px solid `#1E1E1E` border, showing a label, value, percentage change badge, and trend icon.
5. WHEN the dashboard loads, THE Platform SHALL animate KPI cards using `animateKPICards()` inside `useGSAP`, triggering `countUp()` on each value element.
6. THE Platform SHALL render `<KPICardSkeleton />` for each KPI card while data is loading.
7. THE Platform SHALL render a `RevenueChart` component using recharts wrapped in a shadcn `<ChartContainer>` with a gold line colour and dark background, animated using `animateChartReveal()` inside `useGSAP`.
8. THE Platform SHALL render an `AIDigestCard` component that fetches from `ai.getDailyDigest` and displays `<ChatMessageSkeleton />` x3 while loading, with a gold left border and Cormorant Garamond text.
9. THE Platform SHALL render a `RecentOrdersTable` using a shadcn Table showing order number, customer, date, total, and status badge.
10. THE Platform SHALL render a `LowStockAlerts` component listing variants with orange (stock <= threshold) or red (stock = 0) badges.

### Requirement 12: Product Management (Admin CRUD)

**User Story:** As an admin, I want to create, edit, and deactivate products with all their variants and metadata, so that the store catalogue stays accurate and up to date.

#### Acceptance Criteria

1. THE Platform SHALL implement `products.create` as an `adminProcedure` accepting a full product input validated by a Zod schema matching the DB schema.
2. THE Platform SHALL implement `products.update` as an `adminProcedure` accepting `{ id, ...partial product fields }`.
3. THE Platform SHALL implement `products.delete` as an `adminProcedure` accepting `{ id }` that performs a soft delete by setting `isActive: false`.
4. THE Platform SHALL implement `products.getById` as an `adminProcedure` accepting `{ id }` and returning the product with its variants.
5. THE Platform SHALL render a products table at `src/app/(admin)/products/page.tsx` with columns: image thumbnail, name, category, price, total stock, status toggle, and action buttons, with search by name and filters by category and active/inactive status.
6. THE Platform SHALL render a `ProductForm` component using react-hook-form with full Zod schema validation, organised into tabs: Basic Info, Media, Description, Variants, and SEO.
7. THE Platform SHALL show and hide category-specific fields in `ProductForm` based on the selected category using `useWatch`.
8. THE Platform SHALL support adding, removing, and editing variants as an array field within `ProductForm`.
9. THE Platform SHALL render an image upload field in `ProductForm` with file preview and URL array storage.
10. THE Platform SHALL render a "Generate with AI" button in `ProductForm` that calls `ai.generateDescription` and populates the description fields when the response arrives.
11. WHEN a product is saved successfully, THE Platform SHALL display a success toast; WHEN saving fails, THE Platform SHALL display an error toast.
12. THE Platform SHALL render `<TableSkeleton />` while the products list is loading.

### Requirement 13: Order Management (Admin)

**User Story:** As an admin, I want to view, filter, and update orders including adding tracking numbers and notes, so that I can fulfil orders efficiently.

#### Acceptance Criteria

1. THE Platform SHALL implement `orders.getAll` as an `adminProcedure` accepting optional filters: `status`, `dateFrom`, `dateTo`, `search`, `page`, and `limit`, returning paginated results joined with customer and order item data.
2. THE Platform SHALL implement `orders.getById` as an `adminProcedure` returning the full order with items, customer, and status history.
3. THE Platform SHALL implement `orders.updateStatus` as an `adminProcedure` accepting `{ id, status, trackingNumber? }`.
4. THE Platform SHALL implement `orders.addNote` as an `adminProcedure` accepting `{ id, note }`.
5. THE Platform SHALL render an orders table at `src/app/(admin)/orders/page.tsx` with filters for status (multi-select), date range, and payment status, and a search bar for order number or email.
6. THE Platform SHALL render status badges with colours matching the order status: pending (amber), confirmed (sapphire), processing (sapphire), shipped (emerald), delivered (emerald), cancelled (crimson), refunded (crimson).
7. THE Platform SHALL render an order detail page at `src/app/(admin)/orders/[id]/page.tsx` with a visual status timeline (Pending  Confirmed  Processing  Shipped  Delivered).
8. THE Platform SHALL render a line items table on the order detail page with product thumbnails, names, quantities, unit prices, and totals.
9. THE Platform SHALL render a customer info sidebar on the order detail page showing name, email, order history count, and LTV.
10. THE Platform SHALL render a status update dropdown and a tracking number input with Save buttons on the order detail page.
11. THE Platform SHALL render a "Process Refund" button on the order detail page that is disabled and shows a TODO toast when clicked.
12. THE Platform SHALL render `<TableSkeleton />` while the orders list is loading.

### Requirement 14: Inventory Management

**User Story:** As an admin, I want to view stock levels across all variants and make manual adjustments with notes, so that inventory records stay accurate.

#### Acceptance Criteria

1. THE Platform SHALL implement `inventory.getAll` as an `adminProcedure` returning all variants with product info, current stock, and low stock threshold.
2. THE Platform SHALL implement `inventory.adjust` as an `adminProcedure` accepting `{ variantId, type, quantityChange, note }` that updates `productVariants.stock` and inserts a row into `inventory_logs`.
3. THE Platform SHALL implement `inventory.getLogs` as an `adminProcedure` accepting optional `{ variantId }` and returning the log history.
4. THE Platform SHALL render an inventory page at `src/app/(admin)/inventory/page.tsx` with two view modes (table and cards) toggled by the user.
5. THE Platform SHALL render filters for: Low Stock (stock < threshold), Out of Stock (stock = 0), and category, with sort options by stock level, product name, and last updated.
6. THE Platform SHALL render a `StockAdjustmentModal` using a shadcn Dialog with fields: variant name display, current stock display, type select (Restock/Sale/Adjustment/Return), quantity input, note input, and a "New Total: X units" preview.
7. WHEN the stock adjustment is saved, THE Platform SHALL call `inventory.adjust` and display a success toast; WHEN it fails, THE Platform SHALL display an error toast.
8. THE Platform SHALL render stock badges with colours: green (stock > threshold), orange (stock <= threshold and > 0), red (stock = 0).
9. THE Platform SHALL render `<TableSkeleton />` while inventory data is loading.

### Requirement 15: Analytics Dashboard

**User Story:** As an admin, I want to view revenue trends, order statistics, top products, customer metrics, and a P&L summary, so that I can make informed business decisions.

#### Acceptance Criteria

1. THE Platform SHALL implement `analytics.getRevenue` as an `adminProcedure` accepting `{ period: "7d" | "30d" | "90d" | "12m" }` and returning an array of `{ date, revenue }` data points.
2. THE Platform SHALL implement `analytics.getOrderStats` as an `adminProcedure` returning cancellation rate, return rate, and average fulfilment time.
3. THE Platform SHALL implement `analytics.getTopProducts` as an `adminProcedure` accepting `{ limit: 10 }` and returning products ranked by units sold and by revenue.
4. THE Platform SHALL implement `analytics.getCustomerStats` as an `adminProcedure` returning new vs returning customer counts, LTV, and acquisition over time.
5. THE Platform SHALL implement `analytics.getPnL` as an `adminProcedure` returning revenue, estimated platform fees (2.9%), refunds, and net revenue.
6. WHEN any analytics procedure is called, THE Platform SHALL check Redis for a cached result with a TTL of 300 seconds before querying the DB.
7. THE Platform SHALL render the analytics page at `src/app/(admin)/analytics/page.tsx` with 5 shadcn Tabs: Revenue, Orders, Products, Customers, and Finance.
8. THE Platform SHALL render all charts using recharts via shadcn `<ChartContainer>` with gold as the primary colour and a dark background.
9. THE Platform SHALL animate all chart wrappers using `animateChartReveal()` inside `useGSAP` with ScrollTrigger.
10. THE Platform SHALL render `<TableSkeleton />` or `<KPICardSkeleton />` while analytics data is loading.

### Requirement 16: OpenRouter AI Client & Base AI Router

**User Story:** As a developer, I want a centralised AI client and prompt library, so that all AI features use consistent models, prompts, and error handling.

#### Acceptance Criteria

1. THE Platform SHALL implement `callAI({ model, messages, system, temperature, max_tokens })` in `src/lib/ai/client.ts` that calls the OpenRouter API at `https://openrouter.ai/api/v1/chat/completions` with `Authorization`, `HTTP-Referer`, `X-Title`, and `Content-Type` headers.
2. WHEN the OpenRouter API returns a non-OK response, THE Platform SHALL throw a descriptive error.
3. THE Platform SHALL define prompt builders in `src/lib/ai/prompts.ts`: `SOPHIA_SYSTEM_PROMPT`, `buildDescriptionPrompt()`, `buildProfilePrompt()`, `buildDailyDigestPrompt()`, and `buildForecastPrompt()`.
4. THE Platform SHALL route AI tasks to specific models: product descriptions to `anthropic/claude-3-5-sonnet`, concierge chat to `anthropic/claude-3-5-haiku`, customer segmentation to `openai/gpt-4o`, and inventory forecasting to `openai/gpt-4o`.
5. THE Platform SHALL implement `ai.chat` as a `publicProcedure` with Upstash rate limiting of 10 messages per minute per session ID.
6. THE Platform SHALL implement `ai.generateDescription` as an `adminProcedure` that calls `anthropic/claude-3-5-sonnet` with `buildDescriptionPrompt()`.
7. THE Platform SHALL implement `ai.generateProfile` as a `publicProcedure` that calls `buildProfilePrompt()` with quiz answers and product data.
8. THE Platform SHALL implement `ai.getDailyDigest` as an `adminProcedure` that checks Redis for a cached digest with a TTL of 23 hours before calling the AI.

### Requirement 17: AI Concierge Chatbot (Sophia)

**User Story:** As a shopper, I want to chat with an AI personal concierge named Sophia, so that I can get personalised product recommendations and answers to my questions.

#### Acceptance Criteria

1. THE Platform SHALL render a `ChatWidget` component as a fixed floating button at bottom-right (right: 24px, bottom: 24px), 56px circular, gold background, with the letter "S" in Cormorant italic.
2. WHEN the ChatWidget mounts, THE Platform SHALL animate the button from `{ scale: 0, opacity: 0 }` to `{ scale: 1, opacity: 1 }` with a 0.6s duration, `EASE.elastic` easing, and a 1.5s delay, using `useGSAP`.
3. THE Platform SHALL apply `magneticButton()` to the floating chat button on mount.
4. THE Platform SHALL render the chat panel as a fixed div (width: 380px, full height, `#171717` background, 1px solid iron left border) with visibility controlled by an `isOpen` state.
5. WHEN the chat panel opens, THE Platform SHALL animate it using `gsap.fromTo(panel, { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: EASE.luxury })` inside `useGSAP({ dependencies: [isOpen] })`.
6. WHEN the chat panel closes, THE Platform SHALL animate it using `gsap.to(panel, { x: 420, opacity: 0, duration: 0.4, ease: EASE.exit })` before hiding it.
7. THE Platform SHALL render user messages right-aligned with `rgba(201,168,76,0.12)` background and a gold left border, and AI messages left-aligned with `#1E1E1E` background.
8. WHEN a new message arrives, THE Platform SHALL animate it sliding up from `y: 16` to `y: 0` with `opacity: 0` to `opacity: 1`.
9. THE Platform SHALL render a typing indicator with 3 gold dots using CSS animation-delay of 0s, 0.2s, and 0.4s while the AI is responding.
10. THE Platform SHALL render a textarea input where Enter sends the message and Shift+Enter inserts a newline, plus a gold Send button.
11. THE Platform SHALL render 3 quick suggestion chips when the chat is empty.
12. THE Platform SHALL generate a session ID using `crypto.randomUUID()` on component mount and wire the chat to `ai.chat` tRPC mutation.
13. THE Platform SHALL add `<ChatWidget />` to the store layout.

### Requirement 18: AI Product Description Generator

**User Story:** As an admin, I want to generate luxury product descriptions using AI, so that I can quickly create compelling copy for new products.

#### Acceptance Criteria

1. THE Platform SHALL render a "Generate with AI" button in the `ProductForm` description tab that calls `ai.generateDescription` with the product ID.
2. WHEN `ai.generateDescription` is called, THE Platform SHALL use `anthropic/claude-3-5-sonnet` with `buildDescriptionPrompt()` to generate luxury product copy.
3. WHEN the AI response arrives, THE Platform SHALL populate the description fields in `ProductForm` with the generated content.
4. WHEN the AI generation is in progress, THE Platform SHALL show a loading state on the "Generate with AI" button.
5. WHEN the AI generation fails, THE Platform SHALL display an error toast.
6. THE Platform SHALL cache AI-generated descriptions in Redis with a TTL of 1 hour to avoid redundant API calls for the same product.

### Requirement 19: AI Scent Profile Quiz

**User Story:** As a shopper, I want to take a short quiz about my scent preferences, so that I receive personalised fragrance recommendations.

#### Acceptance Criteria

1. THE Platform SHALL render a scent quiz accessible from the homepage AI Quiz CTA section.
2. THE Platform SHALL present a series of preference questions (e.g., mood, occasion, preferred scent families) and collect the shopper's answers.
3. WHEN the shopper completes the quiz, THE Platform SHALL call `ai.generateProfile` with the answers and available product data.
4. THE Platform SHALL use `buildProfilePrompt()` with `anthropic/claude-3-5-haiku` to generate a personalised scent profile and product recommendations.
5. THE Platform SHALL display the AI-generated scent profile and recommended products to the shopper after quiz completion.
6. WHEN the quiz is loading AI results, THE Platform SHALL display `<ProductGridSkeleton count={3} />` as a placeholder.

### Requirement 20: Semantic Product Search

**User Story:** As a shopper, I want to search for products using natural language descriptions, so that I can find products even when I do not know the exact product name.

#### Acceptance Criteria

1. THE Platform SHALL store product embeddings using pgvector on Neon Postgres for semantic similarity search.
2. THE Platform SHALL generate embeddings using `text-embedding-3-small` via OpenRouter for product names, descriptions, and scent notes.
3. WHEN a shopper submits a search query, THE Platform SHALL generate an embedding for the query and perform a cosine similarity search against stored product embeddings.
4. THE Platform SHALL return semantically relevant products ranked by similarity score.
5. THE Platform SHALL fall back to ILIKE text search if the semantic search returns no results.
6. THE Platform SHALL cache semantic search results in Redis with a TTL of 300 seconds per query.

### Requirement 21: Admin AI Daily Digest

**User Story:** As an admin, I want an AI-generated daily summary of store performance on my dashboard, so that I can quickly understand key trends without reading raw data.

#### Acceptance Criteria

1. THE Platform SHALL implement `ai.getDailyDigest` as an `adminProcedure` that checks Redis for a cached digest with a TTL of 23 hours before generating a new one.
2. WHEN generating a new digest, THE Platform SHALL call `buildDailyDigestPrompt()` with current dashboard stats and pass it to `openai/gpt-4o`.
3. THE Platform SHALL render the `AIDigestCard` on the admin dashboard with a gold left border, Cormorant Garamond text, and a date header.
4. WHEN the digest is loading, THE Platform SHALL render `<ChatMessageSkeleton />` three times as a placeholder.
5. THE Platform SHALL configure a Vercel cron job in `vercel.json` to call `/api/cron/daily-digest` at 06:00 UTC daily to pre-warm the Redis cache.
6. THE Platform SHALL protect the cron endpoint with a `CRON_SECRET` bearer token check.

### Requirement 22: Inventory Forecasting (AI)

**User Story:** As an admin, I want AI-generated restock recommendations based on sales velocity and current stock levels, so that I can avoid stockouts on popular products.

#### Acceptance Criteria

1. THE Platform SHALL implement an inventory forecasting procedure that calls `buildForecastPrompt()` with current stock levels and recent sales data.
2. THE Platform SHALL use `openai/gpt-4o` for inventory forecasting due to its strong numerical reasoning.
3. THE Platform SHALL display restock recommendations on the inventory page, showing suggested reorder quantities and urgency levels.
4. WHEN forecasting is in progress, THE Platform SHALL display a loading skeleton.
5. THE Platform SHALL cache forecast results in Redis with a TTL of 1 hour.

### Requirement 23: Database Seeding

**User Story:** As a developer, I want a seed script that populates the database with representative products and variants, so that I can develop and test the platform with realistic data.

#### Acceptance Criteria

1. THE Platform SHALL provide a seed script at `src/server/db/seed.ts` runnable via `pnpm db:seed`.
2. THE Platform SHALL seed at least 8 products across all four categories: perfumes, cosmetics, jewelry, and gift_sets.
3. THE Platform SHALL seed at least 20 product variants with realistic SKUs, prices in ZAR cents, stock levels, and low stock thresholds.
4. THE Platform SHALL seed at least one variant with stock below its low stock threshold to enable testing of low stock alerts.
5. THE Platform SHALL include instructions in the seed output for promoting a user to ADMIN role via SQL: `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com'`.
6. THE Platform SHALL include `scentNotes` JSON with `top`, `middle`, and `base` arrays for all perfume products.
7. FOR ALL products seeded, THE Platform SHALL ensure that `formatPrice(product.price)` produces a valid non-empty string (round-trip property: integer cents  formatted string  parseable back to a number).

### Requirement 24: Email Notifications

**User Story:** As a shopper and admin, I want to receive transactional emails for key events, so that I stay informed about orders and account activity.

#### Acceptance Criteria

1. THE Platform SHALL send an order confirmation email to the shopper when an order's `paymentStatus` is updated to `paid`.
2. THE Platform SHALL send a shipping notification email to the shopper when an order's `status` is updated to `shipped`, including the tracking number if provided.
3. THE Platform SHALL send a low stock alert email to the admin when a variant's stock falls to or below its `lowStockThreshold`.
4. THE Platform SHALL send an abandoned cart recovery email 2 hours after a shopper adds items to their cart without completing checkout, via a Vercel cron job at `/api/cron/abandoned-cart`.
5. THE Platform SHALL send a welcome email to new users on first sign-in.
6. THE Platform SHALL use Resend with `@react-email/components` for all email templates, sending from `noreply@fraviont.com`.
7. IF an email send fails, THEN THE Platform SHALL log the error without blocking the primary operation (order update, stock adjustment, etc.).

### Requirement 25: Customer Account

**User Story:** As a registered shopper, I want to view my order history and manage my account details, so that I can track my purchases and keep my information current.

#### Acceptance Criteria

1. THE Platform SHALL render a customer account section at `src/app/(store)/account/` protected by middleware that redirects unauthenticated users to `/login`.
2. THE Platform SHALL render an order history page showing all orders for the authenticated customer with order number, date, total, and status.
3. THE Platform SHALL render an order detail view accessible from the order history showing line items, shipping address, and current status.
4. THE Platform SHALL render a profile page allowing the customer to update their name and phone number.
5. WHEN account data is loading, THE Platform SHALL render appropriate skeleton components.

### Requirement 26: Deployment & Production Configuration

**User Story:** As a developer, I want the platform deployable to Vercel with zero errors, so that the store is accessible to shoppers in production.

#### Acceptance Criteria

1. THE Platform SHALL produce zero errors when running `pnpm build` before deployment.
2. THE Platform SHALL produce zero TypeScript errors when running `pnpm tsc --noEmit`.
3. THE Platform SHALL configure `vercel.json` with cron jobs: daily AI digest at 06:00 UTC (`/api/cron/daily-digest`) and abandoned cart recovery every 2 hours (`/api/cron/abandoned-cart`).
4. THE Platform SHALL configure `next.config.ts` with `experimental.ppr: true` for partial pre-rendering and `images.remotePatterns` for Vercel Blob and Cloudflare R2 hostnames.
5. THE Platform SHALL set `PAYFAST_SANDBOX=false` in Vercel production environment variables.
6. THE Platform SHALL achieve a Lighthouse Performance score of 90 or above on the homepage and 85 or above on the shop and product detail pages.
7. THE Platform SHALL achieve a Lighthouse Accessibility score of 90 or above on all pages.
8. WHEN above-fold images are present, THE Platform SHALL use the `priority` prop on `next/image` to prevent LCP degradation.
9. THE Platform SHALL ensure skeleton component heights exactly match loaded content heights to prevent Cumulative Layout Shift (CLS) above 0.1.
10. WHERE `PAYFAST_SANDBOX=true`, THE Platform SHALL use the PayFast sandbox URL; WHERE `PAYFAST_SANDBOX=false`, THE Platform SHALL use the production PayFast URL.
