"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { useCartStore } from "@/lib/stores/cart.store";
import type { InferSelectModel } from "drizzle-orm";
import type { products, productVariants } from "@/server/db/schema";

type Product = InferSelectModel<typeof products>;
type Variant = InferSelectModel<typeof productVariants>;

interface AddToCartProps {
  product: Product;
  selectedVariant: Variant | null;
}

export function AddToCart({ product, selectedVariant }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  useGSAP({ scope: buttonRef });

  function handleAddToCart() {
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0]! : "",
      price: selectedVariant?.price ?? product.price,
      quantity,
      slug: product.slug,
      variantName: selectedVariant?.name,
    });

    // Scale pulse animation
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.97 },
        { scale: 1.0, duration: 0.3, ease: "power2.out" }
      );
    }
  }

  const maxStock = selectedVariant?.stock ?? 99;

  return (
    <div className="space-y-4">
      {/* Quantity stepper */}
      <div className="flex items-center gap-0 border border-iron w-fit">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-10 h-10 flex items-center justify-center text-parchment hover:text-gold-warm transition-colors border-r border-iron"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-12 text-center text-ivory font-sans text-sm">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(10, maxStock, q + 1))}
          className="w-10 h-10 flex items-center justify-center text-parchment hover:text-gold-warm transition-colors border-l border-iron"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* Add to cart button */}
      <button
        ref={buttonRef}
        onClick={handleAddToCart}
        disabled={maxStock === 0}
        className="w-full bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium py-4 hover:bg-gold-bright transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {maxStock === 0 ? "Out of Stock" : "Add to Collection"}
      </button>
    </div>
  );
}
