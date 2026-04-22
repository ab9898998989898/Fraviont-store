import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatPrice } from "@/lib/utils";

describe("Property: formatPrice Round-Trip", () => {
  it("returns a non-empty string for any positive integer cents (1 to 10,000,000)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000_000 }), (cents) => {
        const result = formatPrice(cents);

        // Must return a non-empty string
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);

        // Must start with "R"
        expect(result.startsWith("R")).toBe(true);

        // The numeric portion (after R, strip commas) must be a finite positive number
        const numericStr = result.slice(1).replace(/,/g, "");
        const parsed = parseFloat(numericStr);
        expect(Number.isFinite(parsed)).toBe(true);
        expect(parsed).toBeGreaterThan(0);

        // The formatted value should match cents / 100 to 2 decimal places
        expect(parsed).toBeCloseTo(cents / 100, 2);
      }),
      { numRuns: 1000 }
    );
  });

  it("always formats to exactly 2 decimal places", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000_000 }), (cents) => {
        const result = formatPrice(cents);
        const numericStr = result.slice(1).replace(/,/g, "");

        // Must have exactly 2 decimal places
        const parts = numericStr.split(".");
        expect(parts).toHaveLength(2);
        expect(parts[1]).toHaveLength(2);
      }),
      { numRuns: 500 }
    );
  });

  it("handles zero cents by returning R0.00", () => {
    const result = formatPrice(0);
    expect(result).toBe("R0.00");
  });
});
