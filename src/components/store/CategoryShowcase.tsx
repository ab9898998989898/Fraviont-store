"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { setupCardHover } from "@/lib/gsap/animations/productCard";
import { revealStagger } from "@/lib/gsap/animations/scrollReveal";

const CATEGORIES = [
  {
    label: "PERFUMES",
    description: "Olfactory art for the senses",
    href: "/shop?category=perfumes",
    gradient: "from-[#1a1208] to-[#0a0a0a]",
  },
  {
    label: "COSMETICS",
    description: "Ritual beauty, elevated",
    href: "/shop?category=cosmetics",
    gradient: "from-[#0d1218] to-[#0a0a0a]",
  },
  {
    label: "JEWELRY",
    description: "Adornment as expression",
    href: "/shop?category=jewelry",
    gradient: "from-[#12100a] to-[#0a0a0a]",
  },
];

export function CategoryShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      cardRefs.current.forEach((card) => {
        if (card) setupCardHover(card);
      });
      const validCards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (validCards.length > 0) revealStagger(validCards);
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-32 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, i) => (
          <Link key={cat.label} href={cat.href}>
            <div
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className={`group relative aspect-[3/4] bg-gradient-to-b ${cat.gradient} border border-iron overflow-hidden cursor-pointer`}
            >
              <div className="card-image absolute inset-0 bg-gradient-to-b from-transparent to-charcoal/60" />
              <div className="card-overlay absolute inset-0 bg-gold-glow opacity-0" />
              <div className="card-info absolute bottom-0 left-0 right-0 p-8">
                <p className="text-ash text-xs tracking-[0.2em] uppercase font-sans mb-2">
                  {cat.description}
                </p>
                <h3 className="font-accent text-ivory text-2xl tracking-[0.1em]">
                  {cat.label}
                </h3>
                <div className="mt-4 flex items-center gap-2 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
