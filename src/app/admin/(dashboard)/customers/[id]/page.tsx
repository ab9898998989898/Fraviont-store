"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/trpc/react";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { data: customer, isPending, isError, refetch } = api.customers.getById.useQuery({
    id: params.id,
  });

  // Loading state
  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-8" />
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-[#111111] border border-graphite p-8 text-center">
        <p className="text-crimson text-sm font-sans mb-4">Failed to load customer</p>
        <button
          onClick={() => refetch()}
          className="text-gold-warm text-sm font-sans hover:text-gold-warm/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Not found state
  if (!customer) {
    return (
      <div className="bg-[#111111] border border-graphite p-8 text-center">
        <p className="text-ivory text-sm font-sans mb-4">Customer not found</p>
        <Link
          href="/admin/customers"
          className="text-gold-warm text-sm font-sans hover:text-gold-warm/80 transition-colors"
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/customers")}
          className="text-ash hover:text-ivory transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display text-ivory font-light text-3xl">
          {customer.name || "Customer"}
        </h2>
      </div>

      {/* Customer Profile */}
      <div className="bg-[#111111] border border-graphite p-6 space-y-4">
        <h3 className="font-display text-ivory text-xl font-light">Customer Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Name
            </p>
            <p className="text-ivory text-sm font-sans">{customer.name || "—"}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Email
            </p>
            <p className="text-ivory text-sm font-sans">{customer.email}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Phone
            </p>
            <p className="text-ivory text-sm font-sans">{customer.phone || "—"}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Total Orders
            </p>
            <p className="text-ivory text-sm font-sans">{customer.totalOrders ?? 0}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Total Spent
            </p>
            <p className="text-ivory text-sm font-sans">
              {formatPrice(customer.totalSpent ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-[#111111] border border-graphite">
        <div className="p-6 border-b border-graphite">
          <h3 className="font-display text-ivory text-xl font-light">Order History</h3>
        </div>

        {!customer.orders || customer.orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-ash text-sm font-sans">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_140px_140px_120px_100px] gap-4 px-6 py-3 border-b border-graphite">
              {["Order Number", "Status", "Total", "Date", "Actions"].map((h) => (
                <span
                  key={h}
                  className="text-ash text-xs tracking-[0.14em] uppercase font-sans"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Table Body */}
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[2fr_140px_140px_120px_100px] gap-4 px-6 py-4 border-b border-graphite/50 hover:bg-[#161616] transition-colors"
              >
                {/* Order Number */}
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-gold-warm text-sm font-sans self-center hover:text-gold-warm/80 transition-colors"
                >
                  {order.orderNumber}
                </Link>

                {/* Status */}
                <div className="self-center">
                  <StatusBadge status={order.status ?? "pending"} />
                </div>

                {/* Total */}
                <span className="text-ivory text-sm font-sans self-center">
                  {formatPrice(order.total)}
                </span>

                {/* Date */}
                <span className="text-parchment text-xs font-sans self-center">
                  {order.createdAt ? formatDate(order.createdAt) : "—"}
                </span>

                {/* Actions */}
                <div className="flex gap-2 self-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-gold-warm text-xs font-sans hover:text-gold-warm/80 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
