"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { api } from "@/trpc/react";
import { formatPrice } from "@/lib/utils";
import { StatusTimeline } from "@/components/admin/StatusTimeline";

// Simple local type for Address to avoid 'any' and complex imports
interface OrderAddress {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const { data: order, isPending, isError, refetch } = api.orders.getById.useQuery({
    id,
  });

  const updateStatusMutation = api.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      setTrackingNumber("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePaymentStatusMutation = api.orders.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Payment status updated");
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
      id,
      status: selectedStatus,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const handlePaymentStatusUpdate = (status: "pending" | "paid" | "failed" | "refunded") => {
    updatePaymentStatusMutation.mutate({
      id,
      paymentStatus: status,
    });
  };

  const handleNoteSave = () => {
    if (!noteInput.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    addNoteMutation.mutate({
      id,
      note: noteInput,
    });
  };

  if (isPending) return <div className="p-8 text-ash">Loading order...</div>;
  if (isError || !order) return <div className="p-8 text-crimson">Order not found.</div>;

  const addr = order.shippingAddress as unknown as OrderAddress;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/orders")} className="text-ash hover:text-ivory">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display text-ivory font-light text-3xl">
          Order {order.orderNumber}
        </h2>
      </div>

      <div className="bg-charcoal border border-iron p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-ash text-xs uppercase tracking-wider mb-1">Customer</p>
            <p className="text-ivory text-sm">{order.email}</p>
          </div>
          <div>
            <p className="text-ash text-xs uppercase tracking-wider mb-1">Total</p>
            <p className="text-gold-warm text-sm">{formatPrice(order.total)}</p>
          </div>
        </div>
        
        {addr && (
          <div>
            <p className="text-ash text-xs uppercase tracking-wider mb-1">Shipping Address</p>
            <p className="text-ivory text-sm">
              {addr.firstName} {addr.lastName}<br/>
              {addr.line1}, {addr.city}
            </p>
          </div>
        )}
      </div>

      <div className="bg-charcoal border border-iron p-6">
        <h3 className="text-ivory text-xs uppercase tracking-widest mb-6">Status Timeline</h3>
        <StatusTimeline currentStatus={order.status ?? "pending"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-charcoal border border-iron p-6">
          <h3 className="text-ivory text-xs uppercase tracking-widest mb-4">Order Status</h3>
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full bg-obsidian border border-iron text-ivory text-sm px-4 py-2"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking Number"
              className="w-full bg-obsidian border border-iron text-ivory text-sm px-4 py-2"
            />
            <button className="bg-gold-warm text-obsidian px-6 py-2 text-sm uppercase tracking-widest disabled:opacity-50" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </button>
          </form>
        </div>

        <div className="bg-charcoal border border-iron p-6">
          <h3 className="text-ivory text-xs uppercase tracking-widest mb-4">Payment Status</h3>
          <div className="flex flex-wrap gap-2">
            {(["pending", "paid", "failed", "refunded"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handlePaymentStatusUpdate(s)}
                disabled={order.paymentStatus === s || updatePaymentStatusMutation.isPending}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                  order.paymentStatus === s ? "border-gold-warm text-gold-warm bg-gold-warm/10" : "border-iron text-ash"
                } disabled:opacity-50`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-charcoal border border-iron p-6">
        <h3 className="text-ivory text-xs uppercase tracking-widest mb-4">Internal Notes</h3>
        {order.notes && <p className="text-ash text-sm mb-4 italic">&quot;{order.notes}&quot;</p>}
        <textarea
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Add a private note..."
          className="w-full bg-obsidian border border-iron text-ivory text-sm px-4 py-2 mb-4"
          rows={3}
        />
        <button onClick={handleNoteSave} className="border border-gold-warm text-gold-warm px-6 py-2 text-sm uppercase tracking-widest disabled:opacity-50" disabled={addNoteMutation.isPending}>
          {addNoteMutation.isPending ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
