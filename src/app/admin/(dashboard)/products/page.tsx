"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Search, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice, formatDate } from "@/lib/utils";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";

const ITEMS_PER_PAGE = 20;

type Category = "perfumes" | "cosmetics" | "jewelry" | "gift_sets" | "";
type StatusFilter = "all" | "active" | "inactive";

export default function ProductsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<Category>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isPending, isError, refetch } = api.products.getAll.useQuery({
    search: debouncedSearch || undefined,
    category: category || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const deleteMutation = api.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deactivated");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleDeactivate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleNewProduct = () => {
    router.push("/admin/products/new");
  };

  // Client-side status filtering (since API only returns active products)
  const filteredProducts = data?.products.filter((product) => {
    if (statusFilter === "active") return product.isActive;
    if (statusFilter === "inactive") return !product.isActive;
    return true;
  }) ?? [];

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-ivory font-light text-3xl">Products</h2>
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-gold-warm text-obsidian px-4 py-2 rounded-none text-sm font-sans hover:bg-gold-bright transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ash" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-charcoal border border-iron text-ivory text-sm font-sans pl-10 pr-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category);
            setPage(1);
          }}
          className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
        >
          <option value="">All Categories</option>
          <option value="perfumes">Perfumes</option>
          <option value="cosmetics">Cosmetics</option>
          <option value="jewelry">Jewelry</option>
          <option value="gift_sets">Gift Sets</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="bg-charcoal border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {isPending ? (
        <TableSkeleton rows={20} cols={7} />
      ) : isError ? (
        <div className="bg-charcoal border border-iron p-8 text-center rounded-none">
          <p className="text-crimson text-sm font-sans mb-4">Failed to load products</p>
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
            <div className="grid grid-cols-[80px_2fr_1fr_1fr_100px_120px_140px] gap-4 px-6 py-3 border-b border-iron">
              {["Image", "Name", "Category", "Price", "Status", "Created", "Actions"].map((h) => (
                <span
                  key={h}
                  className="text-ash text-xs tracking-[0.14em] uppercase font-sans"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Table Body */}
            {filteredProducts.length === 0 ? (
              <p className="text-ash text-sm font-sans px-6 py-8 text-center">
                No products found.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[80px_2fr_1fr_1fr_100px_120px_140px] gap-4 px-6 py-4 border-b border-iron/50 hover:bg-graphite transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-ash text-xs">No image</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 self-center">
                    <p className="text-ivory text-sm font-sans font-light truncate">
                      {product.name}
                    </p>
                  </div>

                  {/* Category */}
                  <span className="text-parchment text-sm font-sans capitalize self-center">
                    {product.category.replace("_", " ")}
                  </span>

                  {/* Price */}
                  <span className="text-ivory text-sm font-sans self-center">
                    {formatPrice(product.price)}
                  </span>

                  {/* Status */}
                  <div className="self-center">
                    <span
                      className={`text-xs font-sans px-2 py-1 rounded-none ${
                        product.isActive
                          ? "bg-emerald/20 text-emerald"
                          : "bg-ash/20 text-ash"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Created Date */}
                  <span className="text-parchment text-xs font-sans self-center">
                    {product.createdAt ? formatDate(product.createdAt) : "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 self-center">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="text-gold-warm text-xs font-sans hover:text-gold-bright transition-colors"
                    >
                      Edit
                    </button>
                    {product.isActive && (
                      <>
                        <span className="text-ash">|</span>
                        <button
                          onClick={() => handleDeactivate(product.id, product.name)}
                          disabled={deleteMutation.isPending}
                          className="text-crimson text-xs font-sans hover:brightness-125 transition-colors disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      </>
                    )}
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
