import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * Pagination Preservation Test - Task 2.3
 *
 * Validates: Requirements 3.6
 *
 * This test uses static source analysis and pure-function property testing to
 * confirm that the paginated routers (products, customers) correctly calculate
 * page offsets and expose the total count needed for navigation controls.
 *
 * The routers must:
 *   1. Accept `page` and `limit` input parameters
 *   2. Compute `offset = (page - 1) * limit`
 *   3. Apply `.limit(input.limit).offset(offset)` to the query
 *   4. Return a `total` count so the UI can calculate page numbers
 *
 * EXPECTED OUTCOME on unfixed code: PASSES
 *   - Pagination formula is correct in both routers
 *   - Total count is returned for navigation
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
// Pure pagination helpers — extracted from the router logic for property tests
// ---------------------------------------------------------------------------

/** Mirrors the offset calculation used in both routers. */
function calcOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/** Mirrors the total-pages calculation a UI would perform. */
function calcTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.ceil(total / limit);
}

/** Returns true when the given page is within the valid range. */
function isValidPage(page: number, total: number, limit: number): boolean {
  if (total === 0) return page === 1;
  return page >= 1 && page <= calcTotalPages(total, limit);
}

// ---------------------------------------------------------------------------
// Static source analysis helpers
// ---------------------------------------------------------------------------

function assertPaginationPattern(source: string, routerName: string): void {
  // Must accept a `page` input parameter
  expect(source, `${routerName}: expected 'page' input parameter`).toMatch(
    /page\s*:\s*z\.number/
  );

  // Must accept a `limit` input parameter
  expect(source, `${routerName}: expected 'limit' input parameter`).toMatch(
    /limit\s*:\s*z\.number/
  );

  // Must compute offset using (page - 1) * limit
  expect(
    source,
    `${routerName}: expected offset = (page - 1) * limit`
  ).toMatch(/offset\s*=\s*\(\s*input\.page\s*-\s*1\s*\)\s*\*\s*input\.limit/);

  // Must apply .limit() to the query
  expect(source, `${routerName}: expected .limit() applied to query`).toMatch(
    /\.limit\s*\(\s*input\.limit\s*\)/
  );

  // Must apply .offset() to the query
  expect(source, `${routerName}: expected .offset() applied to query`).toMatch(
    /\.offset\s*\(\s*offset\s*\)/
  );

  // Must return a `total` field for navigation controls
  expect(
    source,
    `${routerName}: expected 'total' field in return value`
  ).toMatch(/total\s*[=:]/);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Pagination preservation (Requirement 3.6)", () => {
  const productsSource = readFileSync(PRODUCTS_ROUTER_PATH, "utf-8");
  const customersSource = readFileSync(CUSTOMERS_ROUTER_PATH, "utf-8");

  // ---- Static analysis: products router ----

  it("products router accepts page and limit parameters and computes offset correctly", () => {
    assertPaginationPattern(productsSource, "products router");
  });

  it("products router returns a total count for page navigation", () => {
    expect(
      productsSource,
      "products router: expected total count returned"
    ).toContain("total");
  });

  // ---- Static analysis: customers router ----

  it("customers router accepts page and limit parameters and computes offset correctly", () => {
    assertPaginationPattern(customersSource, "customers router");
  });

  it("customers router returns a total count for page navigation", () => {
    expect(
      customersSource,
      "customers router: expected total count returned"
    ).toContain("total");
  });

  // ---- Pure-function property tests ----

  it("property: offset is always non-negative for valid page numbers", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: for any valid page (>= 1) and limit (>= 1), the computed
     * offset is always >= 0. A negative offset would skip rows incorrectly.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000 }), // page
        fc.integer({ min: 1, max: 100 }),     // limit
        (page, limit) => {
          const offset = calcOffset(page, limit);
          return offset >= 0;
        }
      )
    );
  });

  it("property: first page always has offset 0", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: page 1 must always produce offset 0 regardless of limit,
     * ensuring the first page starts from the beginning of the result set.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // limit
        (limit) => {
          return calcOffset(1, limit) === 0;
        }
      )
    );
  });

  it("property: offset increases by exactly limit for each subsequent page", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: consecutive pages must be exactly `limit` rows apart.
     * This ensures no rows are skipped or duplicated between pages.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9_999 }), // page
        fc.integer({ min: 1, max: 100 }),    // limit
        (page, limit) => {
          const offsetCurrent = calcOffset(page, limit);
          const offsetNext = calcOffset(page + 1, limit);
          return offsetNext - offsetCurrent === limit;
        }
      )
    );
  });

  it("property: total pages is the ceiling of total / limit", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: the total page count must equal ceil(total / limit) so that
     * the last page is always reachable and no partial page is omitted.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100_000 }), // total rows
        fc.integer({ min: 1, max: 100 }),      // limit
        (total, limit) => {
          const pages = calcTotalPages(total, limit);
          return pages === Math.ceil(total / limit);
        }
      )
    );
  });

  it("property: page 1 is always valid when total > 0", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: page 1 must always be a valid page when there is at least
     * one row, ensuring navigation controls always show at least one page.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }), // total rows (> 0)
        fc.integer({ min: 1, max: 100 }),      // limit
        (total, limit) => {
          return isValidPage(1, total, limit);
        }
      )
    );
  });

  it("property: last page is always valid", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: the last page (ceil(total/limit)) must always be a valid
     * page, ensuring the final page of results is reachable.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }), // total rows
        fc.integer({ min: 1, max: 100 }),      // limit
        (total, limit) => {
          const lastPage = calcTotalPages(total, limit);
          return isValidPage(lastPage, total, limit);
        }
      )
    );
  });

  it("property: offset for last page never exceeds total", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: the offset for the last page must be less than total,
     * ensuring the last page query returns at least one row.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }), // total rows
        fc.integer({ min: 1, max: 100 }),      // limit
        (total, limit) => {
          const lastPage = calcTotalPages(total, limit);
          const offset = calcOffset(lastPage, limit);
          return offset < total;
        }
      )
    );
  });

  it("property: products router default limit is positive and within max", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: the products router must define a positive default limit and
     * a max limit, ensuring pagination is bounded and never returns unbounded
     * result sets.
     */
    fc.assert(
      fc.property(
        fc.constant(productsSource),
        (source) => {
          // Extract the limit field's Zod chain (single line)
          const limitChainMatch = source.match(/limit\s*:\s*z\.number[^\n,]+/);
          if (!limitChainMatch) return false;
          const chain = limitChainMatch[0]!;

          // Extract default value from the limit chain
          const defaultMatch = chain.match(/\.default\s*\(\s*(\d+)\s*\)/);
          if (!defaultMatch) return false;
          const defaultLimit = parseInt(defaultMatch[1]!, 10);
          if (defaultLimit <= 0) return false;

          // Extract max value from the limit chain
          const maxMatch = chain.match(/\.max\s*\(\s*(\d+)\s*\)/);
          if (!maxMatch) return false;
          const maxLimit = parseInt(maxMatch[1]!, 10);
          return maxLimit > 0 && maxLimit >= defaultLimit;
        }
      )
    );
  });

  it("property: customers router default limit is positive and within max", () => {
    /**
     * Validates: Requirements 3.6
     *
     * Property: the customers router must define a positive default limit and
     * a max limit, ensuring pagination is bounded and never returns unbounded
     * result sets.
     */
    fc.assert(
      fc.property(
        fc.constant(customersSource),
        (source) => {
          // Extract the limit field's Zod chain (single line)
          const limitChainMatch = source.match(/limit\s*:\s*z\.number[^\n,]+/);
          if (!limitChainMatch) return false;
          const chain = limitChainMatch[0]!;

          // Extract default value from the limit chain
          const defaultMatch = chain.match(/\.default\s*\(\s*(\d+)\s*\)/);
          if (!defaultMatch) return false;
          const defaultLimit = parseInt(defaultMatch[1]!, 10);
          if (defaultLimit <= 0) return false;

          // Extract max value from the limit chain
          const maxMatch = chain.match(/\.max\s*\(\s*(\d+)\s*\)/);
          if (!maxMatch) return false;
          const maxLimit = parseInt(maxMatch[1]!, 10);
          return maxLimit > 0 && maxLimit >= defaultLimit;
        }
      )
    );
  });
});
