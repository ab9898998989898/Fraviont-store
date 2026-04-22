"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { revealSection } from "@/lib/gsap/animations/scrollReveal";

export function AIQuizCTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (containerRef.current) revealSection(containerRef.current);
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="py-32 px-8 bg-charcoal border-y border-iron"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-6">
          AI-Powered Discovery
        </p>
        <h2 className="font-display text-ivory font-light text-5xl mb-6 leading-tight">
          Discover Your Signature Scent
        </h2>
        <p className="text-parchment font-sans font-light text-lg mb-10 leading-relaxed">
          Our AI concierge Sophia will guide you through a personalised journey to find the fragrance that speaks to your essence.
        </p>
        <Link
          href="/quiz"
          className="inline-block bg-transparent text-gold-warm text-xs tracking-[0.14em] uppercase font-sans font-medium px-12 py-4 border border-gold-warm hover:bg-gold-warm hover:text-obsidian transition-colors duration-300"
        >
          Begin the Journey
        </Link>
      </div>
    </section>
  );
}
