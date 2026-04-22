import { NextRequest, NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { orders, orderItems } from "@/server/db/schema";
import { Resend } from "resend";
import { AbandonedCart } from "@/lib/email/templates/AbandonedCart";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find pending orders older than 1 hour
    const abandonedOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.status, "pending"), lte(orders.createdAt, oneHourAgo)));

    let sent = 0;
    for (const order of abandonedOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      if (items.length === 0) continue;

      await resend.emails.send({
        from: "noreply@fraviont.com",
        to: order.email,
        subject: "Your Fraviont cart is waiting",
        react: AbandonedCart({
          customerName: order.email,
          items: items.map((i) => ({
            name: i.name,
            price: i.unitPrice,
            quantity: i.quantity,
          })),
          total: order.total,
        }),
      }).catch(console.error);

      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Abandoned cart cron error:", error);
    return NextResponse.json({ error: "Failed to process abandoned carts" }, { status: 500 });
  }
}
