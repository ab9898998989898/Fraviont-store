# Design Document — Fraviont Platform

## Overview

Fraviont is a full-stack luxury e-commerce platform for perfumes, cosmetics, and jewelry. The system is split into two primary surfaces: a customer-facing storefront with a dark editorial aesthetic, and a complete admin panel for store management. AI-powered features (concierge chatbot, description generation, scent quiz, semantic search, daily digest, inventory forecasting) are integrated via OpenRouter. Payments are handled by PayFast using a redirect-based flow with ITN webhook confirmation.

The platform is built on Next.js 15 App Router with TypeScript strict mode, using Server Components by default and `"use client"` only where interactivity or browser APIs are required. All animations are implemented exclusively with GSAP via the `useGSAP` hook. All prices are stored as integer cents (ZAR).


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Next.js 15 App Router                   │   │
│  │                                                           │   │
│  │  ┌─────────────────┐    ┌──────────────────────────────┐ │   │
│  │  │  (store) group  │    │      (admin) group           │ │   │
│  │  │  /              │    │      /admin/*                 │ │   │
│  │  │  /shop          │    │      ADMIN role required      │ │   │
│  │  │  /product/[slug]│    │      AdminSidebar + Header    │ │   │
│  │  │  /checkout      │    └──────────────────────────────┘ │   │
│  │  │  /account       │                                      │   │
│  │  └─────────────────┘    ┌──────────────────────────────┐ │   │
│  │                         │      API Routes               │ │   │
│  │                         │  /api/trpc/[trpc]             │ │   │
│  │                         │  /api/payfast/itn             │ │   │
│  │                         │  /api/checkout/create-order   │ │   │
│  │                         │  /api/cron/daily-digest       │ │   │
│  │                         │  /api/cron/abandoned-cart     │ │   │
│  │                         └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Neon Postgres│   │  Upstash Redis   │   │  OpenRouter API  │
│  (Drizzle ORM)│   │  Cache / Cart /  │   │  Claude / GPT-4o │
│               │   │  Rate Limiting   │   │  Embeddings      │
└──────────────┘   └──────────────────┘   └──────────────────┘
         │                                          │
         ▼                                          ▼
┌──────────────┐                         ┌──────────────────┐
│  PayFast     │                         │  Resend Email    │
│  Payments    │                         │  React Email     │
└──────────────┘                         └──────────────────┘
```

### Request Data Flow

```
Browser Request
  → Next.js Middleware (auth check for /admin/*, /account/*)
  → Server Component (RSC, no JS shipped)
    → tRPC Procedure (Zod-validated input)
      → Redis Cache Check (key: derived from input hash)
        → Cache HIT: return cached value
        → Cache MISS: Drizzle query → Neon Postgres → cache result → return
  → Client Component (hydration, interactivity, GSAP animations)
    → tRPC useQuery / useMutation (TanStack Query)
      → Same cache-first path as above
```

### Route Group Structure

```
src/app/
├── layout.tsx                    ← Root layout: fonts, #page-curtain, TRPCProvider
├── (store)/
│   ├── layout.tsx                ← Navigation + Footer wrapper
│   ├── page.tsx                  ← Homepage
│   ├── shop/page.tsx             ← Product catalog
│   ├── product/[slug]/page.tsx   ← Product detail
│   ├── checkout/
│   │   ├── page.tsx              ← Checkout form
│   │   ├── success/page.tsx      ← Order confirmation
│   │   └── cancel/page.tsx       ← Payment cancelled
│   └── account/
│       ├── page.tsx              ← Order history
│       ├── orders/[id]/page.tsx  ← Order detail
│       └── profile/page.tsx      ← Profile settings
├── (admin)/
│   ├── layout.tsx                ← AdminSidebar + AdminHeader
│   ├── login/page.tsx            ← Admin login
│   ├── dashboard/page.tsx        ← KPIs + charts + digest
│   ├── products/
│   │   ├── page.tsx              ← Products table
│   │   ├── new/page.tsx          ← Create product
│   │   └── [id]/page.tsx         ← Edit product
│   ├── orders/
│   │   ├── page.tsx              ← Orders table
│   │   └── [id]/page.tsx         ← Order detail
│   ├── inventory/page.tsx        ← Stock management
│   ├── analytics/page.tsx        ← Revenue + charts
│   ├── customers/
│   │   ├── page.tsx              ← Customers table
│   │   └── [id]/page.tsx         ← Customer detail
│   └── settings/page.tsx         ← Store settings
└── api/
    ├── trpc/[trpc]/route.ts      ← tRPC handler (GET + POST)
    ├── payfast/itn/route.ts      ← PayFast ITN webhook
    ├── checkout/create-order/route.ts
    ├── cron/daily-digest/route.ts
    └── cron/abandoned-cart/route.ts
```


## Components and Interfaces

### Store Component Tree

```
(store)/layout.tsx
├── Navigation (client — GSAP scroll, mobile menu, cart badge)
│   ├── NavLinks
│   ├── SearchIcon → SearchModal
│   ├── AccountIcon → /account or /login
│   └── CartIcon (badge from useCartStore) → CartDrawer
│       └── CartDrawer (Sheet wrapper, GSAP animations)
│           ├── CartItem (× n, GSAP exit animation)
│           ├── FreeShippingBar (GSAP width animation)
│           └── CartSummary (formatPrice, gold)
├── {children}
│   ├── page.tsx (Homepage)
│   │   ├── HeroSection (client — useGSAP animateHero)
│   │   ├── CategoryShowcase (client — useGSAP setupCardHover + revealStagger)
│   │   ├── Suspense → NewArrivalsSection (server — products.getAll featured)
│   │   │   └── fallback: ProductGridSkeleton count={4}
│   │   ├── AIQuizCTA (client — useGSAP revealSection)
│   │   └── NewsletterSection
│   ├── shop/page.tsx (Catalog)
│   │   ├── FiltersPanel (client — useRouter, useSearchParams)
│   │   └── Suspense → ProductGridData (server)
│   │       ├── fallback: ProductGridSkeleton count={9}
│   │       └── ProductGrid
│   │           └── ProductCard (× n, client — useGSAP setupCardHover)
│   └── product/[slug]/page.tsx (Detail)
│       ├── Suspense → ProductDetailData (server)
│       │   ├── fallback: ProductDetailSkeleton
│       │   ├── ProductGallery (client — thumbnail click)
│       │   ├── VariantSelector (client — gold border on selected)
│       │   ├── ScentProfile (client — useGSAP animateScentNotes, perfumes only)
│       │   ├── AddToCart (client — useCartStore, useGSAP scale pulse)
│       │   └── ProductAccordion (shadcn Accordion)
│       └── Suspense → RelatedProducts
└── Footer
    ├── FooterLinks (3-column grid)
    ├── NewsletterInput
    └── SocialIcons

ChatWidget (fixed, bottom-right — added to store layout)
├── FloatingButton (client — useGSAP elastic mount, magneticButton)
└── ChatPanel (client — useGSAP slide-in/out)
    ├── MessageList
    │   ├── UserMessage (right-aligned, gold bg)
    │   └── AIMessage (left-aligned, dark bg)
    ├── TypingIndicator (3 gold dots, CSS animation-delay)
    ├── QuickSuggestions (3 chips, shown when empty)
    └── MessageInput (textarea, Enter=send, Shift+Enter=newline)
```

### Admin Component Tree

```
(admin)/layout.tsx (server — session check)
├── AdminSidebar (client — usePathname, collapsible 240px/64px)
│   ├── BrandMark (Cinzel "FRAVIONT" + ash "ADMIN")
│   └── NavItems (Dashboard, Orders, Products, Inventory, Analytics, Customers, Settings)
├── AdminHeader (client — dynamic title, user avatar dropdown)
└── {children}
    ├── dashboard/page.tsx
    │   ├── Suspense → KPICards (server — analytics.getDashboardStats)
    │   │   ├── fallback: KPICardSkeleton × 4
    │   │   └── KPICard × 4 (client — useGSAP animateKPICards + countUp)
    │   ├── Suspense → RevenueChart (server)
    │   │   └── RevenueChart (client — recharts, useGSAP animateChartReveal)
    │   ├── Suspense → AIDigestCard (server — ai.getDailyDigest)
    │   │   ├── fallback: ChatMessageSkeleton × 3
    │   │   └── AIDigestCard (gold border, Cormorant text)
    │   ├── Suspense → RecentOrdersTable (server)
    │   │   └── RecentOrdersTable (shadcn Table)
    │   └── Suspense → LowStockAlerts (server)
    │       └── LowStockAlerts (coloured badges)
    ├── products/page.tsx
    │   ├── Suspense → ProductsTable (server)
    │   │   ├── fallback: TableSkeleton
    │   │   └── ProductsTable (search, category filter, status toggle)
    │   └── ProductForm (client — react-hook-form, Zod, tabs)
    │       └── AIGenerateButton → ai.generateDescription
    ├── orders/page.tsx → OrdersTable + filters
    ├── orders/[id]/page.tsx → OrderDetail + StatusTimeline + LineItems
    ├── inventory/page.tsx → InventoryTable + StockAdjustmentModal
    ├── analytics/page.tsx → Tabs (Revenue, Orders, Products, Customers, Finance)
    └── customers/page.tsx → CustomersTable + CustomerDetail
```

### Key Shared Components

```
src/components/shared/
├── skeletons/
│   ├── ProductCardSkeleton.tsx
│   ├── ProductGridSkeleton.tsx
│   ├── ProductDetailSkeleton.tsx
│   ├── KPICardSkeleton.tsx
│   ├── TableSkeleton.tsx
│   └── ChatMessageSkeleton.tsx
├── ScentProfile.tsx          ← Fragrance pyramid visualization
├── StatusBadge.tsx           ← Order status with colour mapping
└── PriceDisplay.tsx          ← formatPrice wrapper with gold styling
```


## Data Models

### Database Schema (Drizzle ORM — `src/server/db/schema.ts`)

#### Enums

```ts
export const productCategoryEnum = pgEnum("product_category", [
  "perfumes", "cosmetics", "jewelry", "gift_sets"
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", "paid", "failed", "refunded"
]);

export const inventoryLogTypeEnum = pgEnum("inventory_log_type", [
  "restock", "sale", "adjustment", "return"
]);
```

#### Core Tables

```ts
// Products
export const products = pgTable("products", {
  id:               uuid("id").primaryKey().defaultRandom(),
  slug:             text("slug").unique().notNull(),
  name:             text("name").notNull(),
  shortDescription: text("short_description"),
  description:      text("description"),
  aiDescription:    text("ai_description"),
  price:            integer("price").notNull(),           // ZAR cents
  compareAtPrice:   integer("compare_at_price"),
  category:         productCategoryEnum("category").notNull(),
  subcategory:      text("subcategory"),
  images:           jsonb("images").$type<string[]>().default([]),
  tags:             jsonb("tags").$type<string[]>().default([]),
  ingredients:      text("ingredients"),
  scentNotes:       jsonb("scent_notes").$type<ScentNotes>(),
  embedding:        vector("embedding", { dimensions: 1536 }), // pgvector
  isActive:         boolean("is_active").default(true),
  isFeatured:       boolean("is_featured").default(false),
  metaTitle:        text("meta_title"),
  metaDescription:  text("meta_description"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Product Variants
export const productVariants = pgTable("product_variants", {
  id:                uuid("id").primaryKey().defaultRandom(),
  productId:         uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sku:               text("sku").unique().notNull(),
  name:              text("name").notNull(),              // "50ml", "Rose Gold", "S"
  price:             integer("price"),                    // Override if different from product
  stock:             integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  weight:            integer("weight"),                   // grams, for shipping
  createdAt:         timestamp("created_at").defaultNow(),
  updatedAt:         timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Customers
export const customers = pgTable("customers", {
  id:          uuid("id").primaryKey().defaultRandom(),
  userId:      text("user_id").references(() => users.id),
  email:       text("email").unique().notNull(),
  name:        text("name"),
  phone:       text("phone"),
  totalOrders: integer("total_orders").default(0),
  totalSpent:  integer("total_spent").default(0),         // ZAR cents (LTV)
  aiProfile:   jsonb("ai_profile").$type<AIProfile>(),
  tags:        jsonb("tags").$type<string[]>().default([]),
  createdAt:   timestamp("created_at").defaultNow(),
  updatedAt:   timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Orders
export const orders = pgTable("orders", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  orderNumber:           text("order_number").unique().notNull(),
  customerId:            uuid("customer_id").references(() => customers.id),
  email:                 text("email").notNull(),
  status:                orderStatusEnum("status").default("pending"),
  paymentStatus:         paymentStatusEnum("payment_status").default("pending"),
  payfastPaymentId:      text("payfast_payment_id"),
  subtotal:              integer("subtotal").notNull(),    // ZAR cents
  discountTotal:         integer("discount_total").default(0),
  shippingTotal:         integer("shipping_total").default(0),
  taxTotal:              integer("tax_total").default(0),
  total:                 integer("total").notNull(),       // ZAR cents
  shippingAddress:       jsonb("shipping_address").$type<Address>(),
  trackingNumber:        text("tracking_number"),
  notes:                 text("notes"),
  createdAt:             timestamp("created_at").defaultNow(),
  updatedAt:             timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id:         uuid("id").primaryKey().defaultRandom(),
  orderId:    uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId:  uuid("product_id").references(() => products.id).notNull(),
  variantId:  uuid("variant_id").references(() => productVariants.id),
  name:       text("name").notNull(),
  sku:        text("sku").notNull(),
  quantity:   integer("quantity").notNull(),
  unitPrice:  integer("unit_price").notNull(),             // ZAR cents
  totalPrice: integer("total_price").notNull(),            // ZAR cents
  image:      text("image"),
});

// Inventory Logs
export const inventoryLogs = pgTable("inventory_logs", {
  id:             uuid("id").primaryKey().defaultRandom(),
  variantId:      uuid("variant_id").references(() => productVariants.id).notNull(),
  type:           inventoryLogTypeEnum("type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  newQuantity:    integer("new_quantity").notNull(),
  note:           text("note"),
  createdAt:      timestamp("created_at").defaultNow(),
});
```

#### NextAuth Tables (via DrizzleAdapter)

```ts
// users, accounts, sessions, verificationTokens
// users table extended with:
export const users = pgTable("users", {
  id:            text("id").primaryKey(),
  name:          text("name"),
  email:         text("email").unique(),
  emailVerified: timestamp("email_verified"),
  image:         text("image"),
  role:          text("role").default("USER"),            // "USER" | "ADMIN"
});
```

#### TypeScript Types

```ts
export type ScentNotes = {
  top:    string[];
  middle: string[];
  base:   string[];
};

export type Address = {
  firstName: string;
  lastName:  string;
  line1:     string;
  line2?:    string;
  city:      string;
  province:  string;
  postalCode: string;
  country:   string;
};

export type AIProfile = {
  scentFamily:    string;
  preferences:    string[];
  recommendations: string[];
  generatedAt:    string;
};

export type CartItem = {
  id:          string;
  productId:   string;
  variantId?:  string;
  name:        string;
  image:       string;
  price:       number;             // ZAR cents
  quantity:    number;
  slug:        string;
  variantName?: string;
};
```

#### Entity Relationships

```
products (1) ──────────── (N) productVariants
products (1) ──────────── (N) orderItems
productVariants (1) ────── (N) orderItems
productVariants (1) ────── (N) inventoryLogs
orders (1) ─────────────── (N) orderItems
customers (1) ──────────── (N) orders
users (1) ──────────────── (1) customers
```


### tRPC Router Structure (`src/server/api/`)

#### Root Router

```ts
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  products:  productsRouter,
  orders:    ordersRouter,
  inventory: inventoryRouter,
  analytics: analyticsRouter,
  customers: customersRouter,
  ai:        aiRouter,
});
export type AppRouter = typeof appRouter;
```

#### Procedure Types

```ts
// publicProcedure   — no auth required
// protectedProcedure — throws UNAUTHORIZED if no session
// adminProcedure    — throws UNAUTHORIZED if no session or role !== "ADMIN"
```

#### Products Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `products.getAll` | public | `{ category?, search?, page=1, limit=12 }` | `{ products, total, hasMore }` |
| `products.getBySlug` | public | `{ slug: string }` | `Product & { variants }` |
| `products.getById` | admin | `{ id: string }` | `Product & { variants }` |
| `products.create` | admin | `ProductCreateInput` (Zod) | `Product` |
| `products.update` | admin | `{ id } & Partial<ProductCreateInput>` | `Product` |
| `products.delete` | admin | `{ id: string }` | `{ success: true }` |

#### Orders Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `orders.getAll` | admin | `{ status?, dateFrom?, dateTo?, search?, page?, limit? }` | `{ orders, total }` |
| `orders.getById` | admin | `{ id: string }` | `Order & { items, customer }` |
| `orders.updateStatus` | admin | `{ id, status, trackingNumber? }` | `Order` |
| `orders.addNote` | admin | `{ id, note: string }` | `Order` |
| `orders.getMyOrders` | protected | `{}` | `Order[]` |

#### Inventory Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `inventory.getAll` | admin | `{}` | `(Variant & { product })[]` |
| `inventory.adjust` | admin | `{ variantId, type, quantityChange, note? }` | `{ newQuantity }` |
| `inventory.getLogs` | admin | `{ variantId? }` | `InventoryLog[]` |

#### Analytics Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `analytics.getDashboardStats` | admin | `{}` | `DashboardStats` |
| `analytics.getRevenue` | admin | `{ period: "7d"\|"30d"\|"90d"\|"12m" }` | `{ date, revenue }[]` |
| `analytics.getOrderStats` | admin | `{}` | `OrderStats` |
| `analytics.getTopProducts` | admin | `{ limit?: 10 }` | `TopProduct[]` |
| `analytics.getCustomerStats` | admin | `{}` | `CustomerStats` |
| `analytics.getPnL` | admin | `{}` | `PnLSummary` |

#### Customers Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `customers.getAll` | admin | `{ search?, page?, limit? }` | `{ customers, total }` |
| `customers.getById` | admin | `{ id: string }` | `Customer & { orders }` |

#### AI Router

| Procedure | Type | Input | Output |
|---|---|---|---|
| `ai.chat` | public (rate-limited) | `{ message, sessionId }` | `{ reply: string }` |
| `ai.generateDescription` | admin | `{ productId: string }` | `{ description, aiDescription }` |
| `ai.generateProfile` | public | `{ answers, products }` | `{ profile, recommendations }` |
| `ai.getDailyDigest` | admin | `{}` | `{ digest: string, generatedAt: string }` |
| `ai.getForecast` | admin | `{}` | `ForecastResult[]` |
| `ai.semanticSearch` | public | `{ query: string }` | `Product[]` |


## GSAP Animation System Design

### Module Structure

```
src/lib/gsap/
├── config.ts          ← Plugin registration + global defaults (SSR-safe)
├── easings.ts         ← EASE constant object
└── animations/
    ├── hero.ts        ← animateHero(refs)
    ├── scrollReveal.ts ← revealSection, revealStagger, horizontalScroll
    ├── productCard.ts  ← setupCardHover, magneticButton
    ├── navigation.ts   ← openMobileMenu, setupNavScroll
    ├── textEffects.ts  ← charReveal, countUp, goldShimmer
    ├── scentProfile.ts ← animateScentNotes
    └── admin.ts        ← animateKPICards, animateChartReveal
```

### Config (`src/lib/gsap/config.ts`)

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ScrollTrigger.defaults({
    toggleActions: "play none none reverse",
    start: "top 88%",
  });
}

export { gsap, ScrollTrigger };
```

### EASE Vocabulary (`src/lib/gsap/easings.ts`)

```ts
export const EASE = {
  luxury:  "power4.out",          // Primary — slow deceleration
  enter:   "power3.out",          // Standard enter
  exit:    "power3.in",           // Exit animations
  elastic: "elastic.out(1,0.4)",  // Subtle spring (use sparingly)
  text:    "power2.inOut",        // Headline reveals
  gold:    "expo.out",            // Price reveals, gold shimmer
  hover:   "power2.out",          // Hover transitions (short duration)
} as const;
```

### Animation Catalog Summary

| Function | File | Trigger | Description |
|---|---|---|---|
| `animateHero(refs)` | hero.ts | mount | Headline clip-path, subheadline letter-spacing, divider scaleX, CTA stagger |
| `revealSection(el)` | scrollReveal.ts | ScrollTrigger | Single element fade+translateY |
| `revealStagger(els)` | scrollReveal.ts | ScrollTrigger | Multiple elements staggered |
| `horizontalScroll(track, wrapper)` | scrollReveal.ts | ScrollTrigger pin | Horizontal pinned scroll |
| `setupCardHover(card)` | productCard.ts | mouseenter/leave | Image scale + overlay opacity |
| `magneticButton(btn)` | productCard.ts | mousemove/leave | Magnetic cursor pull |
| `openMobileMenu(overlay, links)` | navigation.ts | click | Overlay fade + links stagger |
| `setupNavScroll(nav)` | navigation.ts | ScrollTrigger | Transparent → dark background |
| `charReveal(el)` | textEffects.ts | manual | Character-by-character reveal |
| `countUp(el, value)` | textEffects.ts | manual | Animated number tick-up |
| `goldShimmer(el)` | textEffects.ts | manual | Gradient background-position loop |
| `animateScentNotes(container)` | scentProfile.ts | ScrollTrigger | Rings expand + labels fade |
| `animateKPICards(cards)` | admin.ts | mount | Cards fade+scale + countUp |
| `animateChartReveal(wrapper)` | admin.ts | ScrollTrigger | Clip-path left-to-right draw |

### React Integration Pattern

All GSAP animations in React components MUST use `useGSAP` from `@gsap/react`:

```tsx
"use client"
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap/config";  // ONLY import from here
import { animateHero } from "@/lib/gsap/animations/hero";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    animateHero({ headline: headlineRef.current! });
  }, { scope: containerRef });

  return <div ref={containerRef}><h1 ref={headlineRef}>...</h1></div>;
}
```

### Page Curtain (Global Layout)

A gold curtain overlay in `src/app/layout.tsx` enables page transition animations:

```tsx
<div
  id="page-curtain"
  style={{
    position: "fixed", inset: 0, zIndex: 9999,
    backgroundColor: "#C9A84C",
    transform: "scaleY(0)", transformOrigin: "bottom",
    pointerEvents: "none",
  }}
/>
```


## Redis Caching Strategy

All caching uses Upstash Redis via `src/lib/redis/client.ts`. The pattern is: check cache → on miss, query DB → store result → return.

### Cache Key Schema

| Key Pattern | TTL | Content | Invalidation |
|---|---|---|---|
| `products:list:{hash}` | 120s | `products.getAll` result (hash of input params) | On product create/update/delete |
| `products:slug:{slug}` | 300s | `products.getBySlug` result with variants | On product update |
| `products:id:{id}` | 300s | `products.getById` result | On product update |
| `analytics:dashboard` | 300s | `getDashboardStats` result | Time-based expiry |
| `analytics:revenue:{period}` | 300s | Revenue data points | Time-based expiry |
| `analytics:topproducts` | 300s | Top products by sales | Time-based expiry |
| `analytics:customerstats` | 300s | Customer metrics | Time-based expiry |
| `analytics:pnl` | 300s | P&L summary | Time-based expiry |
| `ai:digest` | 23h | Daily AI digest text | Pre-warmed by cron at 06:00 UTC |
| `ai:description:{productId}` | 3600s | AI-generated description | On explicit regeneration |
| `ai:forecast` | 3600s | Inventory forecast results | Time-based expiry |
| `search:semantic:{queryHash}` | 300s | Semantic search results | Time-based expiry |
| `cart:{sessionId}` | 604800s (7d) | `CartItem[]` | On cart mutation |
| `ratelimit:chat:{sessionId}` | 60s | Sliding window counter | Upstash Ratelimit managed |

### Redis Client (`src/lib/redis/client.ts`)

```ts
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = Redis.fromEnv();

// Cart utilities
export const getCart = (sessionId: string) =>
  redis.get<CartItem[]>(`cart:${sessionId}`);

export const setCart = (sessionId: string, items: CartItem[]) =>
  redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, items);

// Rate limiter for AI chat: 10 messages per minute per session
export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:chat",
});

// Generic cache helper
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  const result = await fn();
  await redis.setex(key, ttl, result);
  return result;
}
```

### Cache Usage in tRPC Procedures

```ts
// Example: products.getAll
const cacheKey = `products:list:${hashInput(input)}`;
return withCache(cacheKey, 120, () =>
  db.select().from(products).where(/* filters */)
);
```


## Authentication Flow

### NextAuth v5 Configuration (`src/server/auth.ts`)

```ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google,
    Resend({ from: "noreply@fraviont.com" }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id, role: user.role },
    }),
  },
});
```

### Session Type Augmentation

```ts
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
  interface User {
    role: string;
  }
}
```

### Middleware (`src/middleware.ts`)

```ts
import { auth } from "./server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!req.auth) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (req.auth.user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/account")) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
```

### Authentication Flow Diagram

```
Customer Sign-In (Magic Link):
  1. User enters email on /login
  2. NextAuth sends magic link via Resend from noreply@fraviont.com
  3. User clicks link → NextAuth creates/updates session
  4. Redirect to /account

Customer Sign-In (Google):
  1. User clicks "Sign in with Google"
  2. OAuth redirect to Google
  3. Google callback → NextAuth creates/updates session
  4. Redirect to /account or previous page

Admin Sign-In:
  1. User visits /admin → middleware checks session
  2. No session → redirect to /admin/login
  3. Sign in via Google or magic link
  4. Session created with role check
  5. role !== "ADMIN" → redirect to /
  6. role === "ADMIN" → access granted to /admin/*

tRPC adminProcedure Guard:
  1. Procedure called from client
  2. ctx.session checked
  3. No session → TRPCError UNAUTHORIZED
  4. session.user.role !== "ADMIN" → TRPCError UNAUTHORIZED
  5. Proceed with handler
```


## PayFast Payment Flow

### Flow Diagram

```
Shopper                  Next.js Server              PayFast
   │                          │                          │
   │  1. Fill checkout form   │                          │
   │─────────────────────────>│                          │
   │                          │                          │
   │  2. POST /api/checkout/  │                          │
   │     create-order         │                          │
   │─────────────────────────>│                          │
   │                          │ 3. Create order (pending)│
   │                          │    in DB                 │
   │                          │                          │
   │                          │ 4. generatePayFastForm() │
   │                          │    MD5 signature         │
   │                          │                          │
   │  5. { actionUrl, fields }│                          │
   │<─────────────────────────│                          │
   │                          │                          │
   │  6. Auto-submit hidden   │                          │
   │     HTML form to PayFast │                          │
   │─────────────────────────────────────────────────────>
   │                          │                          │
   │                          │  7. ITN POST to          │
   │                          │  /api/payfast/itn        │
   │                          │<─────────────────────────│
   │                          │                          │
   │                          │ 8. verifyITN()           │
   │                          │    - MD5 check           │
   │                          │    - PayFast server      │
   │                          │      validation          │
   │                          │                          │
   │                          │ 9. Update order:         │
   │                          │    status → confirmed    │
   │                          │    paymentStatus → paid  │
   │                          │    Decrement stock       │
   │                          │    Send confirm email    │
   │                          │                          │
   │  10. Redirect to         │                          │
   │  /checkout/success       │                          │
   │<─────────────────────────────────────────────────────
```

### PayFast Utilities (`src/lib/payfast/client.ts`)

```ts
// Signature generation
export function generatePayFastForm(params: PayFastParams): {
  actionUrl: string;
  fields: Record<string, string>;
}

// ITN verification (MD5 + server-side validation)
export async function verifyITN(body: Record<string, string>): Promise<boolean>
```

### PayFast Parameters

```ts
type PayFastParams = {
  orderId:     string;   // maps to m_payment_id
  orderNumber: string;   // used in item_name
  amountCents: number;   // divided by 100 for PayFast amount field
  firstName:   string;
  lastName:    string;
  email:       string;
};
```

### ITN Payment Status Handling

| `payment_status` | Action |
|---|---|
| `COMPLETE` | Set order `status=confirmed`, `paymentStatus=paid`, decrement stock, send confirmation email |
| `FAILED` | Set order `paymentStatus=failed` |
| `CANCELLED` | Set order `status=cancelled` |

### Environment-Based URL Switching

```ts
const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";
```


## AI Integration Design

### OpenRouter Client (`src/lib/ai/client.ts`)

```ts
type AICallOptions = {
  model?:      string;
  messages:    { role: "user" | "assistant" | "system"; content: string }[];
  system?:     string;
  temperature?: number;
  max_tokens?:  number;
};

export async function callAI(options: AICallOptions): Promise<string>
```

Headers sent to OpenRouter:
- `Authorization: Bearer ${OPENROUTER_API_KEY}`
- `HTTP-Referer: ${NEXTAUTH_URL}`
- `X-Title: Fraviont`
- `Content-Type: application/json`

### Model Routing Strategy

| Feature | Model | Rationale |
|---|---|---|
| Product descriptions | `anthropic/claude-3-5-sonnet` | Best creative/luxury writing |
| Concierge chat (Sophia) | `anthropic/claude-3-5-haiku` | Fast, cost-effective, conversational |
| Daily digest | `openai/gpt-4o` | Strong structured summarization |
| Inventory forecasting | `openai/gpt-4o` | Strong numerical reasoning |
| Scent profile quiz | `anthropic/claude-3-5-haiku` | Fast, good enough for recommendations |
| Embeddings | `text-embedding-3-small` | Cheap, 1536-dim, good semantic quality |

### Prompt Library (`src/lib/ai/prompts.ts`)

```ts
export const SOPHIA_SYSTEM_PROMPT: string
// Sophia is a luxury personal shopping concierge for Fraviont.
// She speaks in a warm, refined tone. She recommends products
// based on the shopper's preferences and answers questions about
// perfumes, cosmetics, and jewelry.

export function buildDescriptionPrompt(product: ProductInput): string
// Generates luxury editorial copy for a product.
// Input: name, category, subcategory, scentNotes, ingredients, variants
// Output: { shortDescription, description, aiDescription }

export function buildProfilePrompt(answers: QuizAnswers, products: Product[]): string
// Generates a personalised scent profile from quiz answers.
// Output: { scentFamily, preferences, recommendations: productId[] }

export function buildDailyDigestPrompt(stats: DashboardStats): string
// Generates a concise daily performance summary for the admin.
// Output: 3-4 paragraph narrative with key insights

export function buildForecastPrompt(stockData: StockData[], salesData: SalesData[]): string
// Generates restock recommendations with urgency levels.
// Output: { variantId, currentStock, suggestedReorder, urgency }[]
```

### AI Feature Flow Diagrams

#### Sophia Concierge Chat

```
User types message
  → ai.chat tRPC mutation
  → Rate limit check (10/min per sessionId via Upstash)
    → LIMIT EXCEEDED: return TRPCError TOO_MANY_REQUESTS
  → Build messages array with SOPHIA_SYSTEM_PROMPT
  → callAI({ model: "claude-3-5-haiku", messages })
  → Return { reply }
  → Animate new message into chat panel
```

#### Product Description Generation

```
Admin clicks "Generate with AI"
  → ai.generateDescription({ productId })
  → Check Redis: ai:description:{productId} (TTL 1h)
    → HIT: return cached description
  → Fetch product from DB
  → callAI({ model: "claude-3-5-sonnet", system: buildDescriptionPrompt(product) })
  → Cache result in Redis (1h TTL)
  → Populate ProductForm description fields
```

#### Semantic Search

```
User submits search query
  → ai.semanticSearch({ query })
  → Check Redis: search:semantic:{queryHash} (TTL 300s)
    → HIT: return cached results
  → Generate query embedding via text-embedding-3-small
  → pgvector cosine similarity search against products.embedding
  → If no results: fallback to ILIKE text search
  → Cache results
  → Return ranked products
```

#### Daily Digest (Cron)

```
Vercel Cron at 06:00 UTC
  → POST /api/cron/daily-digest (Bearer CRON_SECRET)
  → Fetch DashboardStats from DB
  → callAI({ model: "gpt-4o", system: buildDailyDigestPrompt(stats) })
  → Store in Redis: ai:digest (TTL 23h)

Admin visits dashboard
  → ai.getDailyDigest adminProcedure
  → Check Redis: ai:digest
    → HIT: return cached digest
    → MISS: generate on-demand (fallback)
```


## File/Folder Structure

```
fraviont-store/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root: fonts, #page-curtain, TRPCProvider, Toaster
│   │   ├── globals.css                   ← Tailwind v4, CSS vars, skeleton animation
│   │   ├── (store)/
│   │   │   ├── layout.tsx                ← Navigation + Footer + ChatWidget
│   │   │   ├── page.tsx                  ← Homepage
│   │   │   ├── shop/
│   │   │   │   └── page.tsx
│   │   │   ├── product/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── success/page.tsx
│   │   │   │   └── cancel/page.tsx
│   │   │   └── account/
│   │   │       ├── page.tsx
│   │   │       ├── orders/[id]/page.tsx
│   │   │       └── profile/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── trpc/[trpc]/route.ts
│   │       ├── payfast/itn/route.ts
│   │       ├── checkout/create-order/route.ts
│   │       ├── cron/daily-digest/route.ts
│   │       └── cron/abandoned-cart/route.ts
│   ├── components/
│   │   ├── ui/                           ← shadcn (do not modify directly)
│   │   ├── store/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoryShowcase.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── ScentProfile.tsx
│   │   │   ├── AddToCart.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── FiltersPanel.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── ChatWidget.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── AIDigestCard.tsx
│   │   │   ├── RecentOrdersTable.tsx
│   │   │   ├── LowStockAlerts.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── StockAdjustmentModal.tsx
│   │   │   └── StatusTimeline.tsx
│   │   └── shared/
│   │       ├── skeletons/
│   │       │   ├── ProductCardSkeleton.tsx
│   │       │   ├── ProductGridSkeleton.tsx
│   │       │   ├── ProductDetailSkeleton.tsx
│   │       │   ├── KPICardSkeleton.tsx
│   │       │   ├── TableSkeleton.tsx
│   │       │   └── ChatMessageSkeleton.tsx
│   │       ├── StatusBadge.tsx
│   │       └── PriceDisplay.tsx
│   ├── server/
│   │   ├── auth.ts
│   │   ├── db/
│   │   │   ├── index.ts                  ← Drizzle client
│   │   │   ├── schema.ts                 ← Source of truth
│   │   │   └── seed.ts
│   │   └── api/
│   │       ├── trpc.ts                   ← createTRPCRouter, procedures
│   │       ├── root.ts                   ← appRouter
│   │       └── routers/
│   │           ├── products.ts
│   │           ├── orders.ts
│   │           ├── inventory.ts
│   │           ├── analytics.ts
│   │           ├── customers.ts
│   │           └── ai.ts
│   ├── lib/
│   │   ├── utils.ts                      ← cn, formatPrice, formatDate, generateOrderNumber
│   │   ├── ai/
│   │   │   ├── client.ts                 ← callAI()
│   │   │   └── prompts.ts                ← Prompt builders
│   │   ├── redis/
│   │   │   └── client.ts                 ← redis, getCart, setCart, withCache, chatRateLimiter
│   │   ├── payfast/
│   │   │   └── client.ts                 ← generatePayFastForm, verifyITN
│   │   ├── stores/
│   │   │   └── cart.store.ts             ← Zustand cart store
│   │   ├── email/
│   │   │   └── templates/
│   │   │       ├── OrderConfirmation.tsx
│   │   │       ├── ShippingNotification.tsx
│   │   │       ├── LowStockAlert.tsx
│   │   │       ├── AbandonedCart.tsx
│   │   │       └── WelcomeEmail.tsx
│   │   └── gsap/
│   │       ├── config.ts
│   │       ├── easings.ts
│   │       └── animations/
│   │           ├── hero.ts
│   │           ├── scrollReveal.ts
│   │           ├── productCard.ts
│   │           ├── navigation.ts
│   │           ├── textEffects.ts
│   │           ├── scentProfile.ts
│   │           └── admin.ts
│   ├── trpc/
│   │   ├── server.ts                     ← createCaller for RSC
│   │   ├── client.ts                     ← createTRPCClient
│   │   └── react.tsx                     ← TRPCReactProvider, api
│   └── types/
│       ├── next-auth.d.ts
│       └── index.ts                      ← Shared types
├── drizzle/
│   └── migrations/                       ← Generated SQL migrations
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── vercel.json
└── package.json
```


## Data Flow Diagrams

### Store Product Browsing Flow

```
User visits /shop?category=perfumes&page=1
  │
  ├─ Next.js Server Component renders
  │   └─ Suspense fallback: ProductGridSkeleton count={9}
  │
  ├─ tRPC caller (server-side): products.getAll({ category: "perfumes", page: 1 })
  │   ├─ Redis check: products:list:{hash}
  │   │   ├─ HIT → return cached
  │   │   └─ MISS → Drizzle query → cache 120s → return
  │   └─ Returns { products[], total, hasMore }
  │
  └─ ProductGrid renders with GSAP revealStagger on mount
      └─ ProductCard × n (setupCardHover on each)
```

### Cart State Flow

```
User clicks "Add to Collection"
  │
  ├─ AddToCart component (client)
  │   ├─ useCartStore().addItem(cartItem)
  │   │   └─ Zustand state update → localStorage persist
  │   └─ Sync to Redis: setCart(sessionId, items) [7d TTL]
  │
  ├─ Navigation cart badge updates (useCartStore().itemCount)
  │
  └─ GSAP scale pulse on button (0.97 → 1.0)

User opens CartDrawer
  ├─ Sheet opens
  ├─ useGSAP revealStagger on line items
  └─ FreeShippingBar animates to current percentage
```

### Admin Order Fulfillment Flow

```
Admin visits /admin/orders/[id]
  │
  ├─ Server Component: orders.getById({ id })
  │   └─ Returns order + items + customer
  │
  ├─ StatusTimeline renders current status
  │
  └─ Admin updates status to "shipped" + tracking number
      ├─ orders.updateStatus({ id, status: "shipped", trackingNumber })
      │   └─ DB update
      ├─ Trigger: send ShippingNotification email via Resend
      └─ Success toast
```

### AI Chat Flow

```
User types message in ChatWidget
  │
  ├─ ai.chat mutation ({ message, sessionId })
  │   ├─ Upstash rate limit check (10/min per sessionId)
  │   │   └─ EXCEEDED → TRPCError TOO_MANY_REQUESTS
  │   ├─ Build messages: [SOPHIA_SYSTEM_PROMPT, ...history, userMessage]
  │   └─ callAI({ model: "claude-3-5-haiku", messages })
  │       └─ OpenRouter API → Claude response
  │
  ├─ Typing indicator shown during pending
  └─ New message animates in (y: 16 → 0, opacity: 0 → 1)
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: formatPrice Round-Trip

*For any* positive integer representing a price in ZAR cents, `formatPrice(cents)` should return a non-empty string, and `parseFloat` of that string should produce a finite number greater than zero.

**Validates: Requirements 1.4, 1.15, 23.7**

---

### Property 2: products.getAll Response Shape Invariant

*For any* valid combination of `category`, `search`, `page`, and `limit` inputs to `products.getAll`, the response should always contain a `products` array, a non-negative integer `total`, and a boolean `hasMore`. The `products` array length should never exceed `limit`. When `hasMore` is true, `total` should be greater than `page * limit`.

**Validates: Requirements 6.1**

---

### Property 3: PayFast Signature Generation Produces Valid MD5

*For any* valid `PayFastParams` object, `generatePayFastForm(params)` should return an object where `fields.signature` is a 32-character lowercase hexadecimal string (valid MD5 hash), and `fields` contains all required PayFast parameters: `merchant_id`, `merchant_key`, `return_url`, `cancel_url`, `notify_url`, `m_payment_id`, `amount`, `item_name`.

**Validates: Requirements 9.1**

---

### Property 4: PayFast ITN Verification Round-Trip

*For any* valid `PayFastParams`, if we generate a form using `generatePayFastForm(params)` and then call `verifyITN` with those same fields (excluding the server-side validation step), the local MD5 signature check should pass. Conversely, for any ITN body where any field value has been tampered with, the local signature check should fail.

**Validates: Requirements 9.2**

---

### Property 5: Cart State Invariants

*For any* cart state and valid `CartItem`, the following invariants must hold:
- After `addItem(item)`, `itemCount` increases by `item.quantity` and `items` contains the added item
- After `removeItem(id)`, `items` no longer contains an item with that id
- After `clearCart()`, `itemCount === 0` and `items` is empty
- `total` always equals the sum of `item.price * item.quantity` for all items in `items`

**Validates: Requirements 8.1**

---

### Property 6: Semantic Search Results Ordered by Similarity

*For any* search query that returns multiple results from `ai.semanticSearch`, the results should be ordered by descending similarity score — i.e., for any two adjacent results `a` and `b` in the returned array, `a.similarityScore >= b.similarityScore`.

**Validates: Requirements 20.4**

---

### Property 7: AI Chat Rate Limiting

*For any* session ID, after exactly 10 `ai.chat` calls within a 60-second window, the 11th call within that same window should be rejected with a rate limit error. After the window resets, calls should succeed again.

**Validates: Requirements 16.5**


## Error Handling

### tRPC Error Codes

| Scenario | TRPCError Code | HTTP Status |
|---|---|---|
| No session on protectedProcedure | `UNAUTHORIZED` | 401 |
| Non-ADMIN on adminProcedure | `UNAUTHORIZED` | 401 |
| Resource not found (product, order) | `NOT_FOUND` | 404 |
| Invalid Zod input | `BAD_REQUEST` | 400 |
| AI rate limit exceeded | `TOO_MANY_REQUESTS` | 429 |
| OpenRouter API failure | `INTERNAL_SERVER_ERROR` | 500 |
| DB query failure | `INTERNAL_SERVER_ERROR` | 500 |

### PayFast ITN Error Handling

```ts
// src/app/api/payfast/itn/route.ts
export async function POST(req: NextRequest) {
  try {
    const body = Object.fromEntries(await req.formData());
    const isValid = await verifyITN(body as Record<string, string>);
    if (!isValid) return new NextResponse("Invalid", { status: 400 });

    const { m_payment_id, payment_status } = body;

    if (payment_status === "COMPLETE") {
      await db.update(orders)
        .set({ status: "confirmed", paymentStatus: "paid" })
        .where(eq(orders.id, m_payment_id as string));
      // Fire-and-forget: decrement stock, send email
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("[ITN] Error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
```

### Email Error Handling

All email sends are wrapped in try/catch. Failures are logged but never block the primary operation:

```ts
try {
  await resend.emails.send({ ... });
} catch (err) {
  console.error("[Email] Failed to send:", err);
  // Do NOT re-throw — order update already succeeded
}
```

### Client-Side Error Handling

- Every `useMutation` has `onError: (err) => toast.error(err.message)`
- Every `useQuery` has an error boundary or inline error state
- Network errors surface as toast notifications (react-hot-toast)
- Skeleton components prevent layout shift during loading states

### AI Fallback Strategy

```
OpenRouter API failure
  → Log error
  → Return TRPCError INTERNAL_SERVER_ERROR with user-friendly message
  → Client shows error toast: "AI is temporarily unavailable"

Semantic search: no vector results
  → Fallback to ILIKE text search on name + description
  → If still no results: return empty array

Daily digest: Redis miss + OpenRouter failure
  → Return last cached digest if available
  → Otherwise return null (AIDigestCard shows "Digest unavailable")
```


## Testing Strategy

### Dual Testing Approach

Unit tests cover specific examples, edge cases, and error conditions. Property-based tests verify universal properties across all inputs. Both are complementary and necessary for comprehensive coverage.

### Property-Based Testing Library

**Library:** [fast-check](https://fast-check.dev/) — TypeScript-native, excellent arbitrary generators, integrates with Vitest.

```bash
pnpm add -D fast-check vitest @vitest/coverage-v8
```

Each property test runs a minimum of **100 iterations** (fast-check default). Each test is tagged with a comment referencing the design property.

### Property Tests

#### Property 1: formatPrice Round-Trip

```ts
// Feature: fraviont-platform, Property 1: formatPrice round-trip
import fc from "fast-check";
import { formatPrice } from "@/lib/utils";

test("formatPrice round-trip: any positive integer cents produces a parseable string", () => {
  fc.assert(
    fc.property(fc.integer({ min: 1, max: 10_000_000 }), (cents) => {
      const formatted = formatPrice(cents);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
      expect(parseFloat(formatted.replace(/[^0-9.]/g, ""))).toBeFinite();
    }),
    { numRuns: 100 }
  );
});
```

#### Property 2: products.getAll Response Shape

```ts
// Feature: fraviont-platform, Property 2: products.getAll response shape invariant
import fc from "fast-check";

test("products.getAll always returns correct shape with valid constraints", () => {
  fc.assert(
    fc.property(
      fc.record({
        page:  fc.integer({ min: 1, max: 100 }),
        limit: fc.integer({ min: 1, max: 50 }),
      }),
      async ({ page, limit }) => {
        const result = await caller.products.getAll({ page, limit });
        expect(Array.isArray(result.products)).toBe(true);
        expect(result.products.length).toBeLessThanOrEqual(limit);
        expect(typeof result.total).toBe("number");
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(typeof result.hasMore).toBe("boolean");
        if (result.hasMore) {
          expect(result.total).toBeGreaterThan(page * limit);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 3: PayFast Signature Generation

```ts
// Feature: fraviont-platform, Property 3: PayFast signature produces valid MD5
import fc from "fast-check";
import { generatePayFastForm } from "@/lib/payfast/client";

test("generatePayFastForm always produces a valid MD5 signature and required fields", () => {
  fc.assert(
    fc.property(
      fc.record({
        orderId:     fc.uuid(),
        orderNumber: fc.string({ minLength: 5, maxLength: 20 }),
        amountCents: fc.integer({ min: 100, max: 10_000_000 }),
        firstName:   fc.string({ minLength: 1, maxLength: 50 }),
        lastName:    fc.string({ minLength: 1, maxLength: 50 }),
        email:       fc.emailAddress(),
      }),
      (params) => {
        const { fields } = generatePayFastForm(params);
        expect(fields.signature).toMatch(/^[a-f0-9]{32}$/);
        expect(fields.merchant_id).toBeDefined();
        expect(fields.m_payment_id).toBe(params.orderId);
        expect(fields.amount).toBe((params.amountCents / 100).toFixed(2));
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 4: PayFast ITN Verification Round-Trip

```ts
// Feature: fraviont-platform, Property 4: ITN verification round-trip
import fc from "fast-check";
import { generatePayFastForm } from "@/lib/payfast/client";
import crypto from "crypto";

test("ITN signature verification: generated signature passes local check, tampered fails", () => {
  fc.assert(
    fc.property(
      fc.record({
        orderId:     fc.uuid(),
        orderNumber: fc.string({ minLength: 5 }),
        amountCents: fc.integer({ min: 100, max: 1_000_000 }),
        firstName:   fc.string({ minLength: 1 }),
        lastName:    fc.string({ minLength: 1 }),
        email:       fc.emailAddress(),
      }),
      (params) => {
        const { fields } = generatePayFastForm(params);
        // Local signature check (without server validation)
        const { signature, ...rest } = fields;
        const passphrase = process.env.PAYFAST_PASSPHRASE!;
        const str = Object.entries(rest)
          .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
          .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;
        const expected = crypto.createHash("md5").update(str).digest("hex");
        expect(signature).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 5: Cart State Invariants

```ts
// Feature: fraviont-platform, Property 5: cart state invariants
import fc from "fast-check";
import { createCartStore } from "@/lib/stores/cart.store";

const cartItemArb = fc.record({
  id:        fc.uuid(),
  productId: fc.uuid(),
  name:      fc.string({ minLength: 1 }),
  image:     fc.webUrl(),
  price:     fc.integer({ min: 100, max: 1_000_000 }),
  quantity:  fc.integer({ min: 1, max: 10 }),
  slug:      fc.string({ minLength: 1 }),
});

test("cart invariants: addItem, removeItem, clearCart, total", () => {
  fc.assert(
    fc.property(fc.array(cartItemArb, { minLength: 1, maxLength: 10 }), (items) => {
      const store = createCartStore();
      items.forEach(item => store.getState().addItem(item));

      const state = store.getState();
      const expectedCount = items.reduce((sum, i) => sum + i.quantity, 0);
      expect(state.itemCount).toBe(expectedCount);

      const expectedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      expect(state.total).toBe(expectedTotal);

      // removeItem removes the item
      const toRemove = items[0];
      store.getState().removeItem(toRemove.id);
      expect(store.getState().items.find(i => i.id === toRemove.id)).toBeUndefined();

      // clearCart empties everything
      store.getState().clearCart();
      expect(store.getState().itemCount).toBe(0);
      expect(store.getState().items).toHaveLength(0);
    }),
    { numRuns: 100 }
  );
});
```

#### Property 6: Semantic Search Ordering

```ts
// Feature: fraviont-platform, Property 6: semantic search results ordered by similarity
import fc from "fast-check";

test("semantic search results are ordered by descending similarity score", () => {
  fc.assert(
    fc.property(fc.string({ minLength: 3, maxLength: 100 }), async (query) => {
      const results = await caller.ai.semanticSearch({ query });
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarityScore).toBeGreaterThanOrEqual(
          results[i + 1].similarityScore
        );
      }
    }),
    { numRuns: 50 }  // Reduced due to API calls; use mocked embeddings in CI
  );
});
```

#### Property 7: AI Chat Rate Limiting

```ts
// Feature: fraviont-platform, Property 7: AI chat rate limiting
import fc from "fast-check";

test("ai.chat rate limit: 11th message in a minute is rejected", async () => {
  fc.assert(
    fc.property(fc.uuid(), async (sessionId) => {
      // Send 10 messages — all should succeed
      for (let i = 0; i < 10; i++) {
        await expect(
          caller.ai.chat({ message: "Hello", sessionId })
        ).resolves.toBeDefined();
      }
      // 11th should be rate-limited
      await expect(
        caller.ai.chat({ message: "Hello", sessionId })
      ).rejects.toThrow(/TOO_MANY_REQUESTS/);
    }),
    { numRuns: 10 }  // Reduced — each run makes 11 API calls
  );
});
```

### Unit Tests

Unit tests focus on specific examples, integration points, and error conditions:

- `formatPrice(0)` returns `"R0.00"` or equivalent
- `generateOrderNumber()` returns a string matching expected format
- `verifyITN` with invalid signature returns `false`
- `products.create` with missing required fields throws `BAD_REQUEST`
- `adminProcedure` with no session throws `UNAUTHORIZED`
- `adminProcedure` with USER role throws `UNAUTHORIZED`
- PayFast ITN handler returns 400 on invalid signature
- PayFast ITN handler returns 200 on valid COMPLETE payment
- Cart `addItem` with existing item ID increments quantity
- `withCache` returns cached value on second call without hitting DB

### Integration Tests

Integration tests verify external service wiring with 1-3 representative examples:

- NextAuth session creation with DrizzleAdapter
- Drizzle query against Neon test database
- Redis `setex` / `get` round-trip
- Resend email send (sandbox mode)
- PayFast ITN endpoint end-to-end with sandbox

### Test Configuration

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

