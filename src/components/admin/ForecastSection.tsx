"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-crimson/20 text-crimson",
  high:     "bg-amber/20 text-amber",
  medium:   "bg-sapphire/20 text-sapphire",
  low:      "bg-emerald/20 text-emerald",
};

export function ForecastSection() {
  const { data: forecast, isPending } = api.ai.getForecast.useQuery();

  return (
    <div className="bg-[#111111] border border-[#1E1E1E]">
      <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center justify-between">
        <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans">
          AI Restock Forecast
        </h3>
        <span className="text-ash text-[10px] font-sans">Based on last 90 days</span>
      </div>

      {isPending && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 size={16} className="text-gold-warm animate-spin" />
          <span className="text-ash text-sm font-sans">Generating forecast...</span>
        </div>
      )}

      {forecast && forecast.length === 0 && !isPending && (
        <p className="text-ash text-sm font-sans px-6 py-4">
          All stock levels look healthy — no restock needed.
        </p>
      )}

      {forecast && forecast.length > 0 && (
        <div className="divide-y divide-[#1E1E1E]">
          {forecast.map((item, i) => (
            <div key={i} className="px-6 py-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-ivory text-sm font-sans font-light">{item.variantSku}</p>
                <span className={`text-xs font-sans px-2 py-1 capitalize ${URGENCY_STYLES[item.urgency] ?? "bg-iron/20 text-ash"}`}>
                  {item.urgency}
                </span>
              </div>
              <div className="flex gap-6 text-xs font-sans text-ash">
                <span>Current: {item.currentStock}</span>
                <span>Suggested reorder: {item.suggestedReorder}</span>
              </div>
              <p className="text-parchment text-xs font-sans font-light">{item.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
