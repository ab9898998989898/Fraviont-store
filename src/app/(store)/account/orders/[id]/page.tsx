import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { orders, orderItems } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order || order.email !== session.user.email) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <Link
        href="/account"
        className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-warm transition-colors mb-8 inline-block"
      >
        ← Back to Orders
      </Link>

      <div className="mb-10">
        <h1 className="font-display text-ivory font-light text-4xl mb-2">
          Order {order.orderNumber}
        </h1>
        <p className="text-ash font-sans font-light text-sm">
          Placed {order.createdAt ? formatDate(order.createdAt) : "—"} · Status:{" "}
          <span className="text-gold-warm capitalize">{order.status}</span>
        </p>
      </div>

      {/* Items */}
      <div className="space-y-0 mb-10">
        <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-3 border-b border-iron">
          {["Item", "Qty", "Price"].map((h) => (
            <span key={h} className="text-ash text-xs tracking-[0.14em] uppercase font-sans">
              {h}
            </span>
          ))}
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-4 border-b border-iron/50"
          >
            <div>
              <p className="text-ivory text-sm font-sans font-light">{item.name}</p>
              <p className="text-ash text-xs font-sans">{item.sku}</p>
            </div>
            <span className="text-parchment text-sm font-sans">{item.quantity}</span>
            <span className="text-gold-warm text-sm font-sans">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-end">
        <div className="space-y-2 text-right">
          <div className="flex gap-8 justify-between">
            <span className="text-ash text-sm font-sans">Subtotal</span>
            <span className="text-parchment text-sm font-sans">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex gap-8 justify-between border-t border-iron pt-2">
            <span className="text-ash text-sm font-sans uppercase tracking-[0.1em]">Total</span>
            <span className="text-gold-warm font-sans text-lg font-light">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
