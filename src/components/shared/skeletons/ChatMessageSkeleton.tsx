import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-2 px-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
