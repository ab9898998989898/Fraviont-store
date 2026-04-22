"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { api } from "@/trpc/react";
import { formatPrice } from "@/lib/utils";
import { StatusTimeline } from "@/components/admin/StatusTimeline";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const { data: order, isPending, isError, refetch } = api.orders.getById.useQuery({
    id: params.id,
  });

  const updateStatusMutation = api.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      setTrackingNumber("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const addNoteMutation = api.orders.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note saved");
      setNoteInput("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatusMutation.mutate({
      id: params.id,
      status: selectedStatus,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const handleNoteSave = () => {
    if (!noteInput.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    addNoteMutation.mutate({
      id: params.id,
      note: noteInput,
    });
  };

  // Loading state
  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-8" />
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-64 w-full" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-charcoal border border-iron p-8 text-center rounded-none">
        <p className="text-crimson text-sm font-sans mb-4">Failed to load order</p>
        <button
          onClick={() => refetch()}
          className="text-gold-warm text-sm font-sans hover:text-gold-bright transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="bg-charcoal border border-iron p-8 text-center rounded-none">
        <p className="text-ivory text-sm font-sans mb-4">Order not found</p>
        <Link
          href="/admin/orders"
          className="text-gold-warm text-sm font-sans hover:text-gold-bright transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/orders")}
          className="text-ash hover:text-ivory transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display text-ivory font-light text-3xl">
          Order {order.orderNumber}
        </h2>
      </div>

      {/* Order Summary */}
      <div className="bg-charcoal border border-iron p-6 space-y-4 rounded-none">
        <h3 className="font-display text-ivory text-xl font-light">Order Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Customer Email
            </p>
            <p className="text-ivory text-sm font-sans">{order.email}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Order Number
            </p>
            <p className="text-ivory text-sm font-sans">{order.orderNumber}</p>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div>
            <p className="text-ash text-xs uppercase tracking-wider font-sans mb-1">
              Shipping Address
            </p>
            <p className="text-ivory text-sm font-sans">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              )}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Order Totals */}
        <div className="border-t border-graphite pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-parchment text-sm font-sans">Subtotal</span>
            <span className="text-ivory text-sm font-sans">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-parchment text-sm font-sans">Shipping</span>
            <span className="text-ivory text-sm font-sans">
              {formatPrice(order.shippingTotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-parchment text-sm font-sans">Tax</span>
            <span className="text-ivory text-sm font-sans">
              {formatPrice(order.taxTotal)}
            </span>
          </div>
          <div className="flex justify-between border-t border-iron pt-2">
            <span className="text-ivory text-base font-sans font-medium">Total</span>
            <span className="text-ivory text-base font-sans font-medium">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-charcoal border border-iron p-6 rounded-none">
        <h3 className="font-display text-ivory text-xl font-light mb-6">
          Order Status
        </h3>
        <StatusTimeline currentStatus={order.status ?? "pending"} />
      </div>

      {/* Line Items */}
      <div className="bg-charcoal border border-iron rounded-none">
        <div className="p-6 border-b border-iron">
          <h3 className="font-display text-ivory text-xl font-light">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_140px_140px_100px_120px_120px] gap-4 px-6 py-3 border-b border-iron">
            {["Product Name", "SKU", "Variant", "Quantity", "Unit Price", "Line Total"].map(
              (h) => (
                <span
                  key={h}
                  className="text-ash text-xs tracking-[0.14em] uppercase font-sans"
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {/* Table Body */}
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_140px_140px_100px_120px_120px] gap-4 px-6 py-4 border-b border-iron/50"
              >
                <span className="text-ivory text-sm font-sans self-center">
                  {item.name}
                </span>
                <span className="text-parchment text-sm font-sans self-center">
                  {item.sku}
                </span>
                <span className="text-parchment text-sm font-sans self-center">
                  {item.variantId ? "Yes" : "Standard"}
                </span>
                <span className="text-ivory text-sm font-sans self-center">
                  {item.quantity}
                </span>
                <span className="text-ivory text-sm font-sans self-center">
                  {formatPrice(item.unitPrice)}
                </span>
                <span className="text-ivory text-sm font-sans self-center">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-ash text-sm font-sans px-6 py-8 text-center">
              No items found.
            </p>
          )}
        </div>
      </div>

      {/* Status Update Form */}
      <div className="bg-charcoal border border-iron p-6 rounded-none">
        <h3 className="font-display text-ivory text-xl font-light mb-4">
          Update Status
        </h3>
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-ash text-xs uppercase tracking-wider font-sans block mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full bg-obsidian border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="text-ash text-xs uppercase tracking-wider font-sans block mb-2">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full bg-obsidian border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={updateStatusMutation.isPending}
            className="bg-gold-warm text-obsidian px-6 py-2 rounded-none text-sm font-sans hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </button>
        </form>
      </div>

      {/* Notes Section */}
      <div className="bg-charcoal border border-iron p-6 rounded-none">
        <h3 className="font-display text-ivory text-xl font-light mb-4">Notes</h3>
        {order.notes && (
          <div className="bg-obsidian border border-iron p-4 mb-4 rounded-none">
            <p className="text-parchment text-sm font-sans whitespace-pre-wrap">
              {order.notes}
            </p>
          </div>
        )}
        <div className="space-y-4">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Add a note..."
            rows={4}
            className="w-full bg-obsidian border border-iron text-ivory text-sm font-sans px-4 py-2 rounded-none focus:outline-none focus:border-gold-antique transition-colors resize-none"
          />
          <button
            onClick={handleNoteSave}
            disabled={addNoteMutation.isPending || !noteInput.trim()}
            className="bg-gold-warm text-obsidian px-6 py-2 rounded-none text-sm font-sans hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addNoteMutation.isPending ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
