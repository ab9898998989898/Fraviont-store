# Fraviont — Kiro Steering Rules

This is a luxury e-commerce platform for Fraviont (perfumes, cosmetics, jewelry).
All project specifications live in the root markdown files. Always read them before writing code.

## Documentation Map

Before touching any file, read the relevant doc:

| Working on | Read this first |
|-----------|-----------------|
| Any feature | CONTEXT.md (always) |
| Database / API | TECH_STACK.md |
| Store UI (pages, components) | DESIGN_SYSTEM.md + STORE_FEATURES.md |
| Admin UI | ADMIN_PANEL.md |
| AI features | AI_FEATURES.md |
| Build order / what to build next | IMPLEMENTATION_GUIDE.md |

## Hard Rules — Never Break

### Code
- TypeScript strict — no `any`, no unchecked type assertions
- `"use client"` only when the component needs: event handlers, hooks, or browser APIs
- All prices stored as INTEGER CENTS in the database — display with `formatPrice()`
- Drizzle ORM only — no raw SQL string interpolation
- All `/admin/*` routes and admin tRPC procedures use `adminProcedure` (checks role === "ADMIN")
- Every mutation shows a toast (success AND error) via react-hot-toast
- Every server-data-dependent UI has a skeleton loading state AND an error fallback
- Redis cache check BEFORE expensive DB queries (product lists, analytics, AI responses)
- Use only packages from the dependencies list in TECH_STACK.md — do NOT install unlisted packages

### Payments
- Payment gateway is PayFast — NOT Stripe, NOT any other provider
- PayFast uses a REDIRECT flow — customer is sent to PayFast's hosted page, not an embedded form
- ITN (Instant Transaction Notification) handler lives at `/api/payfast/itn`
- Never store raw card data anywhere
- Always verify ITN signature before updating order status

### Animations (GSAP — ZERO exceptions)
- ALL choreographed animations use GSAP. Never framer-motion (not in the stack). Never CSS @keyframes for reveals/entrances.
- Always use `useGSAP` from `@gsap/react` — never raw `useEffect` for GSAP. This ensures cleanup.
- Import `gsap` and `ScrollTrigger` ONLY from `src/lib/gsap/config.ts` — never directly from "gsap"
- All animation functions live in `src/lib/gsap/animations/` — call them from `useGSAP()` scope
- EASE constants from `src/lib/gsap/easings.ts` — never hardcode easing strings in components
- Default ease: `EASE.luxury` ("power4.out"). Reveal duration: 0.85–1.4s. Hover: 0.4–0.7s.
- ScrollTrigger on every section reveal — no one-shot mount animations for below-fold content
- Apply `magneticButton()` to every primary CTA button

### Skeletons (REQUIRED on every data-dependent UI)
- Server Components with async data: wrap data child in `<Suspense fallback={<XSkeleton />}>`
- Client Components with useQuery: `if (isPending) return <XSkeleton />`
- Skeleton components live in `src/components/shared/skeletons/`
- Skeleton style: dark shimmer `#1a1a1a → #222222`, `rounded-none`, staggered `animation-delay`
- Skeleton dimensions must EXACTLY match loaded content — no layout shift allowed
- Primary text: #F5F0E8 (ivory) — never pure #FFFFFF
- Accent / CTAs / prices: #C9A84C (gold-warm)
- Display font: Cormorant Garamond (headings, product names, hero text)
- UI font: Jost (body, labels, nav, buttons)
- Buttons: `rounded-none` or `rounded-sm` — NEVER pill-shaped
- Animations: 500ms+ duration, cubic-bezier ease — no spring/bounce
- No drop-shadows — use background color elevation instead
- Spacing: minimum 24px card padding, 64px between sections
- No inline style attributes for colors — use Tailwind utilities or CSS variables only

## Build Order

Always follow the phase order in IMPLEMENTATION_GUIDE.md. Check CONTEXT.md "Completed Steps"
before starting anything — never rebuild something already done.

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4

Within each phase, complete steps in numbered order. One step at a time.

## File Naming Conventions

```
Pages:        src/app/(store)/page-name/page.tsx
Layouts:      src/app/(store)/layout.tsx
Components:   src/components/store/ComponentName.tsx  (PascalCase)
Admin UI:     src/components/admin/ComponentName.tsx
Shared:       src/components/shared/ComponentName.tsx
tRPC routers: src/server/api/routers/resource.ts  (lowercase)
Utilities:    src/lib/category/name.ts  (kebab-case)
```

## Component Pattern

```tsx
// Server Component (default — no "use client")
import { api } from "@/trpc/server"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await api.products.getBySlug({ slug: params.slug })
  return <ProductDetail product={product} />
}

// Client Component (only when needed)
"use client"
import { api } from "@/trpc/client"

export function AddToCartButton({ productId }: { productId: string }) {
  const addToCart = api.cart.add.useMutation()
  return <button onClick={() => addToCart.mutate({ productId })}>Add to Cart</button>
}
```

## tRPC Pattern

```ts
// Always use the correct procedure type
publicProcedure    // No auth required
protectedProcedure // Any authenticated user
adminProcedure     // Must have role === "ADMIN"

// Always validate input with Zod
.input(z.object({ id: z.string().uuid() }))

// Always return typed data
.query(async ({ input, ctx }) => { ... })
.mutation(async ({ input, ctx }) => { ... })
```

## When You're Unsure

1. Check CONTEXT.md first
2. Then check the relevant spec file
3. Ask before inventing — do not make up solutions not in the spec
4. If a feature is not in any spec file, stop and ask for clarification
