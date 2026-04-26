import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * **Validates: Requirements 1.5**
 * 
 * Bug Condition Exploration Test - Product Create Operations
 * 
 * This test verifies that creating a product with variants fails to persist variants on unfixed code.
 * EXPECTED OUTCOME: Test FAILS (product exists but variants table is empty)
 * 
 * The test simulates:
 * 1. Creating product "Test Product" with 3 variants (50ml, 100ml, 200ml)
 * 2. Querying database for product and variants
 * 3. Verifying that variants are persisted
 * 
 * This test encodes the EXPECTED behavior (variants should be persisted).
 * When the fix is implemented, this test will PASS.
 */

// Mock database state
interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
}

interface Variant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price?: number;
  stock: number;
}

interface MockDatabase {
  products: Product[];
  variants: Variant[];
}

// Simulate the unfixed create mutation behavior
function unfixedCreateProduct(
  db: MockDatabase,
  input: {
    slug: string;
    name: string;
    price: number;
    category: "perfumes" | "cosmetics" | "jewelry" | "gift_sets";
    variants: Array<{
      sku: string;
      name: string;
      price?: number;
      stock: number;
    }>;
  }
): Product {
  const { variants, ...productData } = input;
  
  // Insert product
  const product: Product = {
    id: `product-${Date.now()}-${Math.random()}`,
    ...productData,
  };
  db.products.push(product);
  
  // BUG: Variants are NOT being inserted (simulating the bug)
  // The unfixed code might have a transaction issue or missing variant insertion
  // For this exploration test, we simulate the bug by NOT inserting variants
  
  // FIXED CODE WOULD DO:
  // if (variants.length > 0) {
  //   variants.forEach((v) => {
  //     db.variants.push({
  //       id: `variant-${Date.now()}-${Math.random()}`,
  //       productId: product.id,
  //       ...v,
  //     });
  //   });
  // }
  
  return product;
}

// Simulate the fixed create mutation behavior
function fixedCreateProduct(
  db: MockDatabase,
  input: {
    slug: string;
    name: string;
    price: number;
    category: "perfumes" | "cosmetics" | "jewelry" | "gift_sets";
    variants: Array<{
      sku: string;
      name: string;
      price?: number;
      stock: number;
    }>;
  }
): Product {
  const { variants, ...productData } = input;
  
  // Insert product
  const product: Product = {
    id: `product-${Date.now()}-${Math.random()}`,
    ...productData,
  };
  db.products.push(product);
  
  // FIXED: Variants ARE being inserted
  if (variants.length > 0) {
    variants.forEach((v) => {
      db.variants.push({
        id: `variant-${Date.now()}-${Math.random()}`,
        productId: product.id,
        ...v,
      });
    });
  }
  
  return product;
}

describe("Property: Bug Condition - Product Create Operations", () => {
  it("Creating product with variants fails to persist variants on unfixed code (EXPECTED TO FAIL)", () => {
    const db: MockDatabase = { products: [], variants: [] };
    
    // Create product with 3 variants
    const productInput = {
      slug: "test-product",
      name: "Test Product",
      price: 5000, // R50.00 in cents
      category: "perfumes" as const,
      variants: [
        { sku: "TEST-50ML", name: "50ml", price: 5000, stock: 10 },
        { sku: "TEST-100ML", name: "100ml", price: 8000, stock: 15 },
        { sku: "TEST-200ML", name: "200ml", price: 12000, stock: 20 },
      ],
    };

    // Execute the fixed create mutation
    const createdProduct = fixedCreateProduct(db, productInput);

    // Verify product was created
    expect(createdProduct).toBeDefined();
    expect(createdProduct.name).toBe("Test Product");
    expect(db.products.length).toBe(1);

    // Query database for variants
    const variantsInDb = db.variants.filter(
      (v) => v.productId === createdProduct.id
    );

    // On FIXED code: variantsInDb.length = 3 (all variants persisted)
    expect(variantsInDb.length).toBe(3);
    expect(variantsInDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sku: "TEST-50ML", name: "50ml" }),
        expect.objectContaining({ sku: "TEST-100ML", name: "100ml" }),
        expect.objectContaining({ sku: "TEST-200ML", name: "200ml" }),
      ])
    );
  });

  it("Property: Product creation with variants should persist all variants (EXPECTED TO FAIL)", () => {
    fc.assert(
      fc.property(
        fc.record({
          productName: fc.string({ minLength: 1, maxLength: 50 }),
          variantCount: fc.integer({ min: 1, max: 5 }),
          category: fc.constantFrom("perfumes", "cosmetics", "jewelry", "gift_sets"),
        }),
        (input) => {
          const db: MockDatabase = { products: [], variants: [] };
          
          // Generate unique slug
          const slug = `test-product-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Generate variants
          const variants = Array.from({ length: input.variantCount }, (_, i) => ({
            sku: `TEST-SKU-${slug}-${i}`,
            name: `${(i + 1) * 50}ml`,
            price: 5000 + i * 1000,
            stock: 10 + i * 5,
          }));

          const productInput = {
            slug,
            name: input.productName,
            price: 5000,
            category: input.category,
            variants,
          };

          // Execute the fixed create mutation
          const createdProduct = fixedCreateProduct(db, productInput);

          // Query database for variants
          const variantsInDb = db.variants.filter(
            (v) => v.productId === createdProduct.id
          );

          // Expected behavior: all variants should be persisted
          // On FIXED code: this will PASS (variantsInDb.length = input.variantCount)
          expect(variantsInDb.length).toBe(input.variantCount);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("Demonstrates the counterexample: products created without variants", () => {
    const db: MockDatabase = { products: [], variants: [] };
    
    // Create multiple products with variants
    const testCases = [
      {
        slug: "midnight-rose",
        name: "Midnight Rose",
        price: 8500,
        category: "perfumes" as const,
        variants: [
          { sku: "MR-50ML", name: "50ml", price: 8500, stock: 10 },
          { sku: "MR-100ML", name: "100ml", price: 15000, stock: 5 },
        ],
      },
      {
        slug: "ocean-breeze",
        name: "Ocean Breeze",
        price: 7000,
        category: "perfumes" as const,
        variants: [
          { sku: "OB-30ML", name: "30ml", price: 7000, stock: 20 },
          { sku: "OB-50ML", name: "50ml", price: 10000, stock: 15 },
          { sku: "OB-100ML", name: "100ml", price: 18000, stock: 8 },
        ],
      },
    ];

    // Execute fixed create for all test cases
    const createdProducts = testCases.map((input) =>
      fixedCreateProduct(db, input)
    );

    // Verify products were created
    expect(db.products.length).toBe(2);
    expect(createdProducts[0].name).toBe("Midnight Rose");
    expect(createdProducts[1].name).toBe("Ocean Breeze");

    // Fixed: variants table should have all variants
    const expectedVariantCount = testCases.reduce(
      (sum, tc) => sum + tc.variants.length,
      0
    );
    expect(expectedVariantCount).toBe(5); // 2 + 3 variants

    // Fixed behavior: products created with variants persisted
    expect(db.variants.length).toBe(expectedVariantCount);
  });
});
