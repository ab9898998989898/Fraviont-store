const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber/20 text-amber",
  confirmed: "bg-sapphire/20 text-sapphire",
  processing: "bg-sapphire/20 text-sapphire",
  shipped: "bg-emerald/20 text-emerald",
  delivered: "bg-emerald/20 text-emerald",
  cancelled: "bg-crimson/20 text-crimson",
  refunded: "bg-crimson/20 text-crimson",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-iron/20 text-ash";
  return (
    <span className={`text-xs font-sans px-2 py-1 capitalize ${style}`}>
      {status}
    </span>
  );
}
