"use client";

import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { VariantSelector } from "./VariantSelector";
import { AddToCart } from "./AddToCart";
import { ScentProfile } from "@/components/shared/ScentProfile";
import { formatPrice } from "@/lib/utils";
import type { InferSelectModel } from "drizzle-orm";
import type { products, productVariants } from "@/server/db/schema";

type Product = InferSelectModel<typeof products>;
type Variant = InferSelectModel<typeof productVariants>;

interface ProductDetailContentProps {
  product: Product & { variants: Variant[] };
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null
  );

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const displayPrice = selectedVariant?.price ?? product.price;
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];

  return (
    <div className="max-w-7xl mx-auto px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16">
        {/* Gallery */}
        <ProductGallery images={images} productName={product.name} />

        {/* Product Info — sticky */}
        <div className="lg:sticky lg:top-28 space-y-6 self-start">
          <div>
            <p className="text-ash text-xs tracking-[0.2em] uppercase font-sans mb-3">
              {product.subcategory ?? product.category}
            </p>
            <h1 className="font-display text-ivory font-light text-4xl leading-tight mb-4">
              {product.name}
            </h1>
            <p className="text-gold-warm font-sans font-light text-2xl">
              {formatPrice(displayPrice)}
            </p>
            {product.compareAtPrice !== null &&
              product.compareAtPrice !== undefined &&
              product.compareAtPrice > displayPrice && (
                <p className="text-ash font-sans text-sm line-through mt-1">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
          </div>

          {product.shortDescription && (
            <p className="text-parchment font-sans font-light text-base leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          {/* Add to Cart */}
          <AddToCart product={product} selectedVariant={selectedVariant} />

          {/* Scent Profile */}
          {product.scentNotes && (
            <ScentProfile scentNotes={product.scentNotes} />
          )}

          {/* Accordion sections */}
          <div className="border-t border-iron pt-6 space-y-0">
            {[
              { title: "Description", content: product.description },
              { title: "Details", content: product.ingredients },
              {
                title: "Shipping & Returns",
                content:
                  "Free shipping on orders over R500. Returns accepted within 14 days of delivery.",
              },
            ]
              .filter((s) => s.content)
              .map((section) => (
                <details key={section.title} className="border-b border-iron group">
                  <summary className="flex items-center justify-between py-4 cursor-pointer text-ivory text-sm tracking-[0.1em] uppercase font-sans list-none">
                    {section.title}
                    <span className="text-ash group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="text-parchment font-sans font-light text-sm leading-relaxed pb-4">
                    {section.content}
                  </p>
                </details>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
