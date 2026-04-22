import { Suspense } from "react";
import { api } from "@/trpc/server";
import { TableSkeleton } from "@/components/shared/skeletons/TableSkeleton";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { ForecastSection } from "@/components/admin/ForecastSection";

async function InventoryData() {
  const variants = await api.inventory.getAll();
  return <InventoryTable variants={variants} />;
}

export default function AdminInventoryPage() {
  return (
    <div className="space-y-8">
      <h2 className="font-display text-ivory font-light text-3xl">Inventory</h2>
      <Suspense fallback={<TableSkeleton rows={12} cols={5} />}>
        <InventoryData />
      </Suspense>
      <ForecastSection />
    </div>
  );
}
