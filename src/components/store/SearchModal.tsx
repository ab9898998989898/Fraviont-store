"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { EASE } from "@/lib/gsap/easings";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = api.ai.semanticSearch.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  useGSAP(
    () => {
      if (!overlayRef.current || !panelRef.current) return;
      if (open) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(panelRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: EASE.enter });
      }
    },
    { dependencies: [open] }
  );

  if (!open) return null;

  return (
    <>
      <div ref={overlayRef} className="fixed inset-0 z-[200] bg-obsidian/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={panelRef} className="fixed top-0 left-0 right-0 z-[201] bg-[#111111] border-b border-[#1E1E1E] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Search size={18} className="text-ash flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search perfumes, cosmetics, jewelry..."
              className="flex-1 bg-transparent text-ivory text-lg font-sans font-light placeholder:text-ash focus:outline-none"
            />
            <button onClick={onClose} className="text-ash hover:text-ivory transition-colors">
              <X size={20} />
            </button>
          </div>

          {isFetching && (
            <p className="text-ash text-sm font-sans text-center py-4">Searching...</p>
          )}

          {results && results.length > 0 && (
            <div className="space-y-0 max-h-80 overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 py-3 border-b border-[#1E1E1E]/50 hover:bg-[#161616] px-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory text-sm font-sans font-light truncate">{product.name}</p>
                    <p className="text-ash text-xs font-sans capitalize">{product.category}</p>
                  </div>
                  <span className="text-gold-warm text-sm font-sans flex-shrink-0">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {results && results.length === 0 && debouncedQuery.length >= 2 && !isFetching && (
            <p className="text-ash text-sm font-sans text-center py-4">
              No products found for &ldquo;{debouncedQuery}&rdquo;
            </p>
          )}
        </div>
      </div>
    </>
  );
}
