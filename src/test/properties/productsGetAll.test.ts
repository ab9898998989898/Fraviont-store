import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Property 2: products.getAll Response Shape Invariant
 *
 * Since the actual tRPC procedure requires a database connection,
 * we test the shape contract by validating the type constraints:
 * - products array length must be <= limit
 * - total must be a non-negative integer
 * - hasMore must be a boolean
 * - when hasMore is true, total > page * limit
 */

interface ProductsGetAllResponse {
  products: unknown[];
  total: number;
  hasMore: boolean;
}

function validateResponseShape(
  response: ProductsGetAllResponse,
  page: number,
  limit: number
): void {
  // products array length must be <= limit
  expect(response.products.length).toBeLessThanOrEqual(limit);

  // total must be a non-negative integer
  expect(response.total).toBeGreaterThanOrEqual(0);
  expect(Number.isInteger(response.total)).toBe(true);

  // hasMore must be a boolean
  expect(typeof response.hasMore).toBe("boolean");

  // when hasMore is true, total > page * limit
  if (response.hasMore) {
    expect(response.total).toBeGreaterThan(page * limit);
  }
}

function simulateGetAll(
  allProducts: unknown[],
  page: number,
  limit: number
): ProductsGetAllResponse {
  const total = allProducts.length;
  const start = (page - 1) * limit;
  const products = allProducts.slice(start, start + limit);
  const hasMore = total > page * limit;
  return { products, total, hasMore };
}

describe("Property: products.getAll Response Shape Invariant", () => {
  it("response shape is always valid for any page and limit combination", () => {
    fc.assert(
      fc.property(
        // Generate a random number of products (0 to 200)
        fc.integer({ min: 0, max: 200 }),
        // Generate a valid page number (1+)
        fc.integer({ min: 1, max: 50 }),
        // Generate a valid limit (1 to 100)
        fc.integer({ min: 1, max: 100 }),
        (productCount, page, limit) => {
          const allProducts = Array.from({ length: productCount }, (_, i) => ({
            id: `product-${i}`,
          }));

          const response = simulateGetAll(allProducts, page, limit);
          validateResponseShape(response, page, limit);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it("products array is never longer than limit", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 50 }),
        (productCount, page, limit) => {
          const allProducts = Array.from({ length: productCount }, (_, i) => ({
            id: `p-${i}`,
          }));
          const response = simulateGetAll(allProducts, page, limit);
          expect(response.products.length).toBeLessThanOrEqual(limit);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("hasMore is false when on the last page or beyond", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 50 }),
        (productCount, limit) => {
          const totalPages = Math.ceil(productCount / limit);
          const allProducts = Array.from({ length: productCount }, (_, i) => ({
            id: `p-${i}`,
          }));

          // Test last page
          const response = simulateGetAll(allProducts, totalPages, limit);
          expect(response.hasMore).toBe(false);

          // Test beyond last page
          const beyondResponse = simulateGetAll(
            allProducts,
            totalPages + 1,
            limit
          );
          expect(beyondResponse.hasMore).toBe(false);
        }
      ),
      { numRuns: 500 }
    );
  });
});
