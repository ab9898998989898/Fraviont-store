"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { Quote, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

const PRESS_MENTIONS = [
  { publication: "Vogue South Africa", quote: "Fraviont is redefining what luxury means for a new generation — intimate, intentional, and utterly unforgettable.", date: "April 2026", product: "Oud Noir" },
  { publication: "GQ Magazine", quote: "Oud Noir is the fragrance equivalent of a perfectly tailored suit — impeccable, sophisticated, and effortlessly commanding.", date: "February 2026", product: "Oud Noir" },
  { publication: "Harper's Bazaar", quote: "From their hand-poured candles to their statement jewelry, every Fraviont creation tells a story of extraordinary craftsmanship.", date: "November 2025", product: "Brand Feature" },
  { publication: "Elle Décor", quote: "The Discovery Set makes the perfect gift for anyone who appreciates the finer things in life.", date: "October 2025", product: "The Discovery Set" },
  { publication: "Wallpaper*", quote: "A masterclass in modern minimalism. Fraviont proves that true luxury whispers rather than shouts.", date: "August 2025", product: "Jewelry Collection" },
  { publication: "Financial Times", quote: "The new standard-bearer for sustainable luxury emerging from the African continent.", date: "June 2025", product: "Brand Feature" },
];

export default function PressPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24"
      style={{
        background:
          "radial-gradient(ellipse at 80% 20%, rgba(200,160,60,0.03) 0%, transparent 60%), #0A0A0A",
      }}
    >
      <div className="max-w-5xl mx-auto px-8">
        {/* Header */}
        <div className="mb-20">
          <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">In the Media</p>
          <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Press &amp; Features</h1>
          <div data-reveal className="w-16 h-px bg-gold-warm mb-8" />
          <p data-reveal className="text-parchment font-sans font-light text-base leading-relaxed max-w-xl">
            Fraviont has been celebrated by the world&apos;s most discerning publications for our commitment to craftsmanship,
            sustainability, and uncompromising luxury.
          </p>
        </div>

        {/* Featured Quote */}
        <div data-reveal className="mb-24 relative p-12 text-center border border-iron/20" style={{ background: "linear-gradient(135deg, rgba(200,160,60,0.06) 0%, #111111 50%, rgba(200,160,60,0.03) 100%)" }}>
          <Quote size={40} className="text-gold-warm mx-auto mb-8 opacity-40 rotate-180" />
          <h2 className="font-display text-ivory text-3xl font-light leading-relaxed mb-8 max-w-3xl mx-auto">
            &quot;Fraviont is quietly revolutionising the African luxury sector, proving that heritage craftsmanship and modern sustainability can coexist beautifully.&quot;
          </h2>
          <div className="flex flex-col items-center justify-center">
            <span className="text-ivory font-sans font-medium mb-1">The New York Times</span>
            <span className="text-ash text-xs tracking-[0.14em] uppercase font-sans">Special Feature · January 2026</span>
          </div>
        </div>

        {/* Mentions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-24">
          {PRESS_MENTIONS.map((item, i) => (
            <div key={i} data-reveal className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-gold-warm/40 before:to-transparent">
              <div className="flex justify-between items-start mb-4">
                <span className="text-ivory font-sans font-medium">{item.publication}</span>
                <span className="text-ash text-xs tracking-[0.14em] uppercase font-sans">{item.date}</span>
              </div>
              <p className="font-display text-parchment text-lg font-light italic leading-relaxed mb-4">
                &quot;{item.quote}&quot;
              </p>
              <div className="inline-flex items-center gap-2 group cursor-pointer">
                <span className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
                  Featuring {item.product}
                </span>
                <ArrowRight size={14} className="text-gold-warm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Press Kit CTA */}
        <div data-reveal className="bg-[#111111] border border-iron/20 p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-ivory text-2xl font-light mb-2">Media Enquiries &amp; Press Kit</h3>
            <p className="text-parchment font-sans font-light text-sm max-w-md">
              For high-resolution imagery, brand guidelines, or interview requests with our founders, please access our digital press kit or contact our PR team.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/contact?subject=press"
              className="inline-flex items-center justify-center border border-iron text-ivory text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:border-gold-warm hover:text-gold-warm transition-colors duration-300"
            >
              Contact PR
            </Link>
            <button className="inline-flex items-center justify-center gap-2 bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors duration-300">
              <Download size={14} />
              Download Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
