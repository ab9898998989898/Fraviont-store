import { Skeleton } from "@/components/ui/skeleton";

export function KPICardSkeleton() {
  return (
    <div className="bg-[#171717] border border-[#2A2A2A] p-6 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
