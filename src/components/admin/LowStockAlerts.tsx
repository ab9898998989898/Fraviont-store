interface LowStockVariant {
  id: string;
  sku: string;
  name: string;
  stock: number;
  lowStockThreshold: number | null;
}

interface LowStockAlertsProps {
  variants: LowStockVariant[];
}

export function LowStockAlerts({ variants }: LowStockAlertsProps) {
  return (
    <div className="bg-[#171717] border border-[#1E1E1E]">
      <div className="px-6 py-4 border-b border-[#1E1E1E]">
        <h3 className="text-ivory text-xs tracking-[0.14em] uppercase font-sans">
          Low Stock Alerts
        </h3>
      </div>
      <div className="divide-y divide-[#1E1E1E]">
        {variants.length === 0 ? (
          <p className="text-ash text-sm font-sans px-6 py-4">All stock levels are healthy.</p>
        ) : (
          variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-ivory text-xs font-sans font-light">{v.name}</p>
                <p className="text-ash text-[10px] font-sans">{v.sku}</p>
              </div>
              <span
                className={`text-xs font-sans px-2 py-1 ${
                  v.stock === 0
                    ? "bg-crimson/20 text-crimson"
                    : "bg-amber/20 text-amber"
                }`}
              >
                {v.stock} left
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
