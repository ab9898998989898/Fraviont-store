"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/5] bg-graphite overflow-hidden">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-graphite to-charcoal" />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden border transition-colors duration-200 ${
                i === activeIndex ? "border-gold-warm" : "border-iron hover:border-smoke"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="10vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
