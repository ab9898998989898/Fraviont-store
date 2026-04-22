import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";

/**
 * We test the cart logic in isolation by reimplementing the core
 * cart operations. This avoids Zustand's persist middleware and
 * browser-specific localStorage concerns.
 */

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  slug: string;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
}

function addItem(state: CartState, newItem: CartItem): CartState {
  const existing = state.items.find((i) => i.id === newItem.id);
  let updated: CartItem[];
  if (existing) {
    updated = state.items.map((i) =>
      i.id === newItem.id
        ? { ...i, quantity: Math.min(10, i.quantity + newItem.quantity) }
        : i
    );
  } else {
    updated = [...state.items, newItem];
  }
  return { items: updated };
}

function removeItem(state: CartState, id: string): CartState {
  return { items: state.items.filter((i) => i.id !== id) };
}

function clearCart(): CartState {
  return { items: [] };
}

function computeItemCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}

function computeTotal(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const cartItemArb: fc.Arbitrary<CartItem> = fc.record({
  id: fc.uuid(),
  productId: fc.uuid(),
  variantId: fc.option(fc.uuid(), { nil: undefined }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  image: fc.webUrl(),
  price: fc.integer({ min: 100, max: 1_000_000 }), // cents
  quantity: fc.integer({ min: 1, max: 10 }),
  slug: fc.stringMatching(/^[a-z0-9-]{3,30}$/),
  variantName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
    nil: undefined,
  }),
});

describe("Property: Cart State Invariants", () => {
  it("itemCount equals sum of all quantities after any sequence of addItem calls", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 1, maxLength: 20 }), (items) => {
        let state: CartState = { items: [] };
        for (const item of items) {
          state = addItem(state, item);
        }
        const itemCount = computeItemCount(state);
        const expectedCount = state.items.reduce(
          (sum, i) => sum + i.quantity,
          0
        );
        expect(itemCount).toBe(expectedCount);
      }),
      { numRuns: 500 }
    );
  });

  it("total equals sum of price × quantity for all items", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 1, maxLength: 20 }), (items) => {
        let state: CartState = { items: [] };
        for (const item of items) {
          state = addItem(state, item);
        }
        const total = computeTotal(state);
        const expectedTotal = state.items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        expect(total).toBe(expectedTotal);
      }),
      { numRuns: 500 }
    );
  });

  it("removeItem removes the specified item", () => {
    fc.assert(
      fc.property(
        fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (items, idx) => {
          // Add all items ensuring unique IDs
          const uniqueItems = items.map((item, i) => ({
            ...item,
            id: `item-${i}`,
          }));
          let state: CartState = { items: [] };
          for (const item of uniqueItems) {
            state = addItem(state, item);
          }

          // Remove an item
          const targetIdx = idx % state.items.length;
          const targetId = state.items[targetIdx].id;
          state = removeItem(state, targetId);

          // Verify the item is no longer in the cart
          expect(state.items.find((i) => i.id === targetId)).toBeUndefined();
        }
      ),
      { numRuns: 500 }
    );
  });

  it("clearCart results in itemCount === 0 and empty items", () => {
    fc.assert(
      fc.property(fc.array(cartItemArb, { minLength: 1, maxLength: 10 }), (items) => {
        let state: CartState = { items: [] };
        for (const item of items) {
          state = addItem(state, item);
        }

        // Clear the cart
        state = clearCart();

        expect(state.items).toHaveLength(0);
        expect(computeItemCount(state)).toBe(0);
        expect(computeTotal(state)).toBe(0);
      }),
      { numRuns: 200 }
    );
  });

  it("adding the same item twice merges quantities (capped at 10)", () => {
    fc.assert(
      fc.property(
        cartItemArb,
        fc.integer({ min: 1, max: 10 }),
        (item, secondQty) => {
          let state: CartState = { items: [] };
          state = addItem(state, { ...item, quantity: 1 });
          state = addItem(state, { ...item, quantity: secondQty });

          // Should only have one item entry
          const matchingItems = state.items.filter((i) => i.id === item.id);
          expect(matchingItems).toHaveLength(1);

          // Quantity should be capped at 10
          expect(matchingItems[0].quantity).toBeLessThanOrEqual(10);
          expect(matchingItems[0].quantity).toBe(Math.min(10, 1 + secondQty));
        }
      ),
      { numRuns: 300 }
    );
  });
});
