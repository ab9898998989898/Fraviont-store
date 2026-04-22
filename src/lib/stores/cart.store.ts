import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem } from "@/server/db/schema";
import { useEffect, useState } from "react";

interface CartState {
  items: CartItem[];
  // Computed
  itemCount: number;
  total: number;
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

function computeTotals(items: CartItem[]) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find((i) => i.id === newItem.id);
        let updated: CartItem[];
        if (existing) {
          updated = items.map((i) =>
            i.id === newItem.id
              ? { ...i, quantity: Math.min(10, i.quantity + newItem.quantity) }
              : i
          );
        } else {
          updated = [...items, newItem];
        }
        set({ items: updated, ...computeTotals(updated) });
      },

      removeItem: (id) => {
        const updated = get().items.filter((i) => i.id !== id);
        set({ items: updated, ...computeTotals(updated) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const updated = get().items.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(10, quantity) } : i
        );
        set({ items: updated, ...computeTotals(updated) });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },
    }),
    {
      name: "fraviont-cart",
    }
  )
);

/**
 * Hook to check if the Zustand store has hydrated from localStorage.
 * Use this to prevent showing empty cart on first render.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // onFinishHydration fires after persist has loaded from localStorage
    const unsub = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. fast reload), set immediately
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);
  return hydrated;
}

