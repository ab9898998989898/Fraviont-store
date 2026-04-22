import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-3">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
      <div className="space-y-5 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-16" />
          ))}
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </div>
  );
}
