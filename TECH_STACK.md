# 🔧 FRAVIONT — Tech Stack Reference

> Complete technology decisions with rationale for every choice.

---

## Stack Overview

```
Frontend        → Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
Backend         → tRPC (type-safe API layer)
Database        → Neon (Serverless Postgres) + Drizzle ORM
Caching         → Upstash Redis
AI Layer        → OpenRouter API (Claude / GPT-4o / Gemini)
Payments        → Stripe
Auth            → NextAuth.js v5 (Auth.js)
Storage         → Vercel Blob / Cloudflare R2
Deployment      → Vercel
Email           → Resend
```

---

## 1. Next.js 15 (App Router)

**Why:** Server Components + Server Actions reduce JavaScript bundle size dramatically. App Router enables nested layouts which is perfect for the separate `/store` and `/admin` routes with different shells.

**Key configuration:**
```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,              // Partial pre-rendering for product pages
    reactCompiler: true,    // Auto-memoization
  },
  images: {
    remotePatterns: [
      { hostname: "*.r2.cloudflarestorage.com" },
      { hostname: "*.vercel-storage.com" },
    ],
  },
};
export default nextConfig;
```

**Route Groups:**
- `(store)` — Customer storefront. Public + authenticated routes.
- `(admin)` — Admin panel. Requires `ADMIN` role.
- `api/trpc` — tRPC API handler.

---

## 2. Tailwind CSS v4

**Why:** Utility-first CSS with v4's new CSS-first configuration. Enables the luxury design system with CSS variables that cascade perfectly through shadcn/ui.

**Key setup:**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-gold-50: #fefce8;
  --color-gold-200: #f9e68a;
  --color-gold-400: #d4af37;
  --color-gold-500: #b8960c;
  --color-obsidian: #0a0a0a;
  --color-charcoal: #1a1a1a;
  --color-ivory: #f5f0e8;

  --font-display: "Cormorant Garamond", "Playfair Display", serif;
  --font-sans: "Jost", "DM Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

---

## 3. shadcn/ui

**Why:** Unstyled, accessible components that are fully owned in the codebase. Can be fully re-skinned to the luxury dark aesthetic. Provides: Dialog, Sheet, Dropdown, Table, Form, Toast, Command palette, Charts (Recharts).

**Installation:**
```bash
pnpx shadcn@latest init
pnpx shadcn@latest add button card dialog form input label
pnpx shadcn@latest add table tabs badge select
pnpx shadcn@latest add dropdown-menu sheet command
pnpx shadcn@latest add chart toast separator
```

**Critical:** Override CSS variables in `globals.css` to match the luxury dark theme. Never use default shadcn colors in Fraviont.

```css
:root {
  --background: 0 0% 4%;          /* Near-black */
  --foreground: 43 20% 93%;       /* Warm ivory */
  --primary: 45 73% 52%;          /* Antique gold */
  --primary-foreground: 0 0% 4%;
  --card: 0 0% 8%;
  --border: 0 0% 16%;
  --muted: 0 0% 12%;
  --muted-foreground: 0 0% 55%;
  --accent: 45 73% 52%;
}
```

---

## 4. tRPC v11

**Why:** End-to-end type safety from database to UI with zero code generation. Mutations and queries are automatically inferred. Works perfectly with React Query (TanStack Query) for caching.

**Setup:**
```ts
// src/server/api/root.ts
import { createTRPCRouter } from "./trpc";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { inventoryRouter } from "./routers/inventory";
import { analyticsRouter } from "./routers/analytics";
import { customersRouter } from "./routers/customers";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  products: productsRouter,
  orders: ordersRouter,
  inventory: inventoryRouter,
  analytics: analyticsRouter,
  customers: customersRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
```

**Usage in components:**
```tsx
// Type-safe, no API boilerplate needed
const { data: products } = api.products.getAll.useQuery({
  category: "perfumes",
  limit: 12,
});

const createProduct = api.products.create.useMutation({
  onSuccess: () => router.refresh(),
});
```

---

## 5. Drizzle ORM + Neon (Serverless Postgres)

**Why Drizzle:** Lightweight, type-safe, SQL-first ORM. Migrations are plain SQL files. Works perfectly with serverless (no connection pooling issues like Prisma).

**Why Neon:** Serverless Postgres with branching (dev/prod), scales to zero, HTTP-based driver perfect for Vercel Edge.

**Setup:**
```ts
// src/server/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Core Schema Tables:**
```ts
// src/server/db/schema.ts
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  aiDescription: text("ai_description"),       // AI-generated luxury copy
  price: integer("price").notNull(),            // In cents
  compareAtPrice: integer("compare_at_price"),
  category: productCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),
  images: jsonb("images").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  ingredients: text("ingredients"),
  scentNotes: jsonb("scent_notes").$type<{
    top: string[], middle: string[], base: string[]
  }>(),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  sku: text("sku").unique().notNull(),
  name: text("name").notNull(),                 // "50ml", "Rose Gold", "S"
  price: integer("price"),                       // Override if different
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  weight: integer("weight"),                     // grams, for shipping
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").unique().notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  email: text("email").notNull(),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  subtotal: integer("subtotal").notNull(),       // In cents
  discountTotal: integer("discount_total").default(0),
  shippingTotal: integer("shipping_total").default(0),
  taxTotal: integer("tax_total").default(0),
  total: integer("total").notNull(),
  shippingAddress: jsonb("shipping_address").$type<Address>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  variantId: uuid("variant_id").references(() => productVariants.id),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  image: text("image"),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  name: text("name"),
  phone: text("phone"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: integer("total_spent").default(0),
  aiProfile: jsonb("ai_profile").$type<CustomerAIProfile>(), // AI-generated
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory_logs = pgTable("inventory_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id").references(() => productVariants.id).notNull(),
  type: inventoryLogTypeEnum("type").notNull(), // 'restock' | 'sale' | 'adjustment'
  quantityChange: integer("quantity_change").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enums
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

**drizzle.config.ts:**
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  out: "./drizzle/migrations",
});
```

---

## 6. Upstash Redis

**Why:** Serverless Redis for rate limiting, session caching, cart storage, AI response caching, and real-time-like features without maintaining a Redis server.

**Use cases in Fraviont:**
```
1. Cart → Store guest cart by session ID (TTL: 7 days)
2. AI Chat → Cache conversation context per session
3. AI Responses → Cache product description generations (TTL: 1 hour)
4. Rate Limiting → API route protection (100 req/min per IP)
5. Recently Viewed → Per-user product history
6. Flash Sale Inventory → Atomic decrements for race condition safety
7. Admin Analytics → Cache daily dashboard stats (TTL: 5 min)
```

**Setup:**
```ts
// src/lib/redis/client.ts
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// Cart utilities
export async function getCart(sessionId: string) {
  return redis.get<CartItem[]>(`cart:${sessionId}`);
}

export async function setCart(sessionId: string, items: CartItem[]) {
  return redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, items);
}

// Rate limiter
import { Ratelimit } from "@upstash/ratelimit";
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});
```

---

## 7. OpenRouter API (AI Layer)

**Why:** OpenRouter gives access to Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, and Llama 3 from a single API key. No vendor lock-in. Can route to the cheapest/best model per task.

**Model routing strategy for Fraviont:**
```
Product descriptions   → claude-3-5-sonnet (best creative writing)
Concierge chatbot      → claude-3-5-haiku (fast, cheap, good enough)
Customer segmentation  → gpt-4o (strong structured output)
Semantic search embed  → text-embedding-3-small (OpenAI, cheap)
Inventory forecasting  → gpt-4o (strong with numbers/reasoning)
```

**Client setup:**
```ts
// src/lib/ai/client.ts
export async function callAI({
  model = "anthropic/claude-3-5-haiku",
  messages,
  system,
  temperature = 0.7,
  max_tokens = 1000,
}: AICallOptions) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL!,
      "X-Title": "Fraviont",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: system ? [{ role: "system", content: system }, ...messages] : messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content as string;
}
```

---

## 8. Payments (PayFast)

**Why PayFast:** South African payment gateway supporting credit/debit cards, Instant EFT, Mobicred, SnapScan, and Ozow. Uses a redirect-based flow (customer is sent to PayFast's hosted page, then returned to your site).

**PayFast Flow (different from Stripe Elements):**
```
1. Customer clicks "Place Order" on checkout
2. Server creates order in DB with status: "pending"
3. Server generates PayFast payment form (signed with MD5 signature)
4. Client redirects to PayFast payment page
5. Customer pays on PayFast
6. PayFast sends ITN (Instant Transaction Notification) POST to your server
7. Server verifies ITN signature + validates amount
8. Server updates order status to "confirmed" and fulfills
9. Customer is redirected back to /checkout/success?order={id}
```

**Environment Variables:**
```env
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_SANDBOX=true   # false in production
NEXT_PUBLIC_SITE_URL=https://fraviont.com
```

**PayFast utility:**
```ts
// src/lib/payfast/client.ts
import crypto from "crypto";

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

export function generatePayFastForm(params: PayFastParams): {
  actionUrl: string;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {
    merchant_id:   process.env.PAYFAST_MERCHANT_ID!,
    merchant_key:  process.env.PAYFAST_MERCHANT_KEY!,
    return_url:    `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    cancel_url:    `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    notify_url:    `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/itn`,
    name_first:    params.firstName,
    name_last:     params.lastName,
    email_address: params.email,
    m_payment_id:  params.orderId,          // Your internal order ID
    amount:        (params.amountCents / 100).toFixed(2),
    item_name:     `Fraviont Order #${params.orderNumber}`,
  };

  // Generate MD5 signature
  const passphrase = process.env.PAYFAST_PASSPHRASE!;
  const signatureString = Object.entries(fields)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
    .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;

  fields.signature = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex");

  return { actionUrl: PAYFAST_URL, fields };
}

// Verify ITN from PayFast
export async function verifyITN(body: Record<string, string>): Promise<boolean> {
  // 1. Verify signature
  const { signature, ...rest } = body;
  const passphrase = process.env.PAYFAST_PASSPHRASE!;
  const verifyString = Object.entries(rest)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
    .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;

  const expectedSig = crypto
    .createHash("md5")
    .update(verifyString)
    .digest("hex");

  if (expectedSig !== signature) return false;

  // 2. Verify with PayFast server (anti-fraud)
  const verifyUrl = process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

  const verifyRes = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  const verifyText = await verifyRes.text();
  return verifyText === "VALID";
}
```

**ITN webhook handler:**
```ts
// src/app/api/payfast/itn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyITN } from "@/lib/payfast/client";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = Object.fromEntries(await req.formData() as any);

  const isValid = await verifyITN(body);
  if (!isValid) return new NextResponse("Invalid", { status: 400 });

  const { m_payment_id, payment_status, amount_gross } = body;

  if (payment_status === "COMPLETE") {
    await db.update(orders)
      .set({ status: "confirmed", paymentStatus: "paid" })
      .where(eq(orders.id, m_payment_id));
    // TODO: decrement stock, send confirmation email
  }

  return new NextResponse("OK", { status: 200 });
}
```

**Checkout page (redirect flow):**
```tsx
// Client submits a form that POSTs to PayFast
// Server generates the signed fields, client auto-submits

export async function POST(req: NextRequest) {
  const { orderId, customerInfo } = await req.json();
  const order = await getOrder(orderId);
  const { actionUrl, fields } = generatePayFastForm({ ...order, ...customerInfo });
  return NextResponse.json({ actionUrl, fields });
}

// Client component
function redirectToPayFast(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
```

**ITN Payment status values:**
```
COMPLETE  → Payment successful, fulfill order
FAILED    → Payment failed, mark order failed
CANCELLED → Customer cancelled, mark order cancelled
```

---

## 9. Authentication (NextAuth.js v5)

**Setup:**
```ts
// src/server/auth.ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

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

**Admin middleware:**
```ts
// src/middleware.ts
import { auth } from "./server/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!req.auth) return NextResponse.redirect(new URL("/login", req.url));
    if (req.auth.user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
```

---

## 10. Email (Resend + React Email)

**Templates needed:**
- Order confirmation
- Shipping notification (with tracking)
- Password reset / magic link
- Low stock alert (admin)
- Abandoned cart recovery
- Welcome email

---

## 📦 Full `package.json` Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "drizzle-orm": "^0.38.0",
    "@neondatabase/serverless": "^0.10.0",
    "@upstash/redis": "^1.34.0",
    "@upstash/ratelimit": "^2.0.0",
    "next-auth": "^5.0.0",
    "@auth/drizzle-adapter": "^1.4.0",
    "resend": "^4.0.0",
    "@react-email/components": "^0.0.27",
    "zod": "^3.23.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0",
    "gsap": "^3.12.0",
    "@gsap/react": "^2.1.0",
    "recharts": "^2.13.0",
    "react-hot-toast": "^2.4.0",
    "zustand": "^5.0.0",
    "date-fns": "^4.0.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.28.0",
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

---

## 🗺 Data Flow Diagram

```
Browser → Next.js Server Component
       → tRPC Procedure (Zod validated)
       → Drizzle Query
       → Neon Postgres

       → Redis Cache Check first (Upstash)
       → OpenRouter (AI features)
       → Stripe (payments)
```


<!-- the problem is that each thing is taking too much time for laoding please fix that i dont want people to just move away from app because it takes centuries to load or is it just in the local development env that load speed is too slow? and the admin login why does it have google their admin should only be the person with credentials this way anyone will be able to acess admin side and the google login should only be on the customer side where they can login place orders track orders and see order history only make these changes and the hero bg is added but it feels stuck stuck when scrolling make the animation smooth and please seed the admin the admin can only be seeded no other person can be admin and provide admin credentials after seeding also when a buyer logs in they should get and email on the respected mail they signed in with with a lovely and beautiful message welcoming them and the navbar should have about contact pages in their aswell and collections shoould be moved at the start not at the end also make a drop down in which these perfumes jewelery and cosmetics one will be added and i have noticed that you have provided the links of any pages in the footer but none of thos pages actually exist so make them aswell the pages that do not exist wih the same theme and stuff and add some text in the home and other pages so pages look a bit more good and not just image spamming use any luxurious font you may like just make sure not to break the existing app and also i told you to feed products you did it or not? so when i login as admin i can simply add my own products and delete these ones and one more issue when i click a specific product it shows an error on that so please tend to that aswell do not change anything else  -->


<!-- in the home page the video has taken the whole background and is making text unreadabel and not very vell so fix that and only make the video in hero section with gsap animtions that work on the video while scrolling and secondly add other luxuru backgrounds to the rest of the home page and rest of the site so it does not feel empty epmty and actual luxury and also resolve his issue aswell 
## Error Type
Build Error

## Error Message
You cannot have two parallel pages that resolve to the same path. Please check /(admin)/login/page and /(store)/login/page. Refer to the route group docs for more information: https://nextjs.org/docs/app/building-your-application/routing/route-groups

## Build Output
src\app\(store)\login\page.tsx
You cannot have two parallel pages that resolve to the same path. Please check /(admin)/login/page and /(store)/login/page. Refer to the route group docs for more information: https://nextjs.org/docs/app/building-your-application/routing/route-groups

Next.js version: 15.5.15 (Webpack) -->
