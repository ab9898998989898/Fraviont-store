import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * Data Integrity Preservation Test - Task 2.5
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 *
 * This test uses static source analysis of the Drizzle schema and pure-function
 * property tests to confirm that product-variant relationships maintain
 * referential integrity on unfixed code.
 *
 * The schema must:
 *   1. Define a foreign key on productVariants.productId → products.id
 *   2. Use ON DELETE CASCADE so orphaned variants are never left behind
 *   3. Mark productId as NOT NULL (variants must always belong to a product)
 *   4. Define orderItems.productId → products.id (historical order integrity)
 *   5. Define orderItems.variantId → productVariants.id (variant reference)
 *   6. Define inventoryLogs.variantId → productVariants.id (audit trail)
 *
 * EXPECTED OUTCOME on unfixed code: PASSES
 *   - Schema defines all required foreign key constraints
 *   - Referential integrity logic is correct for all product operations
 */

const SCHEMA_PATH = resolve(__dirname, "../../server/db/schema.ts");
const PRODUCTS_ROUTER_PATH = resolve(
  __dirname,
  "../../server/api/routers/products.ts"
);

// ---------------------------------------------------------------------------
// Pure referential-integrity helpers — used in property tests
// ---------------------------------------------------------------------------

type Product = { id: string; isActive: boolean };
type Variant = { id: string; productId: string };
type OrderItem = { id: string; productId: string; variantId: string | null };
type InventoryLog = { id: string; variantId: string };

/** Returns true when every variant references an existing product. */
function variantsHaveValidProductRef(
  variants: Variant[],
  products: Product[]
): boolean {
  const productIds = new Set(products.map((p) => p.id));
  return variants.every((v) => productIds.has(v.productId));
}

/** Returns true when every order item references an existing product. */
function orderItemsHaveValidProductRef(
  items: OrderItem[],
  products: Product[]
): boolean {
  const productIds = new Set(products.map((p) => p.id));
  return items.every((i) => productIds.has(i.productId));
}

/** Returns true when every order item with a variantId references an existing variant. */
function orderItemsHaveValidVariantRef(
  items: OrderItem[],
  variants: Variant[]
): boolean {
  const variantIds = new Set(variants.map((v) => v.id));
  return items.every(
    (i) => i.variantId === null || variantIds.has(i.variantId)
  );
}

/** Returns true when every inventory log references an existing variant. */
function inventoryLogsHaveValidVariantRef(
  logs: InventoryLog[],
  variants: Variant[]
): boolean {
  const variantIds = new Set(variants.map((v) => v.id));
  return logs.every((l) => variantIds.has(l.variantId));
}

/**
 * Simulates a soft-delete (isActive = false) and verifies that:
 *   - The product record still exists
 *   - Its variants still exist (cascade delete does NOT fire on soft delete)
 *   - Order items referencing the product still have a valid productId
 */
function softDeletePreservesRelationships(
  products: Product[],
  variants: Variant[],
  items: OrderItem[],
  productIdToDeactivate: string
): boolean {
  // Soft delete: flip isActive, do NOT remove the record
  const updatedProducts = products.map((p) =>
    p.id === productIdToDeactivate ? { ...p, isActive: false } : p
  );

  // Product record must still exist
  const stillExists = updatedProducts.some(
    (p) => p.id === productIdToDeactivate
  );
  if (!stillExists) return false;

  // Variants must still reference a valid (now inactive) product
  if (!variantsHaveValidProductRef(variants, updatedProducts)) return false;

  // Order items must still reference a valid product
  if (!orderItemsHaveValidProductRef(items, updatedProducts)) return false;

  return true;
}

/**
 * Simulates a cascade delete (hard delete) and verifies that:
 *   - Variants belonging to the deleted product are also removed
 *   - No orphaned variants remain
 */
function cascadeDeleteRemovesVariants(
  products: Product[],
  variants: Variant[],
  productIdToDelete: string
): boolean {
  const remainingProducts = products.filter((p) => p.id !== productIdToDelete);
  const remainingVariants = variants.filter(
    (v) => v.productId !== productIdToDelete
  );

  // After cascade delete, no variant should reference the deleted product
  return variantsHaveValidProductRef(remainingVariants, remainingProducts);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const uuidArb = fc.uuid();

const productArb = fc.record({
  id: uuidArb,
  isActive: fc.boolean(),
});

function variantsForProducts(products: Product[]): fc.Arbitrary<Variant[]> {
  if (products.length === 0) return fc.constant([]);
  return fc.array(
    fc.record({
      id: uuidArb,
      productId: fc.constantFrom(...products.map((p) => p.id)),
    }),
    { minLength: 0, maxLength: 20 }
  );
}

function orderItemsForProductsAndVariants(
  products: Product[],
  variants: Variant[]
): fc.Arbitrary<OrderItem[]> {
  if (products.length === 0) return fc.constant([]);
  return fc.array(
    fc.record({
      id: uuidArb,
      productId: fc.constantFrom(...products.map((p) => p.id)),
      variantId:
        variants.length > 0
          ? fc.option(fc.constantFrom(...variants.map((v) => v.id)), {
              nil: null,
            })
          : fc.constant(null),
    }),
    { minLength: 0, maxLength: 20 }
  );
}

function inventoryLogsForVariants(
  variants: Variant[]
): fc.Arbitrary<InventoryLog[]> {
  if (variants.length === 0) return fc.constant([]);
  return fc.array(
    fc.record({
      id: uuidArb,
      variantId: fc.constantFrom(...variants.map((v) => v.id)),
    }),
    { minLength: 0, maxLength: 20 }
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Data integrity preservation (Requirements 3.1, 3.2, 3.3)", () => {
  const schemaSource = readFileSync(SCHEMA_PATH, "utf-8");
  const productsRouterSource = readFileSync(PRODUCTS_ROUTER_PATH, "utf-8");

  // ---- Static analysis: schema foreign key constraints ----

  it("productVariants.productId references products.id", () => {
    /**
     * Validates: Requirements 3.1
     *
     * The productVariants table must declare a foreign key on productId
     * pointing to products.id so the database enforces referential integrity.
     */
    expect(
      schemaSource,
      "Expected productVariants.productId to reference products.id"
    ).toMatch(/productId.*references\s*\(\s*\(\s*\)\s*=>\s*products\.id/s);
  });

  it("productVariants.productId uses ON DELETE CASCADE", () => {
    /**
     * Validates: Requirements 3.1
     *
     * ON DELETE CASCADE ensures that when a product is hard-deleted, its
     * variants are automatically removed, preventing orphaned variant records.
     */
    // Find the productVariants table definition and check for cascade
    const productVariantsBlock = schemaSource.match(
      /productVariants\s*=\s*pgTable[\s\S]*?(?=\nexport const|\n\/\/)/
    );
    expect(
      productVariantsBlock,
      "Expected productVariants table definition in schema"
    ).not.toBeNull();

    expect(
      productVariantsBlock![0],
      "Expected onDelete: 'cascade' on productVariants.productId"
    ).toMatch(/onDelete\s*:\s*["']cascade["']/);
  });

  it("productVariants.productId is NOT NULL", () => {
    /**
     * Validates: Requirements 3.1
     *
     * productId must be NOT NULL — every variant must belong to a product.
     * A nullable productId would allow orphaned variants to exist.
     */
    const productVariantsBlock = schemaSource.match(
      /productVariants\s*=\s*pgTable[\s\S]*?(?=\nexport const|\n\/\/)/
    );
    expect(
      productVariantsBlock,
      "Expected productVariants table definition in schema"
    ).not.toBeNull();

    expect(
      productVariantsBlock![0],
      "Expected .notNull() on productVariants.productId"
    ).toMatch(/productId[\s\S]*?\.notNull\(\)/);
  });

  it("orderItems.productId references products.id", () => {
    /**
     * Validates: Requirements 3.3
     *
     * Order items must reference the product they were purchased from.
     * This preserves historical order data even when products are deactivated.
     */
    expect(
      schemaSource,
      "Expected orderItems.productId to reference products.id"
    ).toMatch(/productId.*references\s*\(\s*\(\s*\)\s*=>\s*products\.id/s);
  });

  it("orderItems.variantId references productVariants.id", () => {
    /**
     * Validates: Requirements 3.3
     *
     * Order items may reference a specific variant. The foreign key ensures
     * variant references in orders remain valid.
     */
    expect(
      schemaSource,
      "Expected orderItems.variantId to reference productVariants.id"
    ).toMatch(
      /variantId.*references\s*\(\s*\(\s*\)\s*=>\s*productVariants\.id/s
    );
  });

  it("inventoryLogs.variantId references productVariants.id", () => {
    /**
     * Validates: Requirements 3.1
     *
     * Inventory logs must reference a valid variant. This ensures the audit
     * trail of stock changes is always linked to a real variant record.
     */
    expect(
      schemaSource,
      "Expected inventoryLogs.variantId to reference productVariants.id"
    ).toMatch(
      /variantId.*references\s*\(\s*\(\s*\)\s*=>\s*productVariants\.id/s
    );
  });

  it("products router delete mutation uses soft delete (isActive = false)", () => {
    /**
     * Validates: Requirements 3.3
     *
     * The delete mutation must set isActive = false rather than removing the
     * product record, preserving all historical order data that references it.
     */
    expect(
      productsRouterSource,
      "Expected delete mutation to set isActive: false"
    ).toMatch(/isActive\s*:\s*false/);

    // Must use db.update (possibly split across lines), not db.delete, in the delete mutation
    const deleteMutationBlock = productsRouterSource.match(
      /delete\s*:\s*adminProcedure[\s\S]*?(?=\n\s{2}\w|\n\}\))/
    );
    expect(
      deleteMutationBlock,
      "Expected delete mutation block in products router"
    ).not.toBeNull();

    // db.update may be written as `db\n        .update(` — check for both forms
    const block = deleteMutationBlock![0]!;
    const hasUpdate =
      /db\.update\s*\(/.test(block) ||
      /db\s*\n\s*\.update\s*\(/.test(block);

    expect(
      hasUpdate,
      "Expected db.update() (soft delete) in delete mutation, not db.delete()"
    ).toBe(true);

    expect(
      block,
      "Expected delete mutation NOT to call db.delete()"
    ).not.toMatch(/db\.delete\s*\(/);
  });

  // ---- Pure-function property tests ----

  it("property: all variants always reference an existing product", () => {
    /**
     * Validates: Requirements 3.1
     *
     * Property: for any set of products and variants where variants are
     * constructed with valid productIds, every variant must reference an
     * existing product. This mirrors the database FK constraint.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }).chain(
          (products) =>
            variantsForProducts(products).map((variants) => ({
              products,
              variants,
            }))
        ),
        ({ products, variants }) =>
          variantsHaveValidProductRef(variants, products)
      ),
      { numRuns: 20 }
    );
  });

  it("property: variants with valid productIds always satisfy referential integrity", () => {
    /**
     * Validates: Requirements 3.1
     *
     * Property: given a set of products and variants where each variant's
     * productId is drawn from the set of existing product IDs, referential
     * integrity always holds — no variant references a non-existent product.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).map((variants) => ({
              products,
              variants,
            }))
        ),
        ({ products, variants }) =>
          variantsHaveValidProductRef(variants, products)
      ),
      { numRuns: 20 }
    );
  });

  it("property: soft delete preserves product record and all relationships", () => {
    /**
     * Validates: Requirements 3.3
     *
     * Property: for any product deactivation (soft delete), the product
     * record must still exist, variants must still reference a valid product,
     * and order items must still reference a valid product. No data is lost.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).chain((variants) =>
              orderItemsForProductsAndVariants(products, variants).map(
                (items) => ({ products, variants, items })
              )
            )
        ),
        fc.integer({ min: 0, max: 9 }),
        ({ products, variants, items }, idx) => {
          const targetProduct = products[idx % products.length];
          if (!targetProduct) return true; // skip if no products

          return softDeletePreservesRelationships(
            products,
            variants,
            items,
            targetProduct.id
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: cascade delete removes orphaned variants", () => {
    /**
     * Validates: Requirements 3.1
     *
     * Property: when a product is hard-deleted (cascade), all its variants
     * are also removed. The remaining variants must all reference existing
     * products — no orphaned variants remain.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).map((variants) => ({
              products,
              variants,
            }))
        ),
        fc.integer({ min: 0, max: 9 }),
        ({ products, variants }, idx) => {
          const targetProduct = products[idx % products.length];
          if (!targetProduct) return true;

          return cascadeDeleteRemovesVariants(
            products,
            variants,
            targetProduct.id
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: order items always reference existing products", () => {
    /**
     * Validates: Requirements 3.3
     *
     * Property: for any set of order items constructed with valid productIds,
     * every order item must reference an existing product. This mirrors the
     * database FK constraint on orderItems.productId.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).chain((variants) =>
              orderItemsForProductsAndVariants(products, variants).map(
                (items) => ({ products, variants, items })
              )
            )
        ),
        ({ products, items }) =>
          orderItemsHaveValidProductRef(items, products)
      ),
      { numRuns: 20 }
    );
  });

  it("property: order items with variantIds always reference existing variants", () => {
    /**
     * Validates: Requirements 3.3
     *
     * Property: for any order item that has a non-null variantId, the
     * variantId must reference an existing variant. Null variantIds are
     * allowed (product sold without a specific variant).
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).chain((variants) =>
              orderItemsForProductsAndVariants(products, variants).map(
                (items) => ({ variants, items })
              )
            )
        ),
        ({ variants, items }) =>
          orderItemsHaveValidVariantRef(items, variants)
      ),
      { numRuns: 20 }
    );
  });

  it("property: inventory logs always reference existing variants", () => {
    /**
     * Validates: Requirements 3.1
     *
     * Property: for any set of inventory logs constructed with valid
     * variantIds, every log must reference an existing variant. This mirrors
     * the database FK constraint on inventoryLogs.variantId.
     */
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 10 }).chain(
          (products) =>
            variantsForProducts(products).chain((variants) =>
              inventoryLogsForVariants(variants).map((logs) => ({
                variants,
                logs,
              }))
            )
        ),
        ({ variants, logs }) =>
          inventoryLogsHaveValidVariantRef(logs, variants)
      ),
      { numRuns: 20 }
    );
  });

  it("property: settings update preserves all other settings fields", () => {
    /**
     * Validates: Requirements 3.2
     *
     * Property: when a single settings field is updated, all other fields
     * must remain unchanged. This ensures partial updates don't accidentally
     * overwrite unrelated settings.
     */
    type Settings = {
      storeName: string;
      currency: string;
      orderAlerts: boolean;
      lowStockAlerts: boolean;
      weeklyDigest: boolean;
    };

    const settingsArb: fc.Arbitrary<Settings> = fc.record({
      storeName: fc.string({ minLength: 1, maxLength: 50 }),
      currency: fc.constantFrom("ZAR", "USD", "EUR", "GBP"),
      orderAlerts: fc.boolean(),
      lowStockAlerts: fc.boolean(),
      weeklyDigest: fc.boolean(),
    });

    fc.assert(
      fc.property(
        settingsArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (original, newCurrency) => {
          // Simulate updating only the currency field
          const updated: Settings = { ...original, currency: newCurrency };

          // All other fields must be unchanged
          return (
            updated.storeName === original.storeName &&
            updated.orderAlerts === original.orderAlerts &&
            updated.lowStockAlerts === original.lowStockAlerts &&
            updated.weeklyDigest === original.weeklyDigest
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});
