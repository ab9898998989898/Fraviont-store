import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Property 7: AI Chat Rate Limiting
 *
 * For any session ID, after exactly 10 ai.chat calls within a 60-second window,
 * the 11th call is rejected. We test this with a mocked rate limiter since the
 * actual implementation uses Upstash Redis.
 */

/**
 * In-memory sliding window rate limiter for testing.
 * Replicates the contract of Upstash Ratelimit sliding window 10/min.
 */
class MockRateLimiter {
  private windows: Map<string, number[]> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(sessionId: string, now: number = Date.now()): { success: boolean; remaining: number } {
    const timestamps = this.windows.get(sessionId) ?? [];

    // Remove expired entries
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    if (validTimestamps.length >= this.limit) {
      this.windows.set(sessionId, validTimestamps);
      return { success: false, remaining: 0 };
    }

    validTimestamps.push(now);
    this.windows.set(sessionId, validTimestamps);
    return {
      success: true,
      remaining: this.limit - validTimestamps.length,
    };
  }
}

describe("Property: AI Chat Rate Limiting", () => {
  it("allows exactly 10 calls and rejects the 11th within a 60s window", () => {
    fc.assert(
      fc.property(fc.uuid(), (sessionId) => {
        const limiter = new MockRateLimiter(10, 60_000);
        const now = Date.now();

        // First 10 calls should succeed
        for (let i = 0; i < 10; i++) {
          const result = limiter.check(sessionId, now + i * 100);
          expect(result.success).toBe(true);
        }

        // 11th call should be rejected
        const rejected = limiter.check(sessionId, now + 10 * 100);
        expect(rejected.success).toBe(false);
        expect(rejected.remaining).toBe(0);
      }),
      { numRuns: 200 }
    );
  });

  it("different session IDs have independent rate limits", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (sessionA, sessionB) => {
        // Ensure unique session IDs
        if (sessionA === sessionB) return;

        const limiter = new MockRateLimiter(10, 60_000);
        const now = Date.now();

        // Exhaust session A's limit
        for (let i = 0; i < 10; i++) {
          limiter.check(sessionA, now + i * 100);
        }

        // Session B should still have full limit
        const result = limiter.check(sessionB, now);
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(9);
      }),
      { numRuns: 200 }
    );
  });

  it("rate limit resets after the window expires", () => {
    fc.assert(
      fc.property(fc.uuid(), (sessionId) => {
        const limiter = new MockRateLimiter(10, 60_000);
        const now = Date.now();

        // Exhaust the limit
        for (let i = 0; i < 10; i++) {
          limiter.check(sessionId, now + i * 100);
        }

        // Verify it's exhausted
        expect(limiter.check(sessionId, now + 59_999).success).toBe(false);

        // After 60 seconds, the limit should reset
        const afterWindow = limiter.check(sessionId, now + 60_001);
        expect(afterWindow.success).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it("remaining count decreases correctly with each call", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        (sessionId, callCount) => {
          const limiter = new MockRateLimiter(10, 60_000);
          const now = Date.now();

          let lastResult = { success: true, remaining: 10 };
          for (let i = 0; i < callCount; i++) {
            lastResult = limiter.check(sessionId, now + i * 100);
          }

          expect(lastResult.success).toBe(true);
          expect(lastResult.remaining).toBe(10 - callCount);
        }
      ),
      { numRuns: 300 }
    );
  });
});
