"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";

const ITEMS_PER_PAGE = 20;

export default function CustomersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isPending, isError, refetch } = api.customers.getAll.useQuery({
    search: debouncedSearch || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const handleView = (id: string) => {
    router.push(`/admin/customers/${id}`);
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-ivory font-light text-3xl">Customers</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#111111] border border-graphite text-ivory text-sm font-sans pl-10 pr-4 py-2 focus:outline-none focus:border-gold-warm/50"
          />
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <TableSkeleton rows={20} cols={6} />
      ) : isError ? (
        <div className="bg-[#111111] border border-graphite p-8 text-center">
          <p className="text-crimson text-sm font-sans mb-4">Failed to load customers</p>
          <button
            onClick={() => refetch()}
            className="text-gold-warm text-sm font-sans hover:text-gold-warm/80 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#111111] border border-graphite">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_2fr_140px_140px_120px_100px] gap-4 px-6 py-3 border-b border-graphite">
              {[
                "Name",
                "Email",
                "Total Orders",
                "Total Spent",
                "Registered",
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
            {!data?.customers || data.customers.length === 0 ? (
              <p className="text-ash text-sm font-sans px-6 py-8 text-center">
                No customers found.
              </p>
            ) : (
              data.customers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-[2fr_2fr_140px_140px_120px_100px] gap-4 px-6 py-4 border-b border-graphite/50 hover:bg-[#161616] transition-colors"
                >
                  {/* Name */}
                  <span className="text-ivory text-sm font-sans self-center truncate">
                    {customer.name}
                  </span>

                  {/* Email */}
                  <div className="min-w-0 self-center">
                    <p className="text-parchment text-sm font-sans truncate">
                      {customer.email}
                    </p>
                  </div>

                  {/* Total Orders */}
                  <span className="text-ivory text-sm font-sans self-center">
                    {customer.totalOrders ?? 0}
                  </span>

                  {/* Total Spent */}
                  <span className="text-ivory text-sm font-sans self-center">
                    {formatPrice(customer.totalSpent ?? 0)}
                  </span>

                  {/* Registered Date */}
                  <span className="text-parchment text-xs font-sans self-center">
                    {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 self-center">
                    <button
                      onClick={() => handleView(customer.id)}
                      className="text-gold-warm text-xs font-sans hover:text-gold-warm/80 transition-colors"
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
                  className="bg-[#111111] border border-graphite text-ivory text-sm font-sans px-4 py-2 hover:border-gold-warm/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-[#111111] border border-graphite text-ivory text-sm font-sans px-4 py-2 hover:border-gold-warm/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
