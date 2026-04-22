"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateScentNotes } from "@/lib/gsap/animations/scentProfile";
import type { ScentNotes } from "@/server/db/schema";

interface ScentProfileProps {
  scentNotes: ScentNotes;
}

export function ScentProfile({ scentNotes }: ScentProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (containerRef.current) animateScentNotes(containerRef.current);
    },
    { scope: containerRef }
  );

  const layers = [
    { label: "Top Notes", notes: scentNotes.top, size: "w-32 h-32" },
    { label: "Heart Notes", notes: scentNotes.middle, size: "w-48 h-48" },
    { label: "Base Notes", notes: scentNotes.base, size: "w-64 h-64" },
  ];

  return (
    <div ref={containerRef} className="py-8">
      <h3 className="text-ivory text-xs tracking-[0.2em] uppercase font-sans mb-8">
        Scent Profile
      </h3>
      <div className="flex flex-col items-center gap-6">
        {layers.map((layer) => (
          <div key={layer.label} className="flex items-center gap-6 w-full">
            <div
              className={`scent-ring ${layer.size} rounded-full border border-gold-antique/30 flex items-center justify-center flex-shrink-0`}
            >
              <div className="w-2 h-2 rounded-full bg-gold-warm" />
            </div>
            <div className="scent-label">
              <p className="text-ash text-[10px] tracking-[0.2em] uppercase font-sans mb-1">
                {layer.label}
              </p>
              <p className="text-parchment text-sm font-sans font-light">
                {layer.notes.join(" · ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
