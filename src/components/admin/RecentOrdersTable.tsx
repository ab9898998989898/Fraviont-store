import { formatPrice, formatDate } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";
import type { orders } from "@/server/db/schema";

type Order = InferSelectModel<typeof orders>;

interface RecentOrdersTableProps {
  orders: Order[];
}

export function RecentOrdersTable({ orders: rows }: RecentOrdersTableProps) {
  return (
    <div className="bg-[#171717] border border-[#1E1E1E]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans">
          Recent Orders
        </h3>
      </div>
      <div className="divide-y divide-[#1E1E1E]">
        {rows.length === 0 ? (
          <p className="text-ash text-sm font-sans px-6 py-4">No orders yet.</p>
        ) : (
          rows.map((order) => (
            <div key={order.id} className="grid grid-cols-4 gap-4 px-6 py-3">
              <span className="text-ivory text-xs font-sans font-light truncate">
                {order.orderNumber}
              </span>
              <span className="text-parchment text-xs font-sans truncate">
                {order.email}
              </span>
              <span className="text-parchment text-xs font-sans">
                {order.createdAt ? formatDate(order.createdAt) : "—"}
              </span>
              <span className="text-gold-warm text-xs font-sans">
                {formatPrice(order.total)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
