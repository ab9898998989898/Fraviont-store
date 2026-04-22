"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatPrice } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TABS = ["Revenue", "Orders", "Products", "Customers", "Finance"] as const;
type Tab = (typeof TABS)[number];

const PERIOD_OPTIONS = ["7d", "30d", "90d", "12m"] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

const CHART_COLORS = ["#C9A84C", "#A68B3D", "#7A6228", "#E8C97A", "#F5F0E8"];

const tooltipStyle = {
  contentStyle: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: 0,
    color: "#F5F0E8",
    fontSize: 12,
  },
};

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Revenue");
  const [period, setPeriod] = useState<Period>("30d");

  const { data: revenueData } = api.analytics.getRevenue.useQuery({ period });
  const { data: orderStats } = api.analytics.getOrderStats.useQuery();
  const { data: topProducts } = api.analytics.getTopProducts.useQuery({ limit: 10 });
  const { data: customerStats } = api.analytics.getCustomerStats.useQuery();
  const { data: pnl } = api.analytics.getPnL.useQuery();

  return (
    <div>
      <h2 className="font-display text-ivory font-light text-3xl mb-8">Analytics</h2>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#1E1E1E] mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs tracking-[0.14em] uppercase font-sans transition-colors ${
              activeTab === tab
                ? "text-gold-warm border-b-2 border-gold-warm -mb-px"
                : "text-ash hover:text-parchment"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === "Revenue" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs tracking-[0.14em] uppercase font-sans border transition-colors ${
                  period === p
                    ? "border-gold-warm text-gold-warm"
                    : "border-iron text-ash hover:border-smoke hover:text-parchment"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {revenueData && <RevenueChart data={revenueData} />}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "Orders" && orderStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#171717] border border-[#1E1E1E] p-6">
            <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-2">
              Total Orders
            </h3>
            <p className="text-gold-warm font-sans font-light text-4xl">
              {orderStats.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#171717] border border-[#1E1E1E] p-6">
            <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-4">
              By Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(orderStats.byStatus).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }: { name: string; value: number }) =>
                    `${name}: ${value}`
                  }
                  labelLine={false}
                >
                  {Object.keys(orderStats.byStatus).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "Products" && topProducts && (
        <div className="bg-[#171717] border border-[#1E1E1E] p-6">
          <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-6">
            Top Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis
                type="number"
                tick={{ fill: "#7A7470", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatPrice(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#7A7470", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number) => [formatPrice(value), "Price"]}
              />
              <Bar dataKey="price" fill="#C9A84C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "Customers" && customerStats && (
        <div className="bg-[#171717] border border-[#1E1E1E] p-6">
          <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans mb-2">
            Total Customers
          </h3>
          <p className="text-gold-warm font-sans font-light text-4xl">
            {customerStats.totalCustomers.toLocaleString()}
          </p>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === "Finance" && pnl && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: pnl.revenue },
            { label: "Expenses", value: pnl.expenses },
            { label: "Profit", value: pnl.profit },
          ].map((item) => (
            <div key={item.label} className="bg-[#171717] border border-[#1E1E1E] p-6">
              <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-2">
                {item.label}
              </p>
              <p className="text-gold-warm font-sans font-light text-3xl">
                {formatPrice(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
