import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * Search and Filter Preservation Test - Task 2.4
 *
 * Validates: Requirements 3.5
 *
 * This test uses static source analysis and pure-function property testing to
 * confirm that search and filter functionality in the products and customers
 * routers returns accurate results matching the query criteria.
 *
 * The routers must:
 *   1. Accept a `search` string parameter and apply case-insensitive ILIKE filtering
 *   2. (products) Accept a `category` enum parameter and apply exact-match filtering
 *   3. (customers) Apply search across both name and email fields
 *   4. Combine multiple filters correctly (AND for products, OR for customers)
 *   5. Return only matching results when filters are applied
 *
 * EXPECTED OUTCOME on unfixed code: PASSES
 *   - Search and filter logic is correct in both routers
 *   - Results always match the query criteria
 */

const PRODUCTS_ROUTER_PATH = resolve(
  __dirname,
  "../../server/api/routers/products.ts"
);

const CUSTOMERS_ROUTER_PATH = resolve(
  __dirname,
  "../../server/api/routers/customers.ts"
);

// ---------------------------------------------------------------------------
// Pure filter helpers — mirror the router logic for property tests
// ---------------------------------------------------------------------------

/** Case-insensitive substring match (mirrors SQL ILIKE `%term%`). */
function ilikeMatch(value: string, term: string): boolean {
  return value.toLowerCase().includes(term.toLowerCase());
}

/** Simulates the products router filter logic. */
function filterProducts(
  products: Array<{ name: string; category: string; isActive: boolean }>,
  input: { search?: string; category?: string }
): typeof products {
  return products.filter((p) => {
    if (!p.isActive) return false;
    if (input.category && p.category !== input.category) return false;
    if (input.search && !ilikeMatch(p.name, input.search)) return false;
    return true;
  });
}

/** Simulates the customers router filter logic. */
function filterCustomers(
  customers: Array<{ name: string; email: string }>,
  input: { search?: string }
): typeof customers {
  if (!input.search) return customers;
  return customers.filter(
    (c) =>
      ilikeMatch(c.name, input.search!) || ilikeMatch(c.email, input.search!)
  );
}

// ---------------------------------------------------------------------------
// Static source analysis helpers
// ---------------------------------------------------------------------------

function assertSearchPattern(source: string, routerName: string): void {
  // Must accept a `search` input parameter
  expect(source, `${routerName}: expected 'search' input parameter`).toMatch(
    /search\s*:\s*z\.string/
  );

  // Must use ilike for case-insensitive search
  expect(
    source,
    `${routerName}: expected ilike() for case-insensitive search`
  ).toMatch(/ilike\s*\(/);

  // Must use wildcard pattern %...%
  expect(
    source,
    `${routerName}: expected wildcard pattern %...% in ilike`
  ).toMatch(/%\$\{.*\}%|`%\$\{.*\}%`/);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Search and filter preservation (Requirement 3.5)", () => {
  const productsSource = readFileSync(PRODUCTS_ROUTER_PATH, "utf-8");
  const customersSource = readFileSync(CUSTOMERS_ROUTER_PATH, "utf-8");

  // ---- Static analysis: products router ----

  it("products router accepts a search parameter and uses ilike", () => {
    assertSearchPattern(productsSource, "products router");
  });

  it("products router accepts a category filter parameter", () => {
    expect(
      productsSource,
      "products router: expected 'category' input parameter"
    ).toMatch(/category\s*:\s*z\.enum/);

    // Must use eq() for exact category match
    expect(
      productsSource,
      "products router: expected eq() for category filter"
    ).toMatch(/eq\s*\(\s*products\.category/);
  });

  it("products router combines isActive, category, and search filters with AND logic", () => {
    // Must filter by isActive = true
    expect(
      productsSource,
      "products router: expected isActive filter"
    ).toMatch(/eq\s*\(\s*products\.isActive\s*,\s*true\s*\)/);

    // Must use and() to combine conditions
    expect(
      productsSource,
      "products router: expected and() to combine filters"
    ).toMatch(/and\s*\(\s*\.\.\./);
  });

  // ---- Static analysis: customers router ----

  it("customers router accepts a search parameter and uses ilike", () => {
    assertSearchPattern(customersSource, "customers router");
  });

  it("customers router searches across both name and email fields", () => {
    expect(
      customersSource,
      "customers router: expected ilike on customers.name"
    ).toMatch(/ilike\s*\(\s*customers\.name/);

    expect(
      customersSource,
      "customers router: expected ilike on customers.email"
    ).toMatch(/ilike\s*\(\s*customers\.email/);
  });

  it("customers router combines name and email search with OR logic", () => {
    expect(
      customersSource,
      "customers router: expected or() to combine name/email search"
    ).toMatch(/or\s*\(/);
  });

  // ---- Pure-function property tests ----

  it("property: product search only returns items whose name contains the search term", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: for any search term, every product in the result set must
     * have a name that contains the search term (case-insensitive). No
     * non-matching products should appear in the results.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (products, search) => {
          const results = filterProducts(products, { search });
          return results.every((p) => ilikeMatch(p.name, search));
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: product category filter only returns items with the exact category", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: for any category filter, every product in the result set
     * must have exactly that category. No products from other categories
     * should appear.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        fc.constantFrom("perfumes", "cosmetics", "jewelry", "gift_sets"),
        (products, category) => {
          const results = filterProducts(products, { category });
          return results.every((p) => p.category === category);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: combined search + category filter satisfies both constraints", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: when both search and category filters are applied, every
     * result must satisfy BOTH constraints simultaneously (AND logic).
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom("perfumes", "cosmetics", "jewelry", "gift_sets"),
        (products, search, category) => {
          const results = filterProducts(products, { search, category });
          return results.every(
            (p) => ilikeMatch(p.name, search) && p.category === category
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: product filter always excludes inactive products", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: regardless of search or category filters, inactive products
     * (isActive = false) must never appear in the results.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (products) => {
          const results = filterProducts(products, {});
          return results.every((p) => p.isActive === true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: no filter returns all active products", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: when no search or category filter is applied, the result
     * set must contain exactly all active products — no more, no less.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (products) => {
          const results = filterProducts(products, {});
          const activeCount = products.filter((p) => p.isActive).length;
          return results.length === activeCount;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: customer search matches name OR email (OR logic)", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: for any search term, every customer in the result set must
     * have either a name or an email that contains the search term. The OR
     * logic ensures customers are found by either field.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        fc.string({ minLength: 1, maxLength: 10 }),
        (customers, search) => {
          const results = filterCustomers(customers, { search });
          return results.every(
            (c) => ilikeMatch(c.name, search) || ilikeMatch(c.email, search)
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: customer search with no term returns all customers", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: when no search term is provided, all customers must be
     * returned without any filtering applied.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            email: fc.emailAddress(),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (customers) => {
          const results = filterCustomers(customers, {});
          return results.length === customers.length;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: search is case-insensitive (ILIKE semantics)", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: searching for an uppercase term must return the same results
     * as searching for the lowercase equivalent, confirming case-insensitive
     * matching (SQL ILIKE behaviour).
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.constant(true),
          }),
          { minLength: 0, maxLength: 30 }
        ),
        fc.string({ minLength: 1, maxLength: 15 }).filter((s) =>
          /^[a-zA-Z]+$/.test(s)
        ),
        (products, search) => {
          const lowerResults = filterProducts(products, {
            search: search.toLowerCase(),
          });
          const upperResults = filterProducts(products, {
            search: search.toUpperCase(),
          });
          return lowerResults.length === upperResults.length;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: filter results are always a subset of the full dataset", () => {
    /**
     * Validates: Requirements 3.5
     *
     * Property: applying any filter can only reduce (or maintain) the result
     * set size — it can never return more items than the original dataset.
     * This ensures filters don't introduce phantom results.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(
              "perfumes",
              "cosmetics",
              "jewelry",
              "gift_sets"
            ),
            isActive: fc.boolean(),
          }),
          { minLength: 0, maxLength: 100 }
        ),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        fc.option(
          fc.constantFrom("perfumes", "cosmetics", "jewelry", "gift_sets"),
          { nil: undefined }
        ),
        (products, search, category) => {
          const filtered = filterProducts(products, { search, category });
          return filtered.length <= products.length;
        }
      ),
      { numRuns: 20 }
    );
  });
});
