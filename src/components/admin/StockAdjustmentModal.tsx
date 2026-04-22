"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

const AdjustSchema = z.object({
  type: z.enum(["restock", "sale", "adjustment", "return"]),
  quantityChange: z.number().int(),
  note: z.string().optional(),
});

type AdjustFormData = z.infer<typeof AdjustSchema>;

interface StockAdjustmentModalProps {
  variantId: string;
  variantName: string;
  currentStock: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockAdjustmentModal({
  variantId,
  variantName,
  currentStock,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdjustFormData>({
    resolver: zodResolver(AdjustSchema),
    defaultValues: { type: "restock", quantityChange: 0 },
  });

  const adjustMutation = api.inventory.adjust.useMutation({
    onSuccess: () => {
      toast.success("Stock adjusted");
      onSuccess();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  async function onSubmit(data: AdjustFormData) {
    await adjustMutation.mutateAsync({ variantId, ...data });
  }

  const inputClass =
    "w-full bg-transparent border border-[#2A2A2A] text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors";
  const labelClass =
    "text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2";

  return (
    <>
      <div className="fixed inset-0 z-[300] bg-obsidian/70" onClick={onClose} />
      <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#1E1E1E] w-full max-w-md p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-ivory text-sm tracking-[0.1em] uppercase font-sans">
              Adjust Stock
            </h3>
            <button
              onClick={onClose}
              className="text-ash hover:text-ivory transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-parchment text-sm font-sans font-light">{variantName}</p>
            <p className="text-ash text-xs font-sans">Current stock: {currentStock}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={labelClass}>Type</label>
              <select {...register("type")} className={inputClass}>
                <option className="bg-black" value="restock">Restock</option>
                <option className="bg-black" value="adjustment">Adjustment</option>
                <option className="bg-black" value="return">Return</option>
                <option className="bg-black" value="sale">Sale</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity Change</label>
              <input
                {...register("quantityChange", { valueAsNumber: true })}
                type="number"
                className={inputClass}
                placeholder="e.g. +10 or -5"
              />
              {errors.quantityChange && (
                <p className="text-crimson text-xs font-sans mt-1">
                  {errors.quantityChange.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Note (optional)</label>
              <input
                {...register("note")}
                className={inputClass}
                placeholder="Reason for adjustment"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-6 py-3 hover:bg-gold-bright transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Adjust
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-ivory transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
