"use client";

import { useRef } from "react";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";
import { revealStagger } from "@/lib/gsap/animations/scrollReveal";
import { useCartStore } from "@/lib/stores/cart.store";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 50000; // R500 in cents

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const { items, total, itemCount, removeItem, updateQuantity } = useCartStore();

  useGSAP(
    () => {
      if (!open) return;
      const validItems = itemRefs.current.filter(Boolean) as HTMLElement[];
      if (validItems.length > 0) revealStagger(validItems);

      // Animate free shipping progress bar
      if (progressBarRef.current) {
        const pct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
        gsap.to(progressBarRef.current, {
          width: `${pct}%`,
          duration: 0.6,
          ease: EASE.enter,
        });
      }
    },
    { scope: drawerRef, dependencies: [open, items] }
  );

  function handleRemove(id: string, el: HTMLDivElement | null) {
    if (el) {
      gsap.to(el, {
        x: 40,
        opacity: 0,
        height: 0,
        duration: 0.35,
        ease: EASE.exit,
        onComplete: () => removeItem(id),
      });
    } else {
      removeItem(id);
    }
  }

  const remaining = FREE_SHIPPING_THRESHOLD - total;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-obsidian/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-[201] w-full max-w-md bg-[#111111] border-l border-iron flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-iron">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-gold-warm" />
            <span className="text-ivory text-sm tracking-[0.1em] uppercase font-sans">
              Your Collection ({itemCount})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ash hover:text-ivory transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="px-6 py-3 border-b border-iron">
          {remaining > 0 ? (
            <p className="text-ash text-xs font-sans mb-2">
              {formatPrice(remaining)} away from free shipping
            </p>
          ) : (
            <p className="text-gold-warm text-xs font-sans mb-2">
              ✓ You qualify for free shipping
            </p>
          )}
          <div className="h-px bg-iron w-full">
            <div
              ref={progressBarRef}
              className="h-px bg-gold-warm"
              style={{ width: "0%" }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={40} className="text-iron" />
              <p className="text-ash font-sans font-light text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) itemRefs.current[i] = el;
                }}
                className="flex gap-4 py-4 border-b border-iron/50"
              >
                {/* Image */}
                <div className="relative w-16 h-20 bg-graphite flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-graphite" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-ivory text-sm font-sans font-light truncate">{item.name}</p>
                  {item.variantName && (
                    <p className="text-ash text-xs font-sans mt-0.5">{item.variantName}</p>
                  )}
                  <p className="text-gold-warm text-sm font-sans mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-0 mt-2 border border-iron w-fit">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-ash hover:text-ivory transition-colors border-r border-iron"
                      aria-label="Decrease"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-8 text-center text-ivory text-xs font-sans">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-ash hover:text-ivory transition-colors border-l border-iron"
                      aria-label="Increase"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => {
                    const el = itemRefs.current[i] ?? null;
                    handleRemove(item.id, el);
                  }}
                  className="text-ash hover:text-crimson transition-colors self-start mt-1"
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-iron space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ash text-sm font-sans uppercase tracking-[0.1em]">Subtotal</span>
              <span className="text-gold-warm font-sans text-lg font-light">
                {formatPrice(total)}
              </span>
            </div>
            <a
              href="/checkout"
              className="block w-full bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium py-4 text-center hover:bg-gold-bright transition-colors duration-300"
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
