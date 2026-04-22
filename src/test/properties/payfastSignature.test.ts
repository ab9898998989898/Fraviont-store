import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generatePayFastForm, type PayFastParams } from "@/lib/payfast/client";

/**
 * Arbitrary for generating valid PayFastParams.
 */
const payFastParamsArb: fc.Arbitrary<PayFastParams> = fc.record({
  orderId: fc.uuid(),
  orderNumber: fc.stringMatching(/^FRV-\d{8}-[A-Z0-9]{4}$/),
  amountCents: fc.integer({ min: 100, max: 100_000_00 }), // R1.00 to R100,000.00
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  email: fc.emailAddress(),
});

describe("Property: PayFast Signature Generation", () => {
  it("produces a 32-character lowercase hex signature for any valid params", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const result = generatePayFastForm(params);

        // Signature must exist and be a 32-char lowercase hex string (MD5)
        expect(result.fields.signature).toBeDefined();
        expect(result.fields.signature).toMatch(/^[a-f0-9]{32}$/);
      }),
      { numRuns: 500 }
    );
  });

  it("includes all required fields in the output", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const result = generatePayFastForm(params);

        const requiredFields = [
          "merchant_id",
          "merchant_key",
          "return_url",
          "cancel_url",
          "notify_url",
          "name_first",
          "name_last",
          "email_address",
          "m_payment_id",
          "amount",
          "item_name",
          "signature",
        ];

        for (const field of requiredFields) {
          expect(result.fields[field]).toBeDefined();
          expect(typeof result.fields[field]).toBe("string");
          expect(result.fields[field].length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("returns the correct actionUrl based on sandbox setting", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const result = generatePayFastForm(params);

        // Since PAYFAST_SANDBOX=true in test setup
        expect(result.actionUrl).toBe(
          "https://sandbox.payfast.co.za/eng/process"
        );
      }),
      { numRuns: 10 }
    );
  });

  it("formats amount as rands with 2 decimal places", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const result = generatePayFastForm(params);
        const amount = result.fields.amount;

        // Must have exactly 2 decimal places
        expect(amount).toMatch(/^\d+\.\d{2}$/);

        // Amount in rands should equal cents / 100
        const parsed = parseFloat(amount);
        expect(parsed).toBeCloseTo(params.amountCents / 100, 2);
      }),
      { numRuns: 500 }
    );
  });
});
