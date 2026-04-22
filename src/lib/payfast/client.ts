import crypto from "crypto";

const PAYFAST_URL =
  process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

const PAYFAST_VALIDATE_URL =
  process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

export interface PayFastParams {
  orderId: string;
  orderNumber: string;
  amountCents: number;
  firstName: string;
  lastName: string;
  email: string;
}

export function generatePayFastForm(params: PayFastParams): {
  actionUrl: string;
  fields: Record<string, string>;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const fields: Record<string, string> = {
    merchant_id:   process.env.PAYFAST_MERCHANT_ID!,
    merchant_key:  process.env.PAYFAST_MERCHANT_KEY!,
    return_url:    `${siteUrl}/checkout/success`,
    cancel_url:    `${siteUrl}/checkout/cancel`,
    notify_url:    `${siteUrl}/api/payfast/itn`,
    name_first:    params.firstName,
    name_last:     params.lastName,
    email_address: params.email,
    m_payment_id:  params.orderId,
    amount:        (params.amountCents / 100).toFixed(2),
    item_name:     `Fraviont Order #${params.orderNumber}`,
  };

  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
  const signatureString =
    Object.entries(fields)
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim())}`)
      .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;

  fields.signature = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex");

  return { actionUrl: PAYFAST_URL, fields };
}

export async function verifyITN(body: Record<string, string>): Promise<boolean> {
  const { signature, ...rest } = body;
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";

  const verifyString =
    Object.entries(rest)
      .map(([k, v]) => `${k}=${encodeURIComponent((v ?? "").trim())}`)
      .join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;

  const expectedSig = crypto
    .createHash("md5")
    .update(verifyString)
    .digest("hex");

  if (expectedSig !== signature) return false;

  try {
    const verifyRes = await fetch(PAYFAST_VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });
    const text = await verifyRes.text();
    return text.trim() === "VALID";
  } catch {
    return false;
  }
}
