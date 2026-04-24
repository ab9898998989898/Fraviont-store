"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface Journal {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  imageUrl: string | null;
  isFeatured: boolean | null;
  createdAt: Date | null;
}

export function JournalClient({ journals }: { journals: Journal[] }) {
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

  const featured = journals.find(j => j.isFeatured) || journals[0];
  const remainingJournals = journals.filter(j => j.id !== featured?.id);
  
  // Format date helper
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const gradients = [
    "from-amber-900/20 to-stone-900/40",
    "from-yellow-900/20 to-stone-900/40",
    "from-stone-800/40 to-neutral-900/40",
    "from-zinc-800/40 to-stone-900/40",
    "from-orange-900/15 to-stone-900/40",
  ];

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

        {journals.length === 0 ? (
          <p data-reveal className="text-ash text-sm">No journal entries available yet.</p>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <Link
                href={`/journal/${featured.slug}`}
                data-reveal
                className="block mb-16 p-10 md:p-14 border border-iron/30 relative overflow-hidden group cursor-pointer"
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
                  {featured.category} — {formatDate(featured.createdAt)} ·{" "}
                  {featured.readTime}
                </p>
                <h2 className="font-display text-ivory text-3xl md:text-4xl font-light mb-4 group-hover:text-gold-warm transition-colors duration-300">
                  {featured.title}
                </h2>
                <p className="text-parchment text-sm font-sans font-light leading-relaxed max-w-2xl">
                  {featured.excerpt}
                </p>
                <span className="inline-block mt-6 text-gold-warm text-xs tracking-[0.14em] uppercase font-sans group-hover:translate-x-1 transition-transform duration-300">
                  Read Full Article →
                </span>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {remainingJournals.slice(0, 4).map((article, i) => (
                <Link
                  href={`/journal/${article.slug}`}
                  key={article.id}
                  data-reveal
                  className="border border-iron/20 group cursor-pointer hover:border-gold-warm/20 transition-colors duration-500 overflow-hidden block"
                >
                  {/* Gradient cover placeholder or image */}
                  {article.imageUrl ? (
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${article.imageUrl})` }}
                    />
                  ) : (
                    <div
                      className={`h-40 bg-gradient-to-br ${gradients[i % gradients.length]} relative`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-ivory/10 font-display text-6xl font-light">
                          {article.category.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-3">
                      {article.category} — {formatDate(article.createdAt)} · {article.readTime}
                    </p>
                    <h3 className="font-display text-ivory text-xl font-light mb-3 group-hover:text-gold-warm transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Remaining articles as list */}
            {remainingJournals.length > 4 && (
              <div className="border-t border-iron/30">
                {remainingJournals.slice(4).map((article) => (
                  <Link
                    href={`/journal/${article.slug}`}
                    key={article.id}
                    data-reveal
                    className="block border-b border-iron/20 py-8 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div className="flex-1">
                        <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans mb-3">
                          {article.category} — {formatDate(article.createdAt)} · {article.readTime}
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
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
