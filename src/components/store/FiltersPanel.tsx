"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Perfumes", value: "perfumes" },
  { label: "Cosmetics", value: "cosmetics" },
  { label: "Jewelry", value: "jewelry" },
  { label: "Gift Sets", value: "gift_sets" },
];

export function FiltersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "";

  const setCategory = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("category", value);
      } else {
        params.delete("category");
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={`text-xs tracking-[0.14em] uppercase font-sans px-4 py-2 border transition-colors duration-200 ${
            currentCategory === cat.value
              ? "border-gold-warm text-gold-warm bg-gold-glow"
              : "border-iron text-ash hover:border-gold-antique hover:text-parchment"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
