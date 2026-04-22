"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { BookOpen } from "lucide-react";

const FEATURED_ARTICLE = {
  title: "The Art of Layering Fragrances",
  excerpt:
    "Discover how to combine scents to create something uniquely yours — a signature that evolves throughout the day. From base notes that ground you to sparkling top notes that announce your arrival.",
  date: "March 2026",
  category: "Fragrance",
  readTime: "5 min read",
};

const ARTICLES = [
  {
    title: "Behind the Atelier: Crafting Oud Noir",
    excerpt:
      "A journey into the creation of our most enigmatic fragrance, from sourcing wild oud to the final composition.",
    date: "February 2026",
    category: "Behind the Scenes",
    readTime: "7 min read",
    gradient: "from-amber-900/20 to-stone-900/40",
  },
  {
    title: "The New Gold Standard in Skincare",
    excerpt:
      "Why 24k gold-infused serums are redefining luxury skincare — and how our Luminous Serum leads the way.",
    date: "January 2026",
    category: "Beauty",
    readTime: "4 min read",
    gradient: "from-yellow-900/20 to-stone-900/40",
  },
  {
    title: "Minimalism Meets Opulence: Jewelry Trends",
    excerpt:
      "The rise of understated luxury in fine jewelry, and why a single statement piece speaks louder than many.",
    date: "December 2025",
    category: "Style",
    readTime: "6 min read",
    gradient: "from-stone-800/40 to-neutral-900/40",
  },
  {
    title: "Scent and Memory: The Invisible Thread",
    excerpt:
      "How fragrance bypasses logic and speaks directly to emotion — the neuroscience behind why a scent can transport you.",
    date: "November 2025",
    category: "Science",
    readTime: "5 min read",
    gradient: "from-zinc-800/40 to-stone-900/40",
  },
  {
    title: "Seasonal Fragrance Guide: Autumn Warmth",
    excerpt:
      "As the air cools, reach for these enveloping, spiced fragrances that mirror the richness of the season.",
    date: "October 2025",
    category: "Guide",
    readTime: "4 min read",
    gradient: "from-orange-900/15 to-stone-900/40",
  },
];

export default function JournalPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els)
      gsap.from(els, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
      });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24 px-8"
      style={{
        background:
          "radial-gradient(ellipse at 30% 10%, rgba(200,160,60,0.03) 0%, transparent 50%), #0A0A0A",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">
          Editorial
        </p>
        <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">
          The Fraviont Journal
        </h1>
        <div data-reveal className="w-16 h-px bg-gold-warm mb-6" />
        <p data-reveal className="text-parchment font-sans font-light text-sm max-w-lg mb-16">
          Stories from the world of luxury — fragrance, beauty, style, and the
          philosophy behind the things we cherish.
        </p>

        {/* Featured Article */}
        <div
          data-reveal
          className="mb-16 p-10 md:p-14 border border-iron/30 relative overflow-hidden group cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, rgba(200,160,60,0.08) 0%, #111111 60%, rgba(200,160,60,0.04) 100%)",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-gold-warm/40 via-gold-warm/10 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-gold-warm" />
            <span className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
              Featured
            </span>
          </div>
          <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-3">
            {FEATURED_ARTICLE.category} — {FEATURED_ARTICLE.date} ·{" "}
            {FEATURED_ARTICLE.readTime}
          </p>
          <h2 className="font-display text-ivory text-3xl md:text-4xl font-light mb-4 group-hover:text-gold-warm transition-colors duration-300">
            {FEATURED_ARTICLE.title}
          </h2>
          <p className="text-parchment text-sm font-sans font-light leading-relaxed max-w-2xl">
            {FEATURED_ARTICLE.excerpt}
          </p>
          <span className="inline-block mt-6 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans group-hover:translate-x-1 transition-transform duration-300">
            Read Full Article →
          </span>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {ARTICLES.slice(0, 4).map((article, i) => (
            <article
              key={i}
              data-reveal
              className="border border-iron/20 group cursor-pointer hover:border-gold-warm/20 transition-colors duration-500 overflow-hidden"
            >
              {/* Gradient cover placeholder */}
              <div
                className={`h-40 bg-gradient-to-br ${article.gradient} relative`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-ivory/10 font-display text-6xl font-light">
                    {article.category.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-3">
                  {article.category} — {article.date} · {article.readTime}
                </p>
                <h3 className="font-display text-ivory text-xl font-light mb-3 group-hover:text-gold-warm transition-colors duration-300">
                  {article.title}
                </h3>
                <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Remaining articles as list */}
        <div className="border-t border-iron/30">
          {ARTICLES.slice(4).map((article, i) => (
            <article
              key={i}
              data-reveal
              className="border-b border-iron/20 py-8 group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-3">
                    {article.category} — {article.date} · {article.readTime}
                  </p>
                  <h2 className="font-display text-ivory text-2xl font-light mb-3 group-hover:text-gold-warm transition-colors duration-300">
                    {article.title}
                  </h2>
                  <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <span className="text-ash text-xs tracking-[0.14em] uppercase font-sans group-hover:text-gold-warm transition-colors shrink-0 mt-6">
                  Read →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
