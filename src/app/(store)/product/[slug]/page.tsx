import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailSkeleton } from "@/components/shared/skeletons/ProductDetailSkeleton";
import { ProductDetailContent } from "@/components/store/ProductDetailContent";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_PRODUCTS: Record<string, {
  id: string; slug: string; name: string; shortDescription: string | null; description: string | null;
  aiDescription: string | null; price: number; compareAtPrice: number | null; category: "perfumes" | "cosmetics" | "jewelry" | "gift_sets";
  subcategory: string | null; images: string[]; tags: string[]; ingredients: string | null;
  scentNotes: { top: string[]; middle: string[]; base: string[] } | null; isActive: boolean; isFeatured: boolean;
  metaTitle: string | null; metaDescription: string | null; createdAt: Date; updatedAt: Date; variants: never[];
}> = {
  "fraviont-oud-noir": {
    id: "dummy-1", slug: "fraviont-oud-noir", name: "Oud Noir",
    shortDescription: "A deep, smoky oud with notes of black amber and sandalwood.",
    description: "Oud Noir is an olfactory journey into the heart of darkness — a fragrance that speaks of mystery, depth, and the allure of the unseen. Opening with a striking accord of black pepper and saffron, it transitions into a rich heart of pure oud and damask rose, before settling into a base of sandalwood, amber, and white musk that lingers for hours. This is a scent for those who command attention without raising their voice.",
    aiDescription: null, price: 285000, compareAtPrice: null, category: "perfumes", subcategory: "Eau de Parfum",
    images: ["https://images.unsplash.com/photo-1594035910387-fea081e39e3f?w=800&q=80"],
    tags: ["oud", "woody", "oriental"], ingredients: null,
    scentNotes: { top: ["Black Pepper", "Saffron"], middle: ["Oud", "Rose"], base: ["Sandalwood", "Amber", "Musk"] },
    isActive: true, isFeatured: true, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "rose-absolue": {
    id: "dummy-2", slug: "rose-absolue", name: "Rose Absolue",
    shortDescription: "Pure Bulgarian rose with a whisper of white musk.",
    description: "Rose Absolue captures the essence of a rose garden at dawn — dewy, luminous, and utterly intoxicating. Built around the finest Bulgarian rose absolute, this fragrance opens with bright bergamot and lychee, blossoms into a lush heart of rose and peony, and dries down to a soft embrace of white musk and cedarwood. A timeless tribute to femininity.",
    aiDescription: null, price: 195000, compareAtPrice: null, category: "perfumes", subcategory: "Eau de Parfum",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"],
    tags: ["floral", "rose", "feminine"], ingredients: null,
    scentNotes: { top: ["Bergamot", "Lychee"], middle: ["Bulgarian Rose", "Peony"], base: ["White Musk", "Cedarwood"] },
    isActive: true, isFeatured: true, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "luminous-serum": {
    id: "dummy-3", slug: "luminous-serum", name: "Luminous Serum",
    shortDescription: "A brightening serum with 15% Vitamin C complex.",
    description: "The Luminous Serum is a concentrated dose of radiance — a daily ritual for skin that glows from within. Formulated with a stabilised 15% Vitamin C complex, hyaluronic acid, and niacinamide, it targets dark spots, uneven tone, and fine lines while deeply hydrating. Lightweight and fast-absorbing, it layers beautifully under moisturiser for a luminous, glass-skin finish.",
    aiDescription: null, price: 89500, compareAtPrice: null, category: "cosmetics", subcategory: "Skincare",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
    tags: ["serum", "vitamin-c", "brightening"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: true, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "gold-arc-earrings": {
    id: "dummy-4", slug: "gold-arc-earrings", name: "Gold Arc Earrings",
    shortDescription: "Minimalist 18k gold-plated arc earrings.",
    description: "The Gold Arc Earrings are a study in elegant restraint — a single, sweeping arc of 18k gold-plated sterling silver that catches the light with every movement. Designed to be worn from morning to midnight, they pair effortlessly with everything from tailored suits to evening gowns. The perfect statement for those who believe less is infinitely more.",
    aiDescription: null, price: 125000, compareAtPrice: null, category: "jewelry", subcategory: "Earrings",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
    tags: ["gold", "minimalist", "earrings"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: true, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "amber-dusk": {
    id: "dummy-5", slug: "amber-dusk", name: "Amber Dusk",
    shortDescription: "Warm amber and vanilla with a hint of smoked wood.",
    description: "Amber Dusk is the scent of golden hour — warm, enveloping, and deeply comforting, like the last rays of sun on bare skin. Opening with aromatic cardamom and bright bergamot, it melts into a rich amber and jasmine heart before settling into a base of vanilla, smoked wood, and tonka bean. An evening fragrance that feels like a whispered invitation.",
    aiDescription: null, price: 165000, compareAtPrice: null, category: "perfumes", subcategory: "Eau de Toilette",
    images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"],
    tags: ["amber", "warm", "vanilla"], ingredients: null,
    scentNotes: { top: ["Cardamom", "Bergamot"], middle: ["Amber", "Jasmine"], base: ["Vanilla", "Smoked Wood", "Tonka Bean"] },
    isActive: true, isFeatured: false, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "velvet-lip-elixir": {
    id: "dummy-6", slug: "velvet-lip-elixir", name: "Velvet Lip Elixir",
    shortDescription: "A luxurious lip treatment in deep berry tones.",
    description: "The Velvet Lip Elixir delivers intense colour with the comfort of a balm. Enriched with hyaluronic acid and jojoba oil, it hydrates while providing a rich, buildable berry tint that lasts throughout the day.",
    aiDescription: null, price: 45000, compareAtPrice: null, category: "cosmetics", subcategory: "Lip",
    images: ["https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=800&q=80"],
    tags: ["lip", "colour", "nourishing"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: false, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "obsidian-ring": {
    id: "dummy-7", slug: "obsidian-ring", name: "Obsidian Ring",
    shortDescription: "Sterling silver ring with a polished obsidian stone.",
    description: "The Obsidian Ring is a statement of quiet power. A hand-polished obsidian stone set in sterling silver, catching the light like a fragment of the night sky.",
    aiDescription: null, price: 185000, compareAtPrice: null, category: "jewelry", subcategory: "Rings",
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"],
    tags: ["ring", "obsidian", "statement"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: false, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "the-discovery-set": {
    id: "dummy-8", slug: "the-discovery-set", name: "The Discovery Set",
    shortDescription: "Three 10ml travel sizes of our bestselling perfumes.",
    description: "The Discovery Set is the perfect introduction to the Fraviont universe — three exquisite 10ml travel-sized perfumes featuring our most sought-after creations.",
    aiDescription: null, price: 95000, compareAtPrice: null, category: "gift_sets", subcategory: "Fragrance",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
    tags: ["gift", "travel", "discovery"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: true, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
  "midnight-bloom-candle": {
    id: "dummy-9", slug: "midnight-bloom-candle", name: "Midnight Bloom Candle",
    shortDescription: "Hand-poured soy candle with jasmine and oud.",
    description: "A luxurious hand-poured soy candle that transforms any room into a sanctuary. Notes of night-blooming jasmine and smouldering oud create an atmosphere of quiet opulence.",
    aiDescription: null, price: 65000, compareAtPrice: null, category: "gift_sets", subcategory: "Home",
    images: ["https://images.unsplash.com/photo-1602528495711-41baa23ab4df?w=800&q=80"],
    tags: ["candle", "home", "luxury"], ingredients: null, scentNotes: null,
    isActive: true, isFeatured: false, metaTitle: null, metaDescription: null, createdAt: new Date(), updatedAt: new Date(), variants: [],
  },
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { api } = await import("@/trpc/server");
    const product = await api.products.getBySlug({ slug });
    if (product) {
      return {
        title: product.metaTitle ?? `${product.name} — Fraviont`,
        description: product.metaDescription ?? product.shortDescription ?? undefined,
      };
    }
  } catch {
    // fall through to fallback
  }

  const fallback = FALLBACK_PRODUCTS[slug];
  if (fallback) {
    return { title: `${fallback.name} — Fraviont`, description: fallback.shortDescription ?? undefined };
  }
  return { title: "Product Not Found" };
}

async function ProductDetailData({ slug }: { slug: string }) {
  // Try database first
  try {
    const { api } = await import("@/trpc/server");
    const product = await api.products.getBySlug({ slug });
    if (product) return <ProductDetailContent product={product} />;
  } catch {
    // fall through to fallback
  }

  // Fallback to hardcoded products
  const fallback = FALLBACK_PRODUCTS[slug];
  if (!fallback) notFound();
  return <ProductDetailContent product={fallback} />;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <div className="min-h-screen pt-24">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailData slug={slug} />
      </Suspense>
    </div>
  );
}
