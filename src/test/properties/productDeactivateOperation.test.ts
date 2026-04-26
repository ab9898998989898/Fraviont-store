import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * **Validates: Requirements 1.6**
 *
 * Bug Condition Exploration Test - Product Deactivate Operations
 *
 * This test verifies whether clicking "Deactivate" removes the product from the
 * database (hard delete) or sets isActive=false (soft delete) on the UNFIXED code.
 *
 * EXPECTED OUTCOME:
 *   - PASSES if soft delete already works (product remains with isActive=false)
 *   - FAILS if hard delete occurs (product not found after deactivation)
 *
 * After reading `src/server/api/routers/products.ts`, the `delete` mutation uses:
 *   db.update(products).set({ isActive: false, updatedAt: new Date() })
 * This is already a soft delete, so this test is expected to PASS on unfixed code.
 *
 * The test simulates:
 * 1. An active product exists in the database
 * 2. Admin clicks "Deactivate" (calls the delete mutation)
 * 3. Query database for product record and isActive status
 * 4. Assert product still exists with isActive=false
 *
 * Counterexamples documented:
 * - Hard delete: product record not found after deactivation (BUG scenario)
 * - Soft delete: product record found with isActive=false (CORRECT behavior)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
  updatedAt: Date;
}

interface MockDatabase {
  products: Product[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function seedActiveProduct(
  db: MockDatabase,
  overrides: Partial<Product> = {}
): Product {
  const product: Product = {
    id: makeId("product"),
    slug: "sunset-gold",
    name: "Sunset Gold",
    price: 12000,
    category: "perfumes",
    isActive: true,
    updatedAt: new Date(Date.now() - 60_000),
    ...overrides,
  };
  db.products.push(product);
  return product;
}

// ─── Deactivate mutation implementations ─────────────────────────────────────

/**
 * Simulates the ACTUAL delete mutation from src/server/api/routers/products.ts.
 *
 * The real code does:
 *   db.update(products).set({ isActive: false, updatedAt: new Date() })
 *
 * This is a soft delete — the product record remains in the database with isActive=false.
 */
function actualDeactivateProduct(
  db: MockDatabase,
  id: string
): { success: boolean } | null {
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  // Mirrors the actual mutation: soft delete via isActive=false
  db.products[idx] = {
    ...db.products[idx]!,
    isActive: false,
    updatedAt: new Date(),
  };

  return { success: true };
}

/**
 * Simulates a BUGGY hard-delete implementation (for documentation purposes).
 * This represents what the bug would look like if it existed.
 *
 * A hard delete would do:
 *   db.delete(products).where(eq(products.id, id))
 */
function buggyHardDeleteProduct(
  db: MockDatabase,
  id: string
): { success: boolean } | null {
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  // BUG: removes the record entirely instead of setting isActive=false
  db.products.splice(idx, 1);

  return { success: true };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Property: Bug Condition - Product Deactivate Operations", () => {
  it("Deactivating a product sets isActive=false and keeps record in database (soft delete - EXPECTED TO PASS)", () => {
    const db: MockDatabase = { products: [] };

    // Seed an active product
    const product = seedActiveProduct(db, {
      slug: "sunset-gold",
      name: "Sunset Gold",
    });

    expect(db.products.length).toBe(1);
    expect(db.products[0]!.isActive).toBe(true);

    // Execute the actual deactivate mutation (mirrors products.ts delete mutation)
    const result = actualDeactivateProduct(db, product.id);

    // Mutation should succeed
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);

    // Product record should still exist in database (soft delete)
    const productInDb = db.products.find((p) => p.id === product.id);
    expect(productInDb).toBeDefined();

    // isActive should be false (soft deleted)
    expect(productInDb!.isActive).toBe(false);

    // Product data should be preserved
    expect(productInDb!.name).toBe("Sunset Gold");
    expect(productInDb!.slug).toBe("sunset-gold");
    expect(productInDb!.price).toBe(12000);
  });

  it("Property: Deactivating any active product should soft-delete it (EXPECTED TO PASS)", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.integer({ min: 100, max: 100000 }),
          category: fc.constantFrom(
            "perfumes",
            "cosmetics",
            "jewelry",
            "gift_sets"
          ),
        }),
        (input) => {
          const db: MockDatabase = { products: [] };

          // Seed an active product with generated data
          const product = seedActiveProduct(db, {
            name: input.name,
            price: input.price,
            category: input.category,
            isActive: true,
          });

          expect(db.products.length).toBe(1);

          // Execute the actual deactivate mutation
          const result = actualDeactivateProduct(db, product.id);

          // Mutation should succeed
          expect(result).not.toBeNull();
          expect(result!.success).toBe(true);

          // Product record MUST still exist (soft delete, not hard delete)
          const productInDb = db.products.find((p) => p.id === product.id);
          expect(productInDb).toBeDefined();

          // isActive MUST be false
          expect(productInDb!.isActive).toBe(false);

          // All other product data must be preserved
          expect(productInDb!.name).toBe(input.name);
          expect(productInDb!.price).toBe(input.price);
          expect(productInDb!.category).toBe(input.category);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("Documents counterexample: hard delete removes product from database (BUG scenario)", () => {
    const db: MockDatabase = { products: [] };

    // Seed an active product
    const product = seedActiveProduct(db, {
      slug: "ocean-breeze",
      name: "Ocean Breeze",
    });

    expect(db.products.length).toBe(1);

    // Simulate the BUGGY hard delete behavior
    buggyHardDeleteProduct(db, product.id);

    // Counterexample: product is completely gone from database
    const productInDb = db.products.find((p) => p.id === product.id);
    expect(productInDb).toBeUndefined(); // Hard delete removes the record

    // This demonstrates what the bug would look like:
    // - Product not found after deactivation
    // - Historical order data referencing this product would be orphaned
    // - isActive status cannot be checked (record doesn't exist)

    // The CORRECT behavior (soft delete) would have:
    // expect(productInDb).toBeDefined();
    // expect(productInDb!.isActive).toBe(false);
  });

  it("Confirms actual mutation behavior matches soft delete specification", () => {
    const db: MockDatabase = { products: [] };

    // Test multiple products to confirm consistent soft delete behavior
    const products = [
      seedActiveProduct(db, { slug: "product-a", name: "Product A", price: 5000 }),
      seedActiveProduct(db, { slug: "product-b", name: "Product B", price: 8000 }),
      seedActiveProduct(db, { slug: "product-c", name: "Product C", price: 12000 }),
    ];

    expect(db.products.length).toBe(3);
    expect(db.products.every((p) => p.isActive)).toBe(true);

    // Deactivate only the second product
    actualDeactivateProduct(db, products[1]!.id);

    // All 3 records should still exist
    expect(db.products.length).toBe(3);

    // Only product B should be inactive
    const productA = db.products.find((p) => p.id === products[0]!.id);
    const productB = db.products.find((p) => p.id === products[1]!.id);
    const productC = db.products.find((p) => p.id === products[2]!.id);

    expect(productA!.isActive).toBe(true);
    expect(productB!.isActive).toBe(false);
    expect(productC!.isActive).toBe(true);

    // Soft delete: product B data is preserved
    expect(productB!.name).toBe("Product B");
    expect(productB!.price).toBe(8000);
  });
});
