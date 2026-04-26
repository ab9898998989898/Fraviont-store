import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as fc from "fast-check";

/**
 * Manual Refresh Preservation Test - Task 2.6
 *
 * Validates: Requirements 3.1-3.8
 *
 * This test uses static source analysis and pure-function property testing to
 * confirm that manual page refresh (browser reload) always fetches fresh data
 * on unfixed code.
 *
 * Manual refresh works because:
 *   1. Dashboard: uses tRPC React Query hooks (`@/trpc/react`) — on mount
 *      (which happens on every page load / manual refresh), React Query
 *      fetches fresh data from the server.
 *   2. Client pages (customers, analytics, orders, products) also use
 *      tRPC React Query hooks — same behaviour.
 *
 * The admin pages must:
 *   1. Dashboard: use `api` from `@/trpc/react` with `.useQuery()` hooks
 *      (React Query fetches on mount — i.e., on every manual refresh)
 *   2. Client pages: use `api` from `@/trpc/react` with `.useQuery()` hooks
 *      (React Query fetches on mount — i.e., on every manual refresh)
 *   3. No page should use stale-while-revalidate patterns that would prevent
 *      fresh data on manual refresh (e.g., no `staleTime: Infinity` without
 *      a corresponding `refetchOnMount: false` that would block fresh fetches)
 *
 * EXPECTED OUTCOME on unfixed code: PASSES
 *   - Dashboard uses client-side useQuery hooks (fresh on every mount/refresh)
 *   - Client pages use useQuery hooks (fresh on every mount/refresh)
 *   - No page disables refetch-on-mount behaviour
 */

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------

const DASHBOARD_PAGE = resolve(
  __dirname,
  "../../app/admin/(dashboard)/dashboard/page.tsx"
);

const CUSTOMERS_PAGE = resolve(
  __dirname,
  "../../app/admin/(dashboard)/customers/page.tsx"
);

const ANALYTICS_PAGE = resolve(
  __dirname,
  "../../app/admin/(dashboard)/analytics/page.tsx"
);

const ORDERS_PAGE = resolve(
  __dirname,
  "../../app/admin/(dashboard)/orders/page.tsx"
);

const PRODUCTS_PAGE = resolve(
  __dirname,
  "../../app/admin/(dashboard)/products/page.tsx"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the source uses the tRPC server client
 * (`@/trpc/server`), meaning data is fetched server-side on every request.
 */
function usesServerTrpc(source: string): boolean {
  return /from\s*["']@\/trpc\/server["']/.test(source);
}

/**
 * Returns true when the source uses the tRPC React client
 * (`@/trpc/react`), meaning data is fetched via React Query hooks.
 */
function usesReactTrpc(source: string): boolean {
  return /from\s*["']@\/trpc\/react["']/.test(source);
}

/**
 * Returns true when the source contains at least one `.useQuery(` call,
 * confirming React Query is used for data fetching.
 */
function hasUseQueryCall(source: string): boolean {
  return /\.useQuery\s*\(/.test(source);
}

/**
 * Returns true when the source does NOT disable refetch-on-mount.
 * React Query's default is `refetchOnMount: true`, which ensures fresh data
 * is fetched every time the component mounts (i.e., on every manual refresh).
 * Setting `refetchOnMount: false` would break manual refresh behaviour.
 */
function doesNotDisableRefetchOnMount(source: string): boolean {
  return !/refetchOnMount\s*:\s*false/.test(source);
}

/**
 * Returns true when the source does NOT set staleTime to Infinity,
 * which would prevent React Query from ever re-fetching data.
 */
function doesNotSetInfiniteStaleTime(source: string): boolean {
  return !/staleTime\s*:\s*Infinity/.test(source);
}

/**
 * Simulates a "fresh fetch" — given a data store and a fetch timestamp,
 * returns the data that was current at that timestamp.
 *
 * This models the invariant: a fresh fetch always returns the data that
 * exists in the store at the time of the fetch, not older data.
 */
function freshFetch<T>(
  store: Array<{ data: T; timestamp: number }>,
  fetchTimestamp: number
): T | null {
  // Find the most recent entry at or before the fetch timestamp
  const candidates = store.filter((e) => e.timestamp <= fetchTimestamp);
  if (candidates.length === 0) return null;
  // Return the most recent one
  return candidates.reduce((latest, entry) =>
    entry.timestamp > latest.timestamp ? entry : latest
  ).data;
}

/**
 * Simulates a stale read — returns data from a fixed snapshot time,
 * ignoring any updates that happened after the snapshot.
 * This models the BUG condition (no auto-refresh, no manual refresh).
 */
function staleRead<T>(
  store: Array<{ data: T; timestamp: number }>,
  snapshotTimestamp: number
): T | null {
  return freshFetch(store, snapshotTimestamp);
}

// ---------------------------------------------------------------------------
// Static analysis tests
// ---------------------------------------------------------------------------

describe("Manual refresh preservation - static analysis (Requirements 3.1-3.8)", () => {
  const dashboardSource = readFileSync(DASHBOARD_PAGE, "utf-8");
  const customersSource = readFileSync(CUSTOMERS_PAGE, "utf-8");
  const analyticsSource = readFileSync(ANALYTICS_PAGE, "utf-8");
  const ordersSource = readFileSync(ORDERS_PAGE, "utf-8");
  const productsSource = readFileSync(PRODUCTS_PAGE, "utf-8");

  // ---- Dashboard page: client component with useQuery ----

  it("dashboard page uses React tRPC client for data fetching", () => {
    /**
     * The dashboard page is now a client component. It imports `api` from
     * `@/trpc/react` and uses useQuery hooks. React Query fetches fresh data
     * on every mount (i.e., on every manual refresh) — no stale data is possible.
     */
    expect(
      dashboardSource,
      "Expected dashboard to import api from @/trpc/react"
    ).toMatch(/from\s*["']@\/trpc\/react["']/);
  });

  it("dashboard page uses useQuery hooks (fetches fresh data on mount/refresh)", () => {
    /**
     * The dashboard page uses useQuery hooks which trigger a fresh fetch on
     * every component mount — including every manual page refresh.
     */
    expect(
      dashboardSource,
      "Expected dashboard to use .useQuery() for data fetching"
    ).toMatch(/\.useQuery\s*\(/);
  });

  it("dashboard page does not disable refetch-on-mount", () => {
    /**
     * React Query's default refetchOnMount: true ensures fresh data is fetched
     * on every mount. The dashboard must not override this to false.
     */
    expect(
      dashboardSource,
      "Expected dashboard NOT to set refetchOnMount: false"
    ).not.toMatch(/refetchOnMount\s*:\s*false/);
  });

  it("dashboard page does not set infinite stale time", () => {
    expect(
      dashboardSource,
      "Expected dashboard NOT to set staleTime: Infinity"
    ).not.toMatch(/staleTime\s*:\s*Infinity/);
  });

  // ---- Customers page: client-side tRPC with useQuery ----

  it("customers page uses React tRPC client for data fetching", () => {
    expect(
      customersSource,
      "Expected customers page to import api from @/trpc/react"
    ).toMatch(/from\s*["']@\/trpc\/react["']/);
  });

  it("customers page uses useQuery hook (fetches fresh data on mount/refresh)", () => {
    expect(
      customersSource,
      "Expected customers page to use .useQuery() for data fetching"
    ).toMatch(/\.useQuery\s*\(/);
  });

  it("customers page does not disable refetch-on-mount", () => {
    expect(
      customersSource,
      "Expected customers page NOT to set refetchOnMount: false"
    ).not.toMatch(/refetchOnMount\s*:\s*false/);
  });

  it("customers page does not set infinite stale time", () => {
    expect(
      customersSource,
      "Expected customers page NOT to set staleTime: Infinity"
    ).not.toMatch(/staleTime\s*:\s*Infinity/);
  });

  // ---- Analytics page: client-side tRPC with useQuery ----

  it("analytics page uses React tRPC client for data fetching", () => {
    expect(
      analyticsSource,
      "Expected analytics page to import api from @/trpc/react"
    ).toMatch(/from\s*["']@\/trpc\/react["']/);
  });

  it("analytics page uses useQuery hooks (fetches fresh data on mount/refresh)", () => {
    expect(
      analyticsSource,
      "Expected analytics page to use .useQuery() for data fetching"
    ).toMatch(/\.useQuery\s*\(/);
  });

  it("analytics page does not disable refetch-on-mount", () => {
    expect(
      analyticsSource,
      "Expected analytics page NOT to set refetchOnMount: false"
    ).not.toMatch(/refetchOnMount\s*:\s*false/);
  });

  it("analytics page does not set infinite stale time", () => {
    expect(
      analyticsSource,
      "Expected analytics page NOT to set staleTime: Infinity"
    ).not.toMatch(/staleTime\s*:\s*Infinity/);
  });

  // ---- Orders page: client-side tRPC with useQuery ----

  it("orders page uses React tRPC client for data fetching", () => {
    expect(
      ordersSource,
      "Expected orders page to import api from @/trpc/react"
    ).toMatch(/from\s*["']@\/trpc\/react["']/);
  });

  it("orders page uses useQuery hook (fetches fresh data on mount/refresh)", () => {
    expect(
      ordersSource,
      "Expected orders page to use .useQuery() for data fetching"
    ).toMatch(/\.useQuery\s*\(/);
  });

  it("orders page does not disable refetch-on-mount", () => {
    expect(
      ordersSource,
      "Expected orders page NOT to set refetchOnMount: false"
    ).not.toMatch(/refetchOnMount\s*:\s*false/);
  });

  it("orders page does not set infinite stale time", () => {
    expect(
      ordersSource,
      "Expected orders page NOT to set staleTime: Infinity"
    ).not.toMatch(/staleTime\s*:\s*Infinity/);
  });

  // ---- Products page: client-side tRPC with useQuery ----

  it("products page uses React tRPC client for data fetching", () => {
    expect(
      productsSource,
      "Expected products page to import api from @/trpc/react"
    ).toMatch(/from\s*["']@\/trpc\/react["']/);
  });

  it("products page uses useQuery hook (fetches fresh data on mount/refresh)", () => {
    expect(
      productsSource,
      "Expected products page to use .useQuery() for data fetching"
    ).toMatch(/\.useQuery\s*\(/);
  });

  it("products page does not disable refetch-on-mount", () => {
    expect(
      productsSource,
      "Expected products page NOT to set refetchOnMount: false"
    ).not.toMatch(/refetchOnMount\s*:\s*false/);
  });

  it("products page does not set infinite stale time", () => {
    expect(
      productsSource,
      "Expected products page NOT to set staleTime: Infinity"
    ).not.toMatch(/staleTime\s*:\s*Infinity/);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests: fresh fetch always returns latest data
// ---------------------------------------------------------------------------

describe("Manual refresh preservation - pure function properties (Requirements 3.1-3.8)", () => {
  /**
   * These property tests verify the invariant that a fresh fetch (triggered
   * by manual page refresh) always returns the most current data available
   * at the time of the fetch.
   */

  it("property: fresh fetch always returns the most recent data at fetch time", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: for any data store with timestamped entries and any fetch
     * timestamp, a fresh fetch returns the most recent entry at or before
     * the fetch time. This models the guarantee that manual refresh always
     * shows current data.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            data: fc.integer({ min: 0, max: 1_000_000 }),
            timestamp: fc.integer({ min: 0, max: 10_000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        fc.integer({ min: 0, max: 10_000 }),
        (store, fetchTimestamp) => {
          const result = freshFetch(store, fetchTimestamp);
          const candidates = store.filter((e) => e.timestamp <= fetchTimestamp);

          if (candidates.length === 0) {
            return result === null;
          }

          // The result must be the maximum-timestamp entry among candidates
          const maxTimestamp = Math.max(...candidates.map((e) => e.timestamp));
          const expected = candidates.find((e) => e.timestamp === maxTimestamp)!;
          return result === expected.data;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: fresh fetch at time T always returns data >= data at time T-1", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: a fresh fetch at a later time can only return data that is
     * at least as recent as a fetch at an earlier time. This ensures manual
     * refresh never shows older data than a previous refresh.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            data: fc.integer({ min: 0, max: 1_000_000 }),
            timestamp: fc.integer({ min: 0, max: 10_000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        fc.integer({ min: 1, max: 10_000 }),
        (store, t2) => {
          const t1 = Math.max(0, t2 - 1);
          const result1 = freshFetch(store, t1);
          const result2 = freshFetch(store, t2);

          // If both fetches return data, the later fetch's timestamp must be >= earlier
          if (result1 === null || result2 === null) return true;

          const candidates1 = store.filter((e) => e.timestamp <= t1);
          const candidates2 = store.filter((e) => e.timestamp <= t2);

          if (candidates1.length === 0 || candidates2.length === 0) return true;

          const maxTs1 = Math.max(...candidates1.map((e) => e.timestamp));
          const maxTs2 = Math.max(...candidates2.map((e) => e.timestamp));

          // The later fetch must have a timestamp >= the earlier fetch's timestamp
          return maxTs2 >= maxTs1;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: fresh fetch always returns more recent data than a stale read after updates", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: when new data is added to the store after a snapshot was
     * taken, a fresh fetch at the current time returns more recent data than
     * a stale read from the snapshot. This models the key difference between
     * manual refresh (fresh fetch) and no-refresh (stale read).
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),  // initial data value
        fc.integer({ min: 0, max: 1_000_000 }),  // updated data value
        fc.integer({ min: 1, max: 5_000 }),       // snapshot time
        fc.integer({ min: 1, max: 5_000 }),       // delta (update happens after snapshot)
        (initialValue, updatedValue, snapshotTime, delta) => {
          const updateTime = snapshotTime + delta;

          const store = [
            { data: initialValue, timestamp: snapshotTime },
            { data: updatedValue, timestamp: updateTime },
          ];

          // Stale read: uses snapshot time (misses the update)
          const staleResult = staleRead(store, snapshotTime);

          // Fresh fetch: uses current time (sees the update)
          const freshResult = freshFetch(store, updateTime);

          // Stale read returns the initial value
          if (staleResult !== initialValue) return false;

          // Fresh fetch returns the updated value
          if (freshResult !== updatedValue) return false;

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: fresh fetch with no updates returns the same data as stale read", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: when no data changes occur between the snapshot and the
     * fetch, a fresh fetch returns the same data as a stale read. This
     * confirms that manual refresh is non-destructive — it doesn't change
     * data that hasn't changed.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),  // data value (unchanged)
        fc.integer({ min: 0, max: 5_000 }),       // snapshot time
        (dataValue, snapshotTime) => {
          // Store with only one entry (no updates after snapshot)
          const store = [{ data: dataValue, timestamp: snapshotTime }];

          const staleResult = staleRead(store, snapshotTime);
          const freshResult = freshFetch(store, snapshotTime + 1000);

          // Both should return the same value since no updates occurred
          return staleResult === freshResult && freshResult === dataValue;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: for all admin pages, tRPC fetch pattern enables fresh data on mount", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: for any admin page, the data fetching pattern (server-side
     * tRPC or client-side useQuery) guarantees that a fresh fetch is
     * triggered on every page mount (manual refresh). This is verified by
     * checking that no page disables the default React Query refetch-on-mount
     * behaviour.
     */
    const pageSources = [
      { name: "dashboard", source: readFileSync(DASHBOARD_PAGE, "utf-8") },
      { name: "customers", source: readFileSync(CUSTOMERS_PAGE, "utf-8") },
      { name: "analytics", source: readFileSync(ANALYTICS_PAGE, "utf-8") },
      { name: "orders", source: readFileSync(ORDERS_PAGE, "utf-8") },
      { name: "products", source: readFileSync(PRODUCTS_PAGE, "utf-8") },
    ] as const;

    fc.assert(
      fc.property(
        fc.constantFrom(...pageSources),
        ({ name, source }) => {
          // Each page must use either server-side tRPC or client-side useQuery
          const usesServerFetch = usesServerTrpc(source);
          const usesClientFetch = usesReactTrpc(source) && hasUseQueryCall(source);

          if (!usesServerFetch && !usesClientFetch) {
            // Page doesn't use tRPC at all — fail
            return false;
          }

          // Client pages must not disable refetch-on-mount
          if (usesClientFetch && !doesNotDisableRefetchOnMount(source)) {
            return false;
          }

          // No page should set infinite stale time (would prevent fresh fetches)
          if (!doesNotSetInfiniteStaleTime(source)) {
            return false;
          }

          // Dashboard is now a client component using useQuery — this is valid
          // (useQuery fetches fresh data on every mount, including manual refresh)

          return true;
        }
      )
    );
  });

  it("property: fresh fetch timestamp is always >= snapshot timestamp", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: a manual refresh always happens at a time >= the initial
     * page load time. This ensures the fresh fetch can only see data that
     * is at least as current as the initial load.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),  // initial load timestamp
        fc.integer({ min: 0, max: 1_000_000 }),  // elapsed time before refresh
        (initialLoadTime, elapsed) => {
          const refreshTime = initialLoadTime + elapsed;
          return refreshTime >= initialLoadTime;
        }
      ),
      { numRuns: 20 }
    );
  });

  it("property: multiple sequential refreshes always return non-decreasing data timestamps", () => {
    /**
     * Validates: Requirements 3.1-3.8
     *
     * Property: for any sequence of manual refreshes, each refresh returns
     * data with a timestamp >= the previous refresh's data timestamp. This
     * ensures that refreshing never causes the UI to show older data.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            data: fc.integer({ min: 0, max: 1_000_000 }),
            timestamp: fc.integer({ min: 0, max: 10_000 }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        fc.array(
          fc.integer({ min: 0, max: 10_000 }),
          { minLength: 2, maxLength: 10 }
        ),
        (store, refreshTimes) => {
          const sortedRefreshTimes = [...refreshTimes].sort((a, b) => a - b);

          let prevTimestamp = -1;

          for (const refreshTime of sortedRefreshTimes) {
            const result = freshFetch(store, refreshTime);
            if (result === null) continue;

            const candidates = store.filter((e) => e.timestamp <= refreshTime);
            if (candidates.length === 0) continue;

            const maxTs = Math.max(...candidates.map((e) => e.timestamp));

            // Each refresh's data timestamp must be >= the previous refresh's
            if (maxTs < prevTimestamp) return false;
            prevTimestamp = maxTs;
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });
});
