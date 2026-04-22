import { Suspense } from "react";
import { api } from "@/trpc/server";
import { KPICard } from "@/components/admin/KPICard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { AIDigestCard } from "@/components/admin/AIDigestCard";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { LowStockAlerts } from "@/components/admin/LowStockAlerts";
import { KPICardSkeleton } from "@/components/shared/skeletons/KPICardSkeleton";

async function DashboardData() {
  const [stats, revenueData] = await Promise.all([
    api.analytics.getDashboardStats(),
    api.analytics.getRevenue({ period: "7d" }),
  ]);

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Today's Revenue"
          value={stats.todayRevenue}
          previousValue={stats.yesterdayRevenue}
          format="price"
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
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RevenueChart data={revenueData} />
          <AIDigestCard />
        </div>
        <div className="space-y-6">
          <RecentOrdersTable orders={stats.recentOrders} />
          <LowStockAlerts variants={stats.lowStockVariants} />
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="font-display text-ivory font-light text-3xl mb-8">Dashboard</h2>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardData />
      </Suspense>
    </div>
  );
}
