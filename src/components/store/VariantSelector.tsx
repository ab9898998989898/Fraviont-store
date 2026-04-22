"use client";

import { type InferSelectModel } from "drizzle-orm";
import { type productVariants } from "@/server/db/schema";
import { formatPrice } from "@/lib/utils";

type Variant = InferSelectModel<typeof productVariants>;

interface VariantSelectorProps {
  variants: Variant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">Select Size / Variant</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            disabled={variant.stock === 0}
            className={`px-4 py-2 text-sm font-sans border transition-colors duration-200 ${
              selectedId === variant.id
                ? "border-gold-warm text-gold-warm bg-gold-glow"
                : variant.stock === 0
                ? "border-iron text-ash/40 cursor-not-allowed"
                : "border-iron text-parchment hover:border-gold-antique hover:text-ivory"
            }`}
          >
            {variant.name}
            {variant.price !== null && variant.price !== undefined && (
              <span className="ml-2 text-ash text-xs">
                {formatPrice(variant.price)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
