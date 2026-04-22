"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { StockAdjustmentModal } from "./StockAdjustmentModal";

interface InventoryVariant {
  id: string;
  sku: string;
  name: string;
  stock: number;
  lowStockThreshold: number | null;
  updatedAt: Date | null;
  productName: string | null;
  productCategory: string | null;
}

interface InventoryTableProps {
  variants: InventoryVariant[];
}

export function InventoryTable({ variants }: InventoryTableProps) {
  const router = useRouter();
  const [adjustingVariant, setAdjustingVariant] = useState<InventoryVariant | null>(null);

  function getStockStyle(stock: number, threshold: number | null) {
    if (stock === 0) return "bg-crimson/20 text-crimson";
    if (threshold !== null && stock <= threshold) return "bg-amber/20 text-amber";
    return "bg-emerald/20 text-emerald";
  }

  return (
    <>
      <div className="bg-[#111111] border border-[#1E1E1E]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-[#1E1E1E]">
          {["Product / SKU", "Category", "Stock", "Last Updated", ""].map((h) => (
            <span
              key={h}
              className="text-ash text-xs tracking-[0.14em] uppercase font-sans"
            >
              {h}
            </span>
          ))}
        </div>
        {variants.length === 0 ? (
          <p className="text-ash text-sm font-sans px-6 py-8 text-center">
            No variants found.
          </p>
        ) : (
          variants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-[#1E1E1E]/50 hover:bg-[#161616] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-ivory text-sm font-sans font-light truncate">
                  {v.productName} — {v.name}
                </p>
                <p className="text-ash text-xs font-sans">{v.sku}</p>
              </div>
              <span className="text-parchment text-sm font-sans capitalize self-center">
                {v.productCategory}
              </span>
              <span
                className={`text-xs font-sans self-center px-2 py-1 w-fit ${getStockStyle(v.stock, v.lowStockThreshold)}`}
              >
                {v.stock} units
              </span>
              <span className="text-parchment text-xs font-sans self-center">
                {v.updatedAt ? formatDate(v.updatedAt) : "—"}
              </span>
              <button
                onClick={() => setAdjustingVariant(v)}
                className="text-ash text-xs font-sans hover:text-gold-warm transition-colors self-center"
              >
                Adjust →
              </button>
            </div>
          ))
        )}
      </div>

      {adjustingVariant && (
        <StockAdjustmentModal
          variantId={adjustingVariant.id}
          variantName={`${adjustingVariant.productName ?? ""} — ${adjustingVariant.name}`}
          currentStock={adjustingVariant.stock}
          onClose={() => setAdjustingVariant(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
