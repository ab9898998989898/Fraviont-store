"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { animateKPICards } from "@/lib/gsap/animations/admin";
import { KPICardSkeleton } from "@/components/shared/skeletons/KPICardSkeleton";
import { formatPrice } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: "price" | "number";
  currency?: string;
  isLoading?: boolean;
}

export function KPICard({ label, value, previousValue, format = "number", currency = "ZAR", isLoading }: KPICardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (cardRef.current && !isLoading) {
        animateKPICards([cardRef.current]);
      }
    },
    { scope: cardRef, dependencies: [isLoading] }
  );

  if (isLoading) return <KPICardSkeleton />;

  const change =
    previousValue && previousValue > 0
      ? Math.round(((value - previousValue) / previousValue) * 100)
      : null;

  const displayValue = format === "price" ? formatPrice(value, currency) : value.toLocaleString();

  return (
    <div
      ref={cardRef}
      className="bg-[#171717] border border-[#1E1E1E] p-6 space-y-3"
    >
      <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">{label}</p>
      <p
        className="kpi-value text-ivory font-sans font-light text-3xl"
        data-value={value}
      >
        {displayValue}
      </p>
      {change !== null && (
        <div
          className={`flex items-center gap-1 text-xs font-sans ${
            change >= 0 ? "text-emerald" : "text-crimson"
          }`}
        >
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}% vs yesterday</span>
        </div>
      )}
    </div>
  );
}
