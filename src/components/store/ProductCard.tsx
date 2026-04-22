"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { setupCardHover } from "@/lib/gsap/animations/productCard";
import { formatPrice } from "@/lib/utils";
import type { products } from "@/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Product = InferSelectModel<typeof products>;

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (cardRef.current) setupCardHover(cardRef.current);
    },
    { scope: cardRef }
  );

  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  return (
    <Link href={`/product/${product.slug}`}>
      <div ref={cardRef} className="group bg-charcoal cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-graphite">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="card-image object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="card-image absolute inset-0 bg-gradient-to-b from-graphite to-charcoal" />
          )}
          <div className="card-overlay absolute inset-0 bg-obsidian/40 opacity-0 flex items-center justify-center">
            <span className="text-ivory text-xs tracking-[0.2em] uppercase font-sans border border-ivory/50 px-4 py-2">
              View Details
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="card-info p-4 space-y-1">
          <p className="text-ash text-[10px] tracking-[0.2em] uppercase font-sans">
            {product.subcategory ?? product.category}
          </p>
          <h3 className="font-display text-ivory text-xl font-light leading-tight">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-parchment text-sm font-sans font-light line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className="text-gold-warm font-sans font-light text-base">
              {formatPrice(product.price)}
            </span>
            <span className="text-ash text-xs tracking-[0.1em] uppercase font-sans hover:text-gold-warm transition-colors">
              Add to Cart →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
