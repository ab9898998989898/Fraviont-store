"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { animateChartReveal } from "@/lib/gsap/animations/admin";
import { formatPrice } from "@/lib/utils";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  currency?: string;
}

export function RevenueChart({ data, currency = "ZAR" }: RevenueChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (wrapperRef.current) animateChartReveal(wrapperRef.current);
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="bg-[#171717] border border-[#1E1E1E] p-6">
      <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-6">
        Revenue
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#7A7470", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#7A7470", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatPrice(v, currency)}
          />
          <Tooltip
            contentStyle={{
              background: "#1E1E1E",
              border: "1px solid #2A2A2A",
              borderRadius: 0,
              color: "#F5F0E8",
              fontSize: 12,
            }}
            formatter={(value: number) => [formatPrice(value, currency), "Revenue"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#C9A84C"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
