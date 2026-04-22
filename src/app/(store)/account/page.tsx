import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { formatPrice, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";

async function OrderHistoryData() {
  const orders = await api.orders.getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ash font-sans font-light text-base mb-6">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-iron">
        {["Order", "Date", "Total", "Status"].map((h) => (
          <span key={h} className="text-ash text-xs tracking-[0.14em] uppercase font-sans">
            {h}
          </span>
        ))}
      </div>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-iron/50 hover:bg-charcoal/50 transition-colors"
        >
          <span className="text-ivory text-sm font-sans font-light">{order.orderNumber}</span>
          <span className="text-parchment text-sm font-sans font-light">
            {order.createdAt ? formatDate(order.createdAt) : "—"}
          </span>
          <span className="text-gold-warm text-sm font-sans font-light">
            {formatPrice(order.total)}
          </span>
          <span className="text-parchment text-sm font-sans font-light capitalize">
            {order.status}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="font-display text-ivory font-light text-4xl mb-2">My Account</h1>
        <p className="text-ash font-sans font-light text-sm">{session.user.email}</p>
      </div>

      <div className="mb-8 flex gap-6 border-b border-iron pb-4">
        <Link href="/account" className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
          Orders
        </Link>
        <Link href="/account/profile" className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-ivory transition-colors">
          Profile
        </Link>
      </div>

      <Suspense fallback={<TableSkeleton rows={5} cols={4} />}>
        <OrderHistoryData />
      </Suspense>
    </div>
  );
}
