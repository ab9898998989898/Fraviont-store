import { Suspense } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/store/HeroSection";
import { CategoryShowcase } from "@/components/store/CategoryShowcase";
import { AIQuizCTA } from "@/components/store/AIQuizCTA";
import { NewsletterSection } from "@/components/store/NewsletterSection";
import { ProductGridSkeleton } from "@/components/shared/skeletons/ProductGridSkeleton";
import { ProductCard } from "@/components/store/ProductCard";

const DUMMY_PRODUCTS = [
  {
    id: "dummy-1",
    slug: "fraviont-oud-noir",
    name: "Oud Noir",
    shortDescription: "A deep, smoky oud with notes of black amber and sandalwood.",
    description: "Oud Noir is an olfactory journey into the heart of darkness.",
    aiDescription: null,
    price: 285000,
    compareAtPrice: null,
    category: "perfumes" as const,
    subcategory: "Eau de Parfum",
    images: ["https://images.unsplash.com/photo-1594035910387-fea081e39e3f?w=800&q=80"],
    tags: ["oud", "woody", "oriental"],
    ingredients: null,
    scentNotes: { top: ["Black Pepper", "Saffron"], middle: ["Oud", "Rose"], base: ["Sandalwood", "Amber", "Musk"] },
    isActive: true,
    isFeatured: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-2",
    slug: "rose-absolue",
    name: "Rose Absolue",
    shortDescription: "Pure Bulgarian rose with a whisper of white musk.",
    description: "Rose Absolue captures the essence of a rose garden at dawn.",
    aiDescription: null,
    price: 195000,
    compareAtPrice: null,
    category: "perfumes" as const,
    subcategory: "Eau de Parfum",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"],
    tags: ["floral", "rose", "feminine"],
    ingredients: null,
    scentNotes: { top: ["Bergamot", "Lychee"], middle: ["Bulgarian Rose", "Peony"], base: ["White Musk", "Cedarwood"] },
    isActive: true,
    isFeatured: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-3",
    slug: "luminous-serum",
    name: "Luminous Serum",
    shortDescription: "A brightening serum with 15% Vitamin C complex.",
    description: "The Luminous Serum is a concentrated dose of radiance.",
    aiDescription: null,
    price: 89500,
    compareAtPrice: null,
    category: "cosmetics" as const,
    subcategory: "Skincare",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
    tags: ["serum", "vitamin-c", "brightening"],
    ingredients: null,
    scentNotes: null,
    isActive: true,
    isFeatured: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-4",
    slug: "gold-arc-earrings",
    name: "Gold Arc Earrings",
    shortDescription: "Minimalist 18k gold-plated arc earrings.",
    description: "The Gold Arc Earrings are a study in elegant restraint.",
    aiDescription: null,
    price: 125000,
    compareAtPrice: null,
    category: "jewelry" as const,
    subcategory: "Earrings",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
    tags: ["gold", "minimalist", "earrings"],
    ingredients: null,
    scentNotes: null,
    isActive: true,
    isFeatured: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function NewArrivalsSection() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <h2 className="font-display text-ivory font-light text-4xl">New Arrivals</h2>
        <a
          href="/shop"
          className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors"
        >
          View All →
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DUMMY_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section
      className="relative py-32 px-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(200,160,60,0.04) 0%, transparent 50%), linear-gradient(180deg, #0A0A0A 0%, #0F0F0F 50%, #0A0A0A 100%)",
      }}
    >
      {/* Decorative side lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-iron/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-iron/20 to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-6">Our Philosophy</p>
        <h2 className="font-display text-ivory font-light text-3xl md:text-4xl leading-snug mb-8">
          We believe luxury is not about possession — it is about the feeling of being truly,
          unapologetically yourself.
        </h2>
        <div className="w-16 h-px bg-gold-warm mx-auto mb-8" />
        <p className="text-parchment font-sans font-light text-base leading-relaxed max-w-2xl mx-auto">
          Every Fraviont creation begins with a story — drawn from the world&apos;s rarest
          ingredients, shaped by master artisans, and finished with an obsessive attention
          to detail that transforms the everyday into the extraordinary.
        </p>
      </div>
    </section>
  );
}

function CraftsmanshipSection() {
  return (
    <section
      className="relative py-24 px-8 border-t border-b border-iron/30"
      style={{
        background:
          "linear-gradient(135deg, rgba(200,160,60,0.03) 0%, transparent 40%, rgba(200,160,60,0.02) 100%), #0E0E0E",
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        <div>
          <p className="font-display text-gold-warm text-4xl font-light mb-3">200+</p>
          <p className="text-ivory text-sm font-sans font-medium tracking-[0.1em] uppercase mb-2">
            Raw Ingredients
          </p>
          <p className="text-parchment font-sans font-light text-xs leading-relaxed">
            Sourced from over 30 countries — from the saffron fields of Iran to the
            cedar forests of the Atlas Mountains.
          </p>
        </div>
        <div>
          <p className="font-display text-gold-warm text-4xl font-light mb-3">72hr</p>
          <p className="text-ivory text-sm font-sans font-medium tracking-[0.1em] uppercase mb-2">
            Maceration
          </p>
          <p className="text-parchment font-sans font-light text-xs leading-relaxed">
            Each fragrance undergoes a minimum 72-hour cold maceration process to ensure
            depth and longevity on the skin.
          </p>
        </div>
        <div>
          <p className="font-display text-gold-warm text-4xl font-light mb-3">∞</p>
          <p className="text-ivory text-sm font-sans font-medium tracking-[0.1em] uppercase mb-2">
            Commitment
          </p>
          <p className="text-parchment font-sans font-light text-xs leading-relaxed">
            Cruelty-free, sustainably sourced, and crafted without compromise. Our promise
            to you and to the world.
          </p>
        </div>
      </div>
    </section>
  );
}

function EditorialSection() {
  return (
    <section
      className="relative py-32 px-8 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 50%, rgba(200,160,60,0.05) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(200,160,60,0.03) 0%, transparent 40%), #0A0A0A",
      }}
    >
      <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">The Atelier</p>
          <h2 className="font-display text-ivory font-light text-3xl leading-snug mb-6">
            Where Heritage Meets the Avant-Garde
          </h2>
          <p className="text-parchment font-sans font-light text-sm leading-relaxed mb-6">
            Nestled in Cape Town&apos;s vibrant Waterfront district, the Fraviont atelier is where tradition
            and innovation converge. Our perfumers, jewellers, and cosmetic scientists work side by side —
            pushing boundaries while honouring the timeless principles of their craft.
          </p>
          <Link
            href="/about"
            className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans hover:text-gold-bright transition-colors"
          >
            Discover Our Story →
          </Link>
        </div>
        <div className="border-l-2 border-gold-warm/20 pl-8">
          <p className="font-display text-ivory text-xl font-light italic leading-relaxed mb-4">
            &quot;True luxury is invisible. It is felt, not seen. It is the quiet confidence
            that comes from wearing something crafted with soul.&quot;
          </p>
          <p className="text-ash text-xs tracking-[0.14em] uppercase font-sans">
            — The Fraviont Manifesto
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <CategoryShowcase />
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <NewArrivalsSection />
      </Suspense>
      <CraftsmanshipSection />
      <EditorialSection />
      <AIQuizCTA />
      <NewsletterSection />
    </>
  );
}
