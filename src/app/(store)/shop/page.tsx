import { Suspense } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { FiltersPanel } from "@/components/store/FiltersPanel";
import { ProductGridSkeleton } from "@/components/shared/skeletons/ProductGridSkeleton";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

const VALID_CATEGORIES = ["perfumes", "cosmetics", "jewelry", "gift_sets"] as const;
type ValidCategory = (typeof VALID_CATEGORIES)[number];

const FALLBACK_PRODUCTS = [
  {
    id: "fallback-1",
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
    id: "fallback-2",
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
    id: "fallback-3",
    slug: "amber-dusk",
    name: "Amber Dusk",
    shortDescription: "Warm amber and vanilla with a hint of smoked wood.",
    description: "Amber Dusk is the scent of golden hour — warm, enveloping, and deeply comforting.",
    aiDescription: null,
    price: 165000,
    compareAtPrice: null,
    category: "perfumes" as const,
    subcategory: "Eau de Toilette",
    images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"],
    tags: ["amber", "warm", "vanilla"],
    ingredients: null,
    scentNotes: { top: ["Cardamom", "Bergamot"], middle: ["Amber", "Jasmine"], base: ["Vanilla", "Smoked Wood", "Tonka Bean"] },
    isActive: true,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-4",
    slug: "velvet-lip-elixir",
    name: "Velvet Lip Elixir",
    shortDescription: "A luxurious lip treatment in deep berry tones.",
    description: "The Velvet Lip Elixir delivers intense colour with the comfort of a balm.",
    aiDescription: null,
    price: 45000,
    compareAtPrice: null,
    category: "cosmetics" as const,
    subcategory: "Lip",
    images: ["https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=800&q=80"],
    tags: ["lip", "colour", "nourishing"],
    ingredients: null,
    scentNotes: null,
    isActive: true,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-5",
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
    id: "fallback-6",
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
  {
    id: "fallback-7",
    slug: "obsidian-ring",
    name: "Obsidian Ring",
    shortDescription: "Sterling silver ring with a polished obsidian stone.",
    description: "The Obsidian Ring is a statement of quiet power.",
    aiDescription: null,
    price: 185000,
    compareAtPrice: null,
    category: "jewelry" as const,
    subcategory: "Rings",
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"],
    tags: ["ring", "obsidian", "statement"],
    ingredients: null,
    scentNotes: null,
    isActive: true,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-8",
    slug: "the-discovery-set",
    name: "The Discovery Set",
    shortDescription: "Three 10ml travel sizes of our bestselling perfumes.",
    description: "The Discovery Set is the perfect introduction to the Fraviont universe.",
    aiDescription: null,
    price: 95000,
    compareAtPrice: null,
    category: "gift_sets" as const,
    subcategory: "Fragrance",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
    tags: ["gift", "travel", "discovery"],
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
    id: "fallback-9",
    slug: "midnight-bloom-candle",
    name: "Midnight Bloom Candle",
    shortDescription: "Hand-poured soy candle with jasmine and oud.",
    description: "A luxurious candle that transforms any room into a sanctuary.",
    aiDescription: null,
    price: 65000,
    compareAtPrice: null,
    category: "gift_sets" as const,
    subcategory: "Home",
    images: ["https://images.unsplash.com/photo-1602528495711-41baa23ab4df?w=800&q=80"],
    tags: ["candle", "home", "luxury"],
    ingredients: null,
    scentNotes: null,
    isActive: true,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function ProductGridData({
  category,
  search,
  page,
}: {
  category?: string;
  search?: string;
  page?: number;
}) {
  let productList = FALLBACK_PRODUCTS;

  try {
    const { api } = await import("@/trpc/server");
    const validCategory = VALID_CATEGORIES.includes(category as ValidCategory)
      ? (category as ValidCategory)
      : undefined;

    const result = await api.products.getAll({
      category: validCategory,
      search,
      page: page ?? 1,
      limit: 9,
    });

    if (result.products.length > 0) {
      productList = result.products as typeof FALLBACK_PRODUCTS;
    }
  } catch {
    // Fall back to demo products if DB is not available
  }

  // Filter by category if using fallback
  if (category && productList === FALLBACK_PRODUCTS) {
    productList = productList.filter((p) => p.category === category);
  }

  return <ProductGrid products={productList} />;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div
      className="min-h-screen pt-32 pb-24 px-8"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(200,160,60,0.03) 0%, transparent 40%), #0A0A0A",
      }}
    >
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Shop</p>
        <h1 className="font-display text-ivory font-light text-5xl mb-4">
          {params.category
            ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
            : "All Collections"}
        </h1>
        <div className="w-16 h-px bg-gold-warm mb-4" />
        <p className="text-parchment font-sans font-light text-sm max-w-lg">
          Discover our curated selection of luxury products — each one crafted with
          extraordinary care and designed to elevate the everyday.
        </p>
      </div>

      {/* Filters */}
      <Suspense>
        <FiltersPanel />
      </Suspense>

      {/* Products */}
      <Suspense fallback={<ProductGridSkeleton count={9} />}>
        <ProductGridData
          category={params.category}
          search={params.search}
          page={page}
        />
      </Suspense>
      </div>
    </div>
  );
}

