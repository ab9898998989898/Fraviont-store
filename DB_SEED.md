# 🌱 FRAVIONT — Database Seed Guide

> How to seed your Neon database with initial data for development and production.

---

## Seed File Location

```
src/server/db/seed.ts
```

Run with:
```bash
pnpm db:seed
```

Add to package.json:
```json
"db:seed": "tsx src/server/db/seed.ts"
```

Install tsx:
```bash
pnpm add -D tsx
```

---

## Full Seed File

```ts
// src/server/db/seed.ts
import { db } from "./index";
import { products, productVariants, customers } from "./schema";
import { generateOrderNumber } from "@/lib/utils";

async function seed() {
  console.log("🌱 Seeding Fraviont database...");

  // ─────────────────────────────────────────
  // 1. PERFUMES
  // ─────────────────────────────────────────
  const [oud] = await db.insert(products).values({
    slug: "fraviont-oud-noir",
    name: "Oud Noir",
    description: "A dark, resinous journey through ancient Arabian souks. Smoked oud meets velvety rose.",
    aiDescription: null,
    price: 28500,           // R285.00
    compareAtPrice: 34000,
    category: "perfumes",
    subcategory: "EDP",
    images: ["/placeholder/oud-noir-1.jpg", "/placeholder/oud-noir-2.jpg"],
    tags: ["woody", "oriental", "dark", "bestseller"],
    ingredients: "Alcohol Denat., Fragrance (Parfum), Aqua",
    scentNotes: {
      top: ["Black pepper", "Bergamot"],
      middle: ["Bulgarian rose", "Oud wood"],
      base: ["Sandalwood", "Ambergris", "Musk"]
    },
    isActive: true,
    isFeatured: true,
  }).returning();

  await db.insert(productVariants).values([
    { productId: oud.id, sku: "FRV-OUD-50", name: "50ml", price: 28500, stock: 24, lowStockThreshold: 8 },
    { productId: oud.id, sku: "FRV-OUD-100", name: "100ml", price: 44500, stock: 15, lowStockThreshold: 5 },
    { productId: oud.id, sku: "FRV-OUD-200", name: "200ml", price: 68000, stock: 6, lowStockThreshold: 3 },
  ]);

  const [roseAbsolu] = await db.insert(products).values({
    slug: "fraviont-rose-absolu",
    name: "Rose Absolu",
    description: "Bulgarian rose in its purest expression. Soft, powdery, impossibly feminine.",
    price: 24500,
    category: "perfumes",
    subcategory: "EDP",
    images: ["/placeholder/rose-absolu-1.jpg"],
    tags: ["floral", "romantic", "feminine"],
    scentNotes: {
      top: ["Lychee", "Peach"],
      middle: ["Bulgarian rose", "Peony", "Magnolia"],
      base: ["White musk", "Cedarwood", "Cashmeran"]
    },
    isActive: true,
    isFeatured: true,
  }).returning();

  await db.insert(productVariants).values([
    { productId: roseAbsolu.id, sku: "FRV-RSA-50", name: "50ml", price: 24500, stock: 32, lowStockThreshold: 8 },
    { productId: roseAbsolu.id, sku: "FRV-RSA-100", name: "100ml", price: 38000, stock: 18, lowStockThreshold: 5 },
  ]);

  const [vetiver] = await db.insert(products).values({
    slug: "fraviont-vetiver-fumee",
    name: "Vétiver Fumée",
    description: "Rain-soaked earth. Cold smoke. The scent of solitude in the most beautiful sense.",
    price: 26000,
    category: "perfumes",
    subcategory: "Parfum",
    images: ["/placeholder/vetiver-1.jpg"],
    tags: ["earthy", "smoky", "unisex", "new-arrival"],
    scentNotes: {
      top: ["Grapefruit", "Cardamom"],
      middle: ["Vetiver", "Smoked birch"],
      base: ["Labdanum", "Leather", "Oakmoss"]
    },
    isActive: true,
    isFeatured: false,
  }).returning();

  await db.insert(productVariants).values([
    { productId: vetiver.id, sku: "FRV-VET-50", name: "50ml", price: 26000, stock: 3, lowStockThreshold: 8 },
  ]);
  // ^ This will show as LOW STOCK in admin — good for testing alerts

  // ─────────────────────────────────────────
  // 2. COSMETICS
  // ─────────────────────────────────────────
  const [goldSerum] = await db.insert(products).values({
    slug: "fraviont-radiance-gold-serum",
    name: "Radiance Gold Serum",
    description: "24k gold colloidal suspended in a squalane base. Luminosity that speaks for itself.",
    price: 189500,
    category: "cosmetics",
    subcategory: "Serum",
    images: ["/placeholder/gold-serum-1.jpg"],
    tags: ["skincare", "luxury", "anti-aging"],
    ingredients: "Aqua, Squalane, Colloidal Gold (24k), Niacinamide, Hyaluronic Acid, Peptide Complex",
    isActive: true,
    isFeatured: true,
  }).returning();

  await db.insert(productVariants).values([
    { productId: goldSerum.id, sku: "FRV-GS-30", name: "30ml", price: 189500, stock: 12, lowStockThreshold: 5 },
  ]);

  const [lipElixir] = await db.insert(products).values({
    slug: "fraviont-velvet-lip-elixir",
    name: "Velvet Lip Elixir",
    description: "The lip colour that survives everything. Ultra-pigmented. Featherweight.",
    price: 52000,
    category: "cosmetics",
    subcategory: "Lip Colour",
    images: ["/placeholder/lip-elixir-1.jpg"],
    tags: ["makeup", "lip", "bestseller"],
    isActive: true,
    isFeatured: false,
  }).returning();

  await db.insert(productVariants).values([
    { productId: lipElixir.id, sku: "FRV-LIP-001", name: "Obsidian", price: 52000, stock: 20 },
    { productId: lipElixir.id, sku: "FRV-LIP-002", name: "Crimson Ritual", price: 52000, stock: 18 },
    { productId: lipElixir.id, sku: "FRV-LIP-003", name: "Bare Luxury", price: 52000, stock: 25 },
    { productId: lipElixir.id, sku: "FRV-LIP-004", name: "Bordeaux", price: 52000, stock: 14 },
  ]);

  // ─────────────────────────────────────────
  // 3. JEWELRY
  // ─────────────────────────────────────────
  const [coilNecklace] = await db.insert(products).values({
    slug: "fraviont-serpent-coil-necklace",
    name: "Serpent Coil Necklace",
    description: "18k gold vermeil. A single fluid coil that catches light like nothing else.",
    price: 425000,
    category: "jewelry",
    subcategory: "Necklaces",
    images: ["/placeholder/necklace-1.jpg", "/placeholder/necklace-2.jpg"],
    tags: ["gold", "statement", "necklace", "bestseller"],
    isActive: true,
    isFeatured: true,
  }).returning();

  await db.insert(productVariants).values([
    { productId: coilNecklace.id, sku: "FRV-NC-GLD", name: "18k Gold Vermeil", price: 425000, stock: 8, lowStockThreshold: 3, weight: 45 },
    { productId: coilNecklace.id, sku: "FRV-NC-SLV", name: "Sterling Silver", price: 285000, stock: 11, lowStockThreshold: 3, weight: 45 },
  ]);

  const [hoopEarrings] = await db.insert(products).values({
    slug: "fraviont-arc-hoop-earrings",
    name: "Arc Hoop Earrings",
    description: "Architectural precision in 14k gold. Minimal. Magnetic.",
    price: 195000,
    category: "jewelry",
    subcategory: "Earrings",
    images: ["/placeholder/earrings-1.jpg"],
    tags: ["gold", "minimal", "everyday", "new-arrival"],
    isActive: true,
    isFeatured: false,
  }).returning();

  await db.insert(productVariants).values([
    { productId: hoopEarrings.id, sku: "FRV-EAR-SM", name: "Small (25mm)", price: 195000, stock: 16, weight: 12 },
    { productId: hoopEarrings.id, sku: "FRV-EAR-LG", name: "Large (45mm)", price: 245000, stock: 9, weight: 18 },
  ]);

  // ─────────────────────────────────────────
  // 4. GIFT SETS
  // ─────────────────────────────────────────
  const [giftSet] = await db.insert(products).values({
    slug: "fraviont-discovery-collection",
    name: "Discovery Collection",
    description: "Five iconic Fraviont fragrances in 10ml travel sizes. The complete olfactory journey.",
    price: 89500,
    compareAtPrice: 124000,
    category: "gift_sets",
    subcategory: "Fragrance Sets",
    images: ["/placeholder/gift-set-1.jpg"],
    tags: ["gift", "travel", "discovery", "bestseller"],
    isActive: true,
    isFeatured: true,
  }).returning();

  await db.insert(productVariants).values([
    { productId: giftSet.id, sku: "FRV-DISC-SET", name: "Discovery Set (5 × 10ml)", price: 89500, stock: 22 },
  ]);

  // ─────────────────────────────────────────
  // 5. SEED ADMIN USER (manual — do after running seed)
  // ─────────────────────────────────────────
  // NOTE: You cannot directly seed users via NextAuth DrizzleAdapter here
  // because passwords are not used — auth is magic link / OAuth only.
  //
  // TO CREATE AN ADMIN USER:
  // 1. Sign in normally via Google or email magic link on your deployed site
  // 2. Then run this SQL directly on Neon:
  //    UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
  //
  // OR run via Drizzle Studio: pnpm db:studio → users table → edit role

  console.log("✅ Seed complete!");
  console.log("   Products: 8 created across all categories");
  console.log("   Variants: 20+ created");
  console.log("   Low stock alert: Vétiver Fumée 50ml has only 3 units (threshold: 8)");
  console.log("");
  console.log("⚠️  ADMIN USER: Sign in first, then run:");
  console.log(`   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`);

  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
```

---

## Resetting the Database (Dev Only)

To wipe all data and re-seed:
```bash
# Drop all tables (Neon dev branch only!)
pnpm db:push --force

# Re-seed
pnpm db:seed
```

---

## Promoting to Admin

After first sign-in on any environment, run this SQL via Neon console or `pnpm db:studio`:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

Then sign out and sign back in — the session will reflect the new role.

---

## Production Data Notes

- Never run `pnpm db:seed` against the production database
- Production data is managed entirely through `/admin`
- To add the first admin on production: run the SQL UPDATE above via Neon's SQL editor on the production branch
- All prices are in **ZAR cents** (South African Rand × 100)
  - R285.00 → stored as `28500`
  - R1,895.00 → stored as `189500`
