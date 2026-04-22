import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyITN } from "@/lib/payfast/client";
import { db } from "@/server/db";
import { orders, orderItems } from "@/server/db/schema";
import { Resend } from "resend";
import { OrderConfirmation } from "@/lib/email/templates/OrderConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const body: Record<string, string> = {};
  formData.forEach((value, key) => {
    body[key] = value.toString();
  });

  const isValid = await verifyITN(body);
  if (!isValid) {
    return new NextResponse("Invalid", { status: 400 });
  }

  const { m_payment_id, payment_status } = body;

  if (payment_status === "COMPLETE" && m_payment_id) {
    const [order] = await db
      .update(orders)
      .set({ status: "confirmed", paymentStatus: "paid" })
      .where(eq(orders.id, m_payment_id))
      .returning();

    // Send order confirmation email (fire-and-forget)
    if (order) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      resend.emails.send({
        from: "noreply@fraviont.com",
        to: order.email,
        subject: `Order Confirmed — ${order.orderNumber}`,
        react: OrderConfirmation({
          orderNumber: order.orderNumber,
          customerName: order.email,
          items: items.map((i) => ({
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
          })),
          subtotal: order.subtotal,
          total: order.total,
        }),
      }).catch(console.error);
    }
  }

  return new NextResponse("OK", { status: 200 });
}
