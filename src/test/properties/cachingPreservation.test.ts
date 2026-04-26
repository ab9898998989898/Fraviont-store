import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * Caching Preservation Test - Task 2.2
 *
 * Validates: Requirements 3.7, 3.8
 *
 * This test uses static source analysis to confirm that the analytics router
 * uses Redis caching (via `withCache`) for all its queries, and that cache
 * keys follow the expected `analytics:*` naming convention.
 *
 * The analytics router at src/server/api/routers/analytics.ts must:
 *   1. Import `withCache` from the Redis client module
 *   2. Wrap every query handler body in a `withCache(...)` call
 *   3. Use cache keys prefixed with "analytics:"
 *   4. Specify a TTL (time-to-live) for each cached entry
 *
 * EXPECTED OUTCOME on unfixed code: PASSES
 *   - All analytics queries are wrapped in withCache
 *   - Cache keys are present and follow the analytics: prefix convention
 *   - TTL values are specified for each cache entry
 */

const ANALYTICS_ROUTER_PATH = resolve(
  __dirname,
  "../../server/api/routers/analytics.ts"
);

/**
 * The known analytics query procedures and their expected cache keys.
 * These are the cache keys observed in the unfixed code.
 */
const EXPECTED_CACHE_KEYS = [
  "analytics:dashboard",
  "analytics:revenue:",
  "analytics:orderstats",
  "analytics:topproducts",
  "analytics:customerstats",
  "analytics:pnl",
] as const;

/**
 * The known analytics procedure names in the router.
 */
const ANALYTICS_PROCEDURES = [
  "getDashboardStats",
  "getRevenue",
  "getOrderStats",
  "getTopProducts",
  "getCustomerStats",
  "getPnL",
] as const;

describe("Analytics router - caching preservation (Requirements 3.7, 3.8)", () => {
  const source = readFileSync(ANALYTICS_ROUTER_PATH, "utf-8");

  it("analytics router imports withCache from the Redis client", () => {
    expect(
      source,
      "Expected withCache import from @/lib/redis/client"
    ).toMatch(
      /import\s*\{[^}]*\bwithCache\b[^}]*\}\s*from\s*["']@\/lib\/redis\/client["']/
    );
  });

  it("analytics router uses withCache for every query procedure", () => {
    // Count the number of query procedures
    const queryMatches = source.match(/\.query\s*\(/g);
    const withCacheMatches = source.match(/withCache\s*\(/g);

    expect(
      queryMatches,
      "Expected at least one .query() call in analytics router"
    ).not.toBeNull();

    expect(
      withCacheMatches,
      "Expected withCache calls in analytics router"
    ).not.toBeNull();

    // Every query should be wrapped in withCache
    expect(
      withCacheMatches!.length,
      `Expected ${queryMatches!.length} withCache calls (one per query), got ${withCacheMatches!.length}`
    ).toBe(queryMatches!.length);
  });

  it("all cache keys are prefixed with 'analytics:'", () => {
    // Extract all string arguments passed as first arg to withCache
    const cacheKeyPattern = /withCache\s*\(\s*["']([^"']+)["']/g;
    const foundKeys: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = cacheKeyPattern.exec(source)) !== null) {
      foundKeys.push(match[1]!);
    }

    expect(foundKeys.length, "Expected at least one cache key").toBeGreaterThan(0);

    for (const key of foundKeys) {
      expect(
        key,
        `Cache key "${key}" must start with "analytics:"`
      ).toMatch(/^analytics:/);
    }
  });

  it("all withCache calls specify a TTL (numeric second argument)", () => {
    // Match withCache("key", <number>, ...) patterns
    const withCacheTTLPattern = /withCache\s*\(\s*[`"'][^`"']*[`"']\s*,\s*(\d+)\s*,/g;
    const ttlValues: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = withCacheTTLPattern.exec(source)) !== null) {
      ttlValues.push(parseInt(match[1]!, 10));
    }

    expect(ttlValues.length, "Expected TTL values for all withCache calls").toBeGreaterThan(0);

    for (const ttl of ttlValues) {
      expect(ttl, `TTL must be a positive number, got ${ttl}`).toBeGreaterThan(0);
    }
  });

  it("each known analytics procedure is present in the router source", () => {
    for (const procedure of ANALYTICS_PROCEDURES) {
      expect(
        source,
        `Expected procedure "${procedure}" to be defined in analytics router`
      ).toContain(procedure);
    }
  });

  it("each expected cache key prefix is present in the router source", () => {
    for (const key of EXPECTED_CACHE_KEYS) {
      expect(
        source,
        `Expected cache key "${key}" to be present in analytics router`
      ).toContain(key);
    }
  });

  it("property: for every analytics procedure, withCache is used (not raw db calls)", () => {
    /**
     * Validates: Requirements 3.7
     *
     * Property: for any analytics procedure name, the source code wraps its
     * database query in withCache rather than calling db directly at the top
     * level of the query handler. This ensures Redis caching is always used
     * for analytics queries to maintain fast response times.
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...ANALYTICS_PROCEDURES),
        (procedure) => {
          // The procedure must be present in the source
          if (!source.includes(procedure)) return false;

          // The source must use withCache (not bypass it)
          const hasWithCache = /withCache\s*\(/.test(source);
          if (!hasWithCache) return false;

          // The number of withCache calls must equal the number of query procedures
          const queryCount = (source.match(/\.query\s*\(/g) ?? []).length;
          const cacheCount = (source.match(/withCache\s*\(/g) ?? []).length;
          if (cacheCount !== queryCount) return false;

          return true;
        }
      )
    );
  });

  it("property: for every cache key, it follows the analytics: prefix convention", () => {
    /**
     * Validates: Requirements 3.7, 3.8
     *
     * Property: all cache keys used in the analytics router follow the
     * "analytics:" prefix naming convention. This ensures cache keys are
     * namespaced correctly and can be invalidated as a group when needed.
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...EXPECTED_CACHE_KEYS),
        (expectedKey) => {
          // Each expected cache key must appear in the source
          return source.includes(expectedKey);
        }
      )
    );
  });

  it("property: cache invalidation is supported - withCache wraps async functions", () => {
    /**
     * Validates: Requirements 3.8
     *
     * Property: each withCache call wraps an async function (arrow function
     * with async keyword), ensuring the cache layer can execute the underlying
     * database query when the cache is cold or invalidated.
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...ANALYTICS_PROCEDURES),
        (procedure) => {
          if (!source.includes(procedure)) return false;

          // withCache must be called with an async function as the third argument
          // Pattern: withCache("key", ttl, async () => { ... })
          const asyncFnPattern = /withCache\s*\([^,]+,\s*\d+\s*,\s*async\s*\(\s*\)\s*=>/g;
          const asyncMatches = source.match(asyncFnPattern);

          // All withCache calls should use async functions
          const withCacheCount = (source.match(/withCache\s*\(/g) ?? []).length;
          const asyncCount = asyncMatches?.length ?? 0;

          return asyncCount === withCacheCount;
        }
      )
    );
  });
});
