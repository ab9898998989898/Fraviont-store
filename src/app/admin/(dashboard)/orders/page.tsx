"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

const ITEMS_PER_PAGE = 20;

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "";

export default function OrdersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<OrderStatus>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isPending, isError, refetch } = api.orders.getAll.useQuery({
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const handleView = (id: string) => {
    router.push(`/admin/orders/${id}`);
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-ivory font-light text-3xl">Orders</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
          <input
            type="text"
            placeholder="Search by order number or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-charcoal border border-iron text-ivory text-sm font-sans pl-10 pr-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus);
            setPage(1);
          }}
          className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        {/* Date From */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
          placeholder="Date from"
        />

        {/* Date To */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
          placeholder="Date to"
        />
      </div>

      {/* Table */}
      {isPending ? (
        <TableSkeleton rows={20} cols={7} />
      ) : isError ? (
        <div className="bg-charcoal border border-iron p-8 text-center rounded-none">
          <p className="text-crimson text-sm font-sans mb-4">Failed to load orders</p>
          <button
            onClick={() => refetch()}
            className="text-gold-warm text-sm font-sans hover:text-gold-bright transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="bg-charcoal border border-iron rounded-none">
            {/* Table Header */}
            <div className="grid grid-cols-[140px_1fr_120px_120px_120px_120px_100px] gap-4 px-6 py-3 border-b border-iron">
              {[
                "Order Number",
                "Customer Email",
                "Total",
                "Order Status",
                "Payment Status",
                "Created",
                "Actions",
              ].map((h) => (
                <span
                  key={h}
                  className="text-ash text-xs tracking-[0.14em] uppercase font-sans"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Table Body */}
            {!data?.orders || data.orders.length === 0 ? (
              <p className="text-ash text-sm font-sans px-6 py-8 text-center">
                No orders found.
              </p>
            ) : (
              data.orders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[140px_1fr_120px_120px_120px_120px_100px] gap-4 px-6 py-4 border-b border-iron/50 hover:bg-graphite transition-colors"
                >
                  {/* Order Number */}
                  <span className="text-ivory text-sm font-sans self-center">
                    {order.orderNumber}
                  </span>

                  {/* Customer Email */}
                  <div className="min-w-0 self-center">
                    <p className="text-parchment text-sm font-sans truncate">
                      {order.email}
                    </p>
                  </div>

                  {/* Total */}
                  <span className="text-ivory text-sm font-sans self-center">
                    {formatPrice(order.total)}
                  </span>

                  {/* Order Status */}
                  <div className="self-center">
                    <StatusBadge status={order.status ?? "pending"} />
                  </div>

                  {/* Payment Status */}
                  <span className="text-parchment text-sm font-sans capitalize self-center">
                    {order.paymentStatus}
                  </span>

                  {/* Created Date */}
                  <span className="text-parchment text-xs font-sans self-center">
                    {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 self-center">
                    <button
                      onClick={() => handleView(order.id)}
                      className="text-gold-warm text-xs font-sans hover:text-gold-bright transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-ash text-sm font-sans">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none hover:border-gold-antique transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none hover:border-gold-antique transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
