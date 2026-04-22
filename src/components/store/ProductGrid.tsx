"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { revealStagger } from "@/lib/gsap/animations/scrollReveal";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "@/components/shared/skeletons/ProductGridSkeleton";
import type { products } from "@/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Product = InferSelectModel<typeof products>;

interface ProductGridProps {
  products: Product[];
  isPending?: boolean;
}

export function ProductGrid({ products: items, isPending }: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      const validCards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (validCards.length > 0) revealStagger(validCards);
    },
    { scope: gridRef, dependencies: [items] }
  );

  if (isPending) return <ProductGridSkeleton count={9} />;

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((product, i) => (
        <div
          key={product.id}
          ref={(el) => {
            if (el) cardRefs.current[i] = el;
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
