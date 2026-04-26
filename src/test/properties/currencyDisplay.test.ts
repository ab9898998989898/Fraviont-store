/**
 * Bug Condition Exploration Test: Currency Display (Task 1.6)
 *
 * This test verifies that formatPrice supports a currency parameter and returns
 * the correct symbol for each currency. On UNFIXED code, formatPrice ignores
 * the currency argument and always returns "R..." (ZAR hardcoded).
 *
 * EXPECTED OUTCOME: Test FAILS on unfixed code.
 * Counterexample: formatPrice(285, 'USD') returns "R2.85" instead of "$2.85"
 *
 * Validates: Requirements 1.8, 1.9
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatPrice } from "@/lib/utils";

// Currency symbol mapping that the fixed implementation should support
const CURRENCY_SYMBOLS: Record<string, string> = {
  ZAR: "R",
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "₨",
};

describe("Bug Condition: Currency Display - formatPrice currency parameter", () => {
  /**
   * Concrete failing case: formatPrice(285, 'USD') must return "$2.85"
   * On unfixed code this returns "R2.85" — the counterexample that proves the bug.
   *
   * Validates: Requirements 1.8, 1.9
   */
  it("formatPrice(285, 'USD') returns '$2.85' not 'R2.85'", () => {
    // @ts-expect-error — unfixed formatPrice has no currency param; this call surfaces the bug
    const result = formatPrice(285, "USD");
    // On unfixed code: result === "R2.85"  → test FAILS (confirms bug)
    // On fixed code:   result === "$2.85"  → test PASSES
    expect(result).toBe("$2.85");
  });

  /**
   * Property: for every supported non-ZAR currency, formatPrice must NOT start with "R".
   * On unfixed code the function always starts with "R", so this property fails for USD/EUR/GBP/PKR.
   *
   * Validates: Requirements 1.8, 1.9
   */
  it("Property: formatPrice with non-ZAR currency never starts with 'R'", () => {
    const nonZarCurrencies = fc.constantFrom("USD", "EUR", "GBP", "PKR");
    const positiveCents = fc.integer({ min: 1, max: 10_000_000 });

    fc.assert(
      fc.property(positiveCents, nonZarCurrencies, (cents, currency) => {
        // @ts-expect-error — unfixed formatPrice has no currency param
        const result: string = formatPrice(cents, currency);
        const expectedSymbol = CURRENCY_SYMBOLS[currency]!;

        // Must start with the correct symbol, not "R"
        expect(result.startsWith(expectedSymbol)).toBe(true);
        expect(result.startsWith("R")).toBe(false);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Property: for every supported currency, formatPrice must start with the correct symbol.
   *
   * Validates: Requirements 1.8, 1.9
   */
  it("Property: formatPrice uses correct symbol for each supported currency", () => {
    const supportedCurrencies = fc.constantFrom(
      "ZAR",
      "USD",
      "EUR",
      "GBP",
      "PKR"
    );
    const positiveCents = fc.integer({ min: 1, max: 10_000_000 });

    fc.assert(
      fc.property(positiveCents, supportedCurrencies, (cents, currency) => {
        // @ts-expect-error — unfixed formatPrice has no currency param
        const result: string = formatPrice(cents, currency);
        const expectedSymbol = CURRENCY_SYMBOLS[currency]!;

        // Must start with the correct symbol for the given currency
        expect(result.startsWith(expectedSymbol)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Preservation: ZAR (default) output must be identical to original function.
   * This property should PASS on both unfixed and fixed code.
   *
   * Validates: Requirements 1.8 (preservation of ZAR default)
   */
  it("Property: formatPrice with ZAR currency preserves original 'R' prefix output", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        (cents) => {
          // @ts-expect-error — unfixed formatPrice has no currency param; ZAR is the default
          const withCurrency: string = formatPrice(cents, "ZAR");
          const withoutCurrency: string = formatPrice(cents);

          // ZAR output must match the original (no-arg) call
          expect(withCurrency).toBe(withoutCurrency);
          expect(withCurrency.startsWith("R")).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});
