# 🎨 FRAVIONT — Luxury Design System

> The complete visual language for Fraviont. Every UI decision must trace back to this document.

---

## Design Philosophy

**"Quiet Luxury."** Fraviont speaks in whispers, not shouts.

Inspired by: **Byredo, Bottega Veneta, Le Labo, The Row, Maison Margiela**

The aesthetic is:
- **Dark dominant** — almost-black backgrounds with warm undertones
- **Gold accents** — never neon, always antique/warm gold
- **Generous whitespace** — breathing room is a luxury signal
- **Editorial typography** — serif display fonts mixed with clean sans-serif
- **Subtle motion** — everything eases in slowly, nothing bounces or pops

---

## Color Palette

```css
/* Primary Palette */
--obsidian:     #0A0A0A;   /* Page background — near black, warm tint */
--charcoal:     #141414;   /* Card backgrounds */
--graphite:     #1E1E1E;   /* Elevated surfaces */
--iron:         #2A2A2A;   /* Borders, dividers */
--smoke:        #3D3D3D;   /* Muted borders */

/* Text */
--ivory:        #F5F0E8;   /* Primary text — warm, not pure white */
--parchment:    #C8C0B0;   /* Secondary text */
--ash:          #7A7470;   /* Muted text, placeholders */

/* Gold System (Primary Accent) */
--gold-bright:  #E8C97A;   /* CTAs, active states, hover */
--gold-warm:    #C9A84C;   /* Primary gold */
--gold-antique: #A68B3D;   /* Borders with gold, subtle accents */
--gold-deep:    #7A6228;   /* Pressed states */
--gold-glow:    rgba(200, 160, 60, 0.15); /* Gold glow/aura effect */

/* Status Colors (subdued, not primary web defaults) */
--emerald:      #2D6A4F;   /* Success */
--amber:        #9D6B1B;   /* Warning */
--crimson:      #8B2635;   /* Error/Danger */
--sapphire:     #1B4D7A;   /* Info */
```

---

## Typography

### Font Families

```css
/* Display / Headlines — Cormorant Garamond (serif) */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

/* Body / UI — Jost (geometric sans-serif, clean) */
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

/* Accent / Labels — Cinzel (classical Roman caps) for special moments */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&display=swap');
```

### Type Scale

```css
/* Display — Hero headlines, section titles */
.text-display-xl  { font: 300 7rem/1.0  "Cormorant Garamond", serif; letter-spacing: -0.02em; }
.text-display-lg  { font: 300 5rem/1.05 "Cormorant Garamond", serif; letter-spacing: -0.02em; }
.text-display-md  { font: 400 3.5rem/1.1 "Cormorant Garamond", serif; }
.text-display-sm  { font: 400 2.5rem/1.2 "Cormorant Garamond", serif; }

/* Headings — Section titles, product names */
.text-heading-xl  { font: 500 1.875rem/1.2 "Cormorant Garamond", serif; }
.text-heading-lg  { font: 500 1.5rem/1.3  "Cormorant Garamond", serif; }
.text-heading-md  { font: 400 1.25rem/1.4 "Cormorant Garamond", serif; }

/* Body — Product descriptions, UI copy */
.text-body-lg     { font: 300 1.125rem/1.7 "Jost", sans-serif; }
.text-body-md     { font: 300 1rem/1.6    "Jost", sans-serif; }
.text-body-sm     { font: 400 0.875rem/1.5 "Jost", sans-serif; }

/* Labels — Buttons, badges, nav items */
.text-label-lg    { font: 500 0.875rem/1 "Jost", sans-serif; letter-spacing: 0.12em; text-transform: uppercase; }
.text-label-md    { font: 500 0.75rem/1  "Jost", sans-serif; letter-spacing: 0.14em; text-transform: uppercase; }
.text-label-sm    { font: 400 0.6875rem/1 "Cinzel", serif;   letter-spacing: 0.16em; text-transform: uppercase; }

/* Price — Uses tabular nums */
.text-price       { font: 300 1.25rem/1 "Jost", sans-serif; font-variant-numeric: tabular-nums; }
```

---

## Spacing System

The site uses generous spacing. Cramped = cheap.

```
4px   (1)  — Icon padding, tiny gaps
8px   (2)  — Compact element spacing
16px  (4)  — Default element spacing
24px  (6)  — Card padding
32px  (8)  — Section element gaps
48px  (12) — Section padding (mobile)
64px  (16) — Section padding (desktop)
96px  (24) — Large section gaps
128px (32) — Hero padding
```

---

## Component Specifications

### Buttons

```tsx
// Primary CTA — Gold fill
<button className="
  bg-gold-warm text-obsidian 
  px-8 py-3 
  text-label-md tracking-widest uppercase
  border border-gold-warm
  transition-all duration-300
  hover:bg-gold-bright hover:border-gold-bright
  active:bg-gold-deep
  disabled:opacity-40 disabled:cursor-not-allowed
">
  Add to Collection
</button>

// Secondary — Gold outline
<button className="
  bg-transparent text-gold-warm
  px-8 py-3
  text-label-md tracking-widest uppercase
  border border-gold-warm
  transition-all duration-300
  hover:bg-gold-warm hover:text-obsidian
">
  Explore
</button>

// Ghost — Subtle
<button className="
  bg-transparent text-ivory
  px-6 py-2
  text-label-sm tracking-widest
  border border-iron
  transition-all duration-300
  hover:border-gold-antique hover:text-gold-warm
">
  View All
</button>
```

### Product Card

```tsx
<div className="group relative overflow-hidden bg-charcoal">
  {/* Image container */}
  <div className="relative aspect-[3/4] overflow-hidden">
    <Image
      src={product.images[0]}
      alt={product.name}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
    />
    {/* Hover overlay */}
    <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
      <button className="...">Quick View</button>
    </div>
    {/* Badge */}
    {product.isNew && (
      <span className="absolute top-4 left-4 text-label-sm text-gold-warm border border-gold-antique px-3 py-1">
        New
      </span>
    )}
  </div>
  {/* Info */}
  <div className="p-4 space-y-1">
    <p className="text-label-sm text-ash">{product.subcategory}</p>
    <h3 className="text-heading-md text-ivory">{product.name}</h3>
    <p className="text-body-sm text-parchment line-clamp-2">{product.shortDescription}</p>
    <div className="flex items-center justify-between pt-2">
      <span className="text-price text-gold-warm">${formatPrice(product.price)}</span>
      <button className="text-label-sm text-ash hover:text-gold-warm transition-colors">
        Add to Cart →
      </button>
    </div>
  </div>
</div>
```

### Navigation

```
Desktop: Sticky top nav, transparent → dark on scroll
  - Left: FRAVIONT (Cinzel, letter-spaced)
  - Center: PERFUMES | COSMETICS | JEWELRY | COLLECTIONS
  - Right: Search | Account | Cart (0)

Mobile: Hamburger → full-screen dark overlay menu
  - Navigation links stagger in with framer-motion
```

### Input Fields

```css
.input {
  background: transparent;
  border: 1px solid var(--iron);
  color: var(--ivory);
  padding: 12px 16px;
  font: 300 1rem "Jost";
  transition: border-color 200ms;
  outline: none;
}
.input:focus { border-color: var(--gold-antique); }
.input::placeholder { color: var(--ash); }
```

---

## Motion / Animation — GSAP (Primary)

**All animations use GSAP.** Framer Motion is removed. CSS transitions only for micro-states (hover border color, opacity on focus). Everything choreographed is GSAP.

### Installation
```bash
pnpm add gsap @gsap/react
```

> GSAP free tier covers: gsap core, ScrollTrigger, TextPlugin, EasePack.
> No paid Club GSAP plugins needed.

### Setup — Global GSAP Config
```ts
// src/lib/gsap/config.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  gsap.defaults({
    ease: "power3.out",
    duration: 0.9,
  });

  // ScrollTrigger default settings
  ScrollTrigger.defaults({
    toggleActions: "play none none reverse",
    start: "top 88%",
  });
}

export { gsap, ScrollTrigger };
```

```ts
// src/lib/gsap/easings.ts
// Fraviont custom easing vocabulary
export const EASE = {
  luxury:    "power4.out",       // Primary — slow deceleration, feels heavy/refined
  enter:     "power3.out",       // Standard enter animation
  exit:      "power3.in",        // Exit animations
  elastic:   "elastic.out(1,0.4)", // Subtle spring — use sparingly
  text:      "power2.inOut",     // Headline reveals
  gold:      "expo.out",         // Gold shimmer, price reveals
  hover:     "power2.out",       // Hover state transitions (short duration)
} as const;
```

---

### Animation Catalog

#### 1. Page Transitions
```ts
// src/lib/gsap/animations/pageTransition.ts
// Full-screen gold curtain wipe on route change
export function pageEnter(container: HTMLElement) {
  const tl = gsap.timeline();
  tl.set(container, { opacity: 0, y: 40 })
    .to(container, {
      opacity: 1, y: 0,
      duration: 1.0,
      ease: EASE.luxury,
      clearProps: "all",
    });
  return tl;
}

export function pageCurtainIn() {
  // Gold curtain slides down to cover screen
  const curtain = document.getElementById("page-curtain");
  return gsap.to(curtain, {
    scaleY: 1, transformOrigin: "top",
    duration: 0.6, ease: EASE.luxury,
  });
}

export function pageCurtainOut() {
  // Curtain slides up to reveal new page
  const curtain = document.getElementById("page-curtain");
  return gsap.to(curtain, {
    scaleY: 0, transformOrigin: "bottom",
    duration: 0.7, ease: EASE.luxury,
    delay: 0.1,
  });
}
```

#### 2. Hero Section Animation
```ts
// src/lib/gsap/animations/hero.ts
export function animateHero(refs: HeroRefs) {
  const tl = gsap.timeline({ delay: 0.3 });

  // Headline: word-by-word reveal from below clip
  tl.fromTo(refs.headline,
    { y: 80, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
    { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.4, ease: EASE.luxury }
  )
  // Subheadline letter-spacing expand
  .fromTo(refs.subheadline,
    { opacity: 0, letterSpacing: "0.4em" },
    { opacity: 1, letterSpacing: "0.16em",
      duration: 1.1, ease: EASE.text },
    "-=0.7"
  )
  // Gold divider line draws left to right
  .fromTo(refs.divider,
    { scaleX: 0, transformOrigin: "left" },
    { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
    "-=0.5"
  )
  // CTAs fade up with stagger
  .fromTo(refs.ctaButtons,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0,
      duration: 0.7, stagger: 0.15, ease: EASE.enter },
    "-=0.4"
  )
  // Scroll indicator pulse
  .fromTo(refs.scrollIndicator,
    { opacity: 0 },
    { opacity: 0.6, duration: 0.5 },
    "-=0.2"
  );

  return tl;
}
```

#### 3. Scroll-Triggered Section Reveals
```ts
// src/lib/gsap/animations/scrollReveal.ts
export function revealSection(el: HTMLElement, options?: GSAPTweenVars) {
  return gsap.fromTo(el,
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0,
      duration: 1.0,
      ease: EASE.luxury,
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      ...options,
    }
  );
}

export function revealStagger(els: HTMLElement[], options?: GSAPTweenVars) {
  return gsap.fromTo(els,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0,
      duration: 0.85,
      stagger: 0.1,
      ease: EASE.enter,
      scrollTrigger: { trigger: els[0], start: "top 85%" },
      ...options,
    }
  );
}

// Horizontal pin scroll for featured collection
export function horizontalScroll(track: HTMLElement, wrapper: HTMLElement) {
  gsap.to(track, {
    x: () => -(track.scrollWidth - wrapper.offsetWidth),
    ease: "none",
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${track.scrollWidth - wrapper.offsetWidth}`,
      scrub: 1.2,
      pin: true,
    },
  });
}
```

#### 4. Product Card Animations
```ts
// src/lib/gsap/animations/productCard.ts
export function setupCardHover(card: HTMLElement) {
  const image = card.querySelector(".card-image") as HTMLElement;
  const overlay = card.querySelector(".card-overlay") as HTMLElement;
  const info = card.querySelector(".card-info") as HTMLElement;

  const enterTl = gsap.timeline({ paused: true });
  enterTl
    .to(image, { scale: 1.06, duration: 0.7, ease: EASE.hover })
    .to(overlay, { opacity: 1, duration: 0.4, ease: EASE.hover }, "<")
    .to(info, { y: -6, duration: 0.5, ease: EASE.hover }, "<0.1");

  card.addEventListener("mouseenter", () => enterTl.play());
  card.addEventListener("mouseleave", () => enterTl.reverse());
}

// Magnetic button effect for CTAs
export function magneticButton(btn: HTMLElement, strength = 0.4) {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, {
      x: dx * strength, y: dy * strength,
      duration: 0.4, ease: EASE.hover,
    });
  });
  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: EASE.elastic });
  });
}
```

#### 5. Navigation Animations
```ts
// src/lib/gsap/animations/navigation.ts
// Mobile menu open
export function openMobileMenu(overlay: HTMLElement, links: HTMLElement[]) {
  const tl = gsap.timeline();
  tl.to(overlay, { opacity: 1, pointerEvents: "all", duration: 0.4, ease: "power2.out" })
    .fromTo(links,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: EASE.enter },
      "-=0.2"
    );
  return tl;
}

// Nav background on scroll
export function setupNavScroll(nav: HTMLElement) {
  ScrollTrigger.create({
    start: "top -80px",
    end: "max",
    onEnter: () => gsap.to(nav, { backgroundColor: "rgba(17,17,17,0.96)", backdropFilter: "blur(12px)", duration: 0.4 }),
    onLeaveBack: () => gsap.to(nav, { backgroundColor: "transparent", backdropFilter: "blur(0px)", duration: 0.4 }),
  });
}
```

#### 6. Text Effects
```ts
// src/lib/gsap/animations/textEffects.ts

// Character-by-character reveal for product names
export function charReveal(el: HTMLElement) {
  const text = el.textContent || "";
  el.innerHTML = text.split("").map(c =>
    `<span style="display:inline-block;overflow:hidden"><span class="char">${c === " " ? "&nbsp;" : c}</span></span>`
  ).join("");
  
  return gsap.fromTo(el.querySelectorAll(".char"),
    { y: "100%" },
    { y: "0%", duration: 0.6, stagger: 0.025, ease: EASE.luxury }
  );
}

// Gold counter tick-up (for prices / stats)
export function countUp(el: HTMLElement, endValue: number, prefix = "$") {
  return gsap.fromTo(
    { value: 0 },
    { value: endValue,
      duration: 1.4, ease: EASE.gold,
      onUpdate: function() {
        el.textContent = prefix + Math.round(this.targets()[0].value).toLocaleString();
      }
    }
  );
}

// Gradient text shimmer (for gold headings)
export function goldShimmer(el: HTMLElement) {
  gsap.to(el, {
    backgroundPosition: "200% center",
    duration: 2.5,
    ease: "none",
    repeat: -1,
    repeatDelay: 3,
  });
}
```

#### 7. Scent Profile Animation (Perfume Pages)
```ts
// src/lib/gsap/animations/scentProfile.ts
export function animateScentNotes(container: HTMLElement) {
  const rings = container.querySelectorAll(".scent-ring");
  const labels = container.querySelectorAll(".scent-label");

  const tl = gsap.timeline({ scrollTrigger: { trigger: container, start: "top 75%" } });

  // Rings expand outward
  tl.fromTo(rings,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.8, stagger: 0.2, ease: EASE.elastic }
  )
  // Labels fade in after rings
  .fromTo(labels,
    { opacity: 0, x: -10 },
    { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: EASE.enter },
    "-=0.4"
  );
}
```

#### 8. Admin Dashboard Animations
```ts
// src/lib/gsap/animations/admin.ts
// KPI cards count up when dashboard loads
export function animateKPICards(cards: HTMLElement[]) {
  gsap.fromTo(cards,
    { opacity: 0, y: 30, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1,
      duration: 0.6, stagger: 0.1, ease: EASE.enter }
  );
  // Trigger countUp on each value
  cards.forEach(card => {
    const valueEl = card.querySelector(".kpi-value") as HTMLElement;
    const raw = parseFloat(valueEl.dataset.value || "0");
    countUp(valueEl, raw);
  });
}

// Chart draw-on animation (line draws from left)
export function animateChartReveal(chartWrapper: HTMLElement) {
  gsap.fromTo(chartWrapper,
    { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    {
      opacity: 1, clipPath: "inset(0 0% 0 0)",
      duration: 1.2, ease: "power2.inOut",
      scrollTrigger: { trigger: chartWrapper, start: "top 80%" }
    }
  );
}
```

---

### GSAP + React Pattern (useGSAP hook)

```tsx
// Always use useGSAP from @gsap/react for React components
// This handles cleanup automatically — no memory leaks

"use client"
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap/config";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    // GSAP context — scoped to containerRef, auto-cleaned on unmount
    gsap.fromTo(headlineRef.current,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1.4, ease: "power4.out" }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <h1 ref={headlineRef}>The Art of Presence</h1>
    </div>
  );
}
```

---

### Page Curtain (Global)
Add to `src/app/layout.tsx` — gold curtain overlay for page transitions:
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

---

## Skeleton Loading System

**All skeletons must match the exact dimensions of the loaded content** — no layout shift.

### Base Skeleton Style
```css
/* Fraviont luxury skeleton — dark shimmer, not the default light gray */
.skeleton {
  background: linear-gradient(
    90deg,
    #1a1a1a 25%,
    #222222 50%,
    #1a1a1a 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
  border-radius: 0;    /* Luxury — no rounded corners */
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Override shadcn Skeleton
```tsx
// src/components/ui/skeleton.tsx — override the default
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-none bg-graphite",
        // Custom shimmer override via CSS class
        "skeleton",
        className
      )}
      {...props}
    />
  );
}
```

### Skeleton Components (Build These)

```tsx
// src/components/shared/skeletons/ProductCardSkeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="bg-charcoal">
      <Skeleton className="aspect-[3/4] w-full" />   {/* Image */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-16" />             {/* Category label */}
        <Skeleton className="h-6 w-3/4" />            {/* Product name */}
        <Skeleton className="h-4 w-full" />            {/* Description line 1 */}
        <Skeleton className="h-4 w-2/3" />            {/* Description line 2 */}
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-16" />           {/* Price */}
          <Skeleton className="h-5 w-20" />           {/* Add to cart */}
        </div>
      </div>
    </div>
  );
}

// src/components/shared/skeletons/ProductGridSkeleton.tsx
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// src/components/shared/skeletons/ProductDetailSkeleton.tsx
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="space-y-3">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      </div>
      {/* Info */}
      <div className="space-y-5 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3 pt-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-16" />)}
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </div>
  );
}

// src/components/shared/skeletons/KPICardSkeleton.tsx
export function KPICardSkeleton() {
  return (
    <div className="bg-[#171717] border border-iron p-6 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// src/components/shared/skeletons/TableSkeleton.tsx
export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-iron">
        {[...Array(cols)].map((_, i) => <Skeleton key={i} className="h-3 flex-1" />)}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-iron/50">
          {[...Array(cols)].map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" style={{ animationDelay: `${r * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// src/components/shared/skeletons/ChatMessageSkeleton.tsx
export function ChatMessageSkeleton() {
  return (
    <div className="space-y-2 px-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

### Skeleton Usage Pattern
```tsx
// In every Server Component that fetches data — use Suspense + skeleton
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/skeletons/ProductGridSkeleton";

export default function ShopPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={9} />}>
      <ProductGridData />
    </Suspense>
  );
}

// In every Client Component that uses useQuery — check isPending
const { data, isPending } = api.products.getAll.useQuery();
if (isPending) return <ProductGridSkeleton />;
```

---

## Page-Specific Design

### Homepage
```
1. Hero (full-viewport, parallax bg, editorial headline in Cormorant)
2. Category Showcase (3-column grid, dark imagery, Cinzel labels)
3. Featured Collection (asymmetric 2/3 + 1/3 grid)
4. "Our Story" editorial section (full-bleed image + text overlay)
5. Best Sellers (horizontal scroll on mobile, 4-col grid desktop)
6. AI Quiz CTA ("Discover Your Scent" — atmospheric full-width dark panel)
7. Press/As Seen In (minimal logos in ash color)
8. Instagram Gallery (6-grid)
9. Newsletter (minimal, just email input + subscribe)
```

### Product Detail Page
```
1. Breadcrumb (minimal, in ash text)
2. 2-column: Gallery (left, image grid + zoom) | Details (right, sticky)
3. Product name in Cormorant display
4. Scent notes visualization (animated concentric circles for perfumes)
5. Variants (visual swatches or toggle buttons)
6. Add to Cart + Add to Wishlist
7. Expandable sections: Description | Details | Shipping & Returns
8. AI Sophia "Ask About This Product" panel
9. You May Also Love (horizontal scroll)
```

### Shop/Catalog
```
1. Category header with editorial image
2. Filters sidebar (desktop) / filter drawer (mobile)
   - Category, Price range, Scent family, In Stock
3. Product grid (3-col desktop, 2-col tablet, 1-col mobile)
4. Pagination / infinite scroll
5. Sort: Newest | Price ↑↓ | Best Selling | Recommended
```

---

## Anti-Patterns (Never Do)

```
❌ White background pages
❌ Bright, saturated colors (no red CTAs, no blue links)
❌ Rounded pill buttons (use sharp or very slightly rounded)
❌ Drop shadows (use border + background elevation instead)
❌ Gradients (unless very subtle dark-to-dark)
❌ System fonts (Inter, Arial, Roboto)
❌ Crowded layouts with insufficient whitespace
❌ Generic stock photography (should feel editorial/campaign)
❌ Bright success/error toasts (keep them dark with subtle colors)
❌ Bouncy animations or spring physics (keep everything smooth/slow)
```
