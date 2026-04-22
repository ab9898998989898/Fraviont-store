import { Check } from "lucide-react";

const STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

interface StatusTimelineProps {
  currentStatus: string;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = STEPS.indexOf(
    currentStatus as (typeof STEPS)[number],
  );

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 flex items-center justify-center border text-xs ${
                  isCompleted
                    ? "bg-gold-warm border-gold-warm text-obsidian"
                    : isCurrent
                      ? "border-gold-warm text-gold-warm"
                      : "border-iron text-ash"
                }`}
              >
                {isCompleted ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-sans mt-1 capitalize ${
                  isCurrent
                    ? "text-gold-warm"
                    : isCompleted
                      ? "text-parchment"
                      : "text-ash"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-12 mb-4 ${i < currentIndex ? "bg-gold-warm" : "bg-iron"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
