import { describe, it, expect } from "vitest";
import fc from "fast-check";
import crypto from "crypto";
import { generatePayFastForm, type PayFastParams } from "@/lib/payfast/client";

/**
 * Arbitrary for generating valid PayFastParams.
 */
const payFastParamsArb: fc.Arbitrary<PayFastParams> = fc.record({
  orderId: fc.uuid(),
  orderNumber: fc.stringMatching(/^FRV-\d{8}-[A-Z0-9]{4}$/),
  amountCents: fc.integer({ min: 100, max: 100_000_00 }),
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  email: fc.emailAddress(),
});

/**
 * Simulates the local MD5 verification step of verifyITN.
 * We cannot test the full verifyITN because it makes an HTTP call to PayFast,
 * but we can verify the signature round-trip locally.
 */
function localVerifySignature(
  fields: Record<string, string>,
  passphrase: string
): boolean {
  const { signature, ...rest } = fields;

  const verifyString =
    Object.entries(rest)
      .map(([k, v]) => `${k}=${encodeURIComponent((v ?? "").trim())}`)
      .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;

  const expectedSig = crypto
    .createHash("md5")
    .update(verifyString)
    .digest("hex");

  return expectedSig === signature;
}

describe("Property: PayFast ITN Verification Round-Trip", () => {
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "test_passphrase_123";

  it("generated signature passes local MD5 verification for any valid params", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const { fields } = generatePayFastForm(params);

        // The generated signature must pass local verification
        const isValid = localVerifySignature(fields, passphrase);
        expect(isValid).toBe(true);
      }),
      { numRuns: 500 }
    );
  });

  it("tampered amount field causes verification to fail", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const { fields } = generatePayFastForm(params);

        // Tamper with the amount field
        const tamperedFields = {
          ...fields,
          amount: (parseFloat(fields.amount) + 1).toFixed(2),
        };

        const isValid = localVerifySignature(tamperedFields, passphrase);
        expect(isValid).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("tampered email field causes verification to fail", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const { fields } = generatePayFastForm(params);

        // Tamper with the email field
        const tamperedFields = {
          ...fields,
          email_address: "tampered@evil.com",
        };

        const isValid = localVerifySignature(tamperedFields, passphrase);
        expect(isValid).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("wrong passphrase causes verification to fail", () => {
    fc.assert(
      fc.property(payFastParamsArb, (params) => {
        const { fields } = generatePayFastForm(params);

        // Use a wrong passphrase for verification
        const isValid = localVerifySignature(fields, "wrong_passphrase");
        expect(isValid).toBe(false);
      }),
      { numRuns: 200 }
    );
  });
});
