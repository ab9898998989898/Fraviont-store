import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { orders, orderItems } from "@/server/db/schema";
import { generatePayFastForm } from "@/lib/payfast/client";
import { generateOrderNumber } from "@/lib/utils";

const CheckoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default("ZA"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        name: z.string(),
        sku: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().positive(),
        image: z.string().optional(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const data = CheckoutSchema.parse(body);

    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const total = subtotal; // No tax/shipping for now
    const orderNumber = generateOrderNumber();

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        email: data.email,
        status: "pending",
        paymentStatus: "pending",
        subtotal,
        total,
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          line1: data.address.line1,
          line2: data.address.line2,
          city: data.address.city,
          province: data.address.province,
          postalCode: data.address.postalCode,
          country: data.address.country,
        },
      })
      .returning();

    if (!order) throw new Error("Failed to create order");

    await db.insert(orderItems).values(
      data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        image: item.image,
      }))
    );

    const { actionUrl, fields } = generatePayFastForm({
      orderId: order.id,
      orderNumber,
      amountCents: total,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });

    return NextResponse.json({ actionUrl, fields });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
