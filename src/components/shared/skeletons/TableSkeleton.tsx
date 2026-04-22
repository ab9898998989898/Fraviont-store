import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      <div className="flex gap-4 p-4 border-b border-[#2A2A2A]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-[#2A2A2A]/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-4 flex-1"
              style={{ animationDelay: `${r * 0.05}s` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
