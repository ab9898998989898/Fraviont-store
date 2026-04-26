"use client";

import { useEffect } from "react";
import { api } from "@/trpc/react";
import { KPICard } from "@/components/admin/KPICard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { AIDigestCard } from "@/components/admin/AIDigestCard";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { LowStockAlerts } from "@/components/admin/LowStockAlerts";
import { KPICardSkeleton } from "@/components/shared/skeletons/KPICardSkeleton";

export default function AdminDashboardPage() {
  const { data: stats, refetch: refetchStats } =
    api.analytics.getDashboardStats.useQuery();
  const { data: revenueData } = api.analytics.getRevenue.useQuery({
    period: "7d",
  });
  const { data: settings } = api.settings.get.useQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      void refetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchStats]);

  return (
    <div>
      <h2 className="font-display text-ivory font-light text-3xl mb-8">
        Dashboard
      </h2>

      {!stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              label="Today's Revenue"
              value={stats.todayRevenue}
              previousValue={stats.yesterdayRevenue}
              format="price"
              currency={settings?.currency}
            />
            <KPICard
              label="Today's Orders"
              value={stats.todayOrders}
              format="number"
            />
            <KPICard
              label="Week Orders"
              value={stats.weekOrders}
              format="number"
            />
            <KPICard
              label="Avg Order Value"
              value={stats.avgOrderValue}
              format="price"
              currency={settings?.currency}
            />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <RevenueChart data={revenueData ?? []} currency={settings?.currency} />
              <AIDigestCard />
            </div>
            <div className="space-y-6">
              <RecentOrdersTable orders={stats.recentOrders} />
              <LowStockAlerts variants={stats.lowStockVariants} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
