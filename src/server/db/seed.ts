import { db } from "./index";
import { products, productVariants, users, customers, orders, orderItems } from "./schema";
import { generateOrderNumber } from "@/lib/utils";
import { hash } from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const hashedPassword = await hash("Fraviont@2026!", 12);
  await db
    .insert(users)
    .values({
      id: "admin-seed-001",
      name: "Fraviont Admin",
      email: "admin@fraviont.com",
      role: "ADMIN",
      password: hashedPassword,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✓ Admin user created (admin@fraviont.com / Fraviont@2026!)");

  // ─── Products ─────────────────────────────────────────────────────────────
  const productData = [
    // Perfumes
    {
      slug: "fraviont-oud-noir",
      name: "Oud Noir",
      shortDescription: "A deep, smoky oud with notes of black amber and sandalwood.",
      description:
        "Oud Noir is an olfactory journey into the heart of darkness — rich, complex, and utterly captivating. The opening is bold and resinous, softening into a warm embrace of sandalwood and musk.",
      price: 285000, // R2850.00
      category: "perfumes" as const,
      subcategory: "Eau de Parfum",
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800"],
      tags: ["oud", "woody", "oriental"],
      scentNotes: {
        top: ["Black Pepper", "Saffron"],
        middle: ["Oud", "Rose"],
        base: ["Sandalwood", "Amber", "Musk"],
      },
      isActive: true,
      isFeatured: true,
    },
    {
      slug: "rose-absolue",
      name: "Rose Absolue",
      shortDescription: "Pure Bulgarian rose with a whisper of white musk.",
      description:
        "Rose Absolue captures the essence of a rose garden at dawn — dewy, luminous, and impossibly soft. A modern floral for those who wear their femininity with quiet confidence.",
      price: 195000, // R1950.00
      category: "perfumes" as const,
      subcategory: "Eau de Parfum",
      images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800"],
      tags: ["floral", "rose", "feminine"],
      scentNotes: {
        top: ["Bergamot", "Lychee"],
        middle: ["Bulgarian Rose", "Peony"],
        base: ["White Musk", "Cedarwood"],
      },
      isActive: true,
      isFeatured: true,
    },
    {
      slug: "amber-dusk",
      name: "Amber Dusk",
      shortDescription: "Warm amber and vanilla with a hint of smoked wood.",
      description:
        "Amber Dusk is the scent of golden hour — warm, enveloping, and deeply comforting. It lingers on the skin like a memory you never want to forget.",
      price: 165000, // R1650.00
      category: "perfumes" as const,
      subcategory: "Eau de Toilette",
      images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800"],
      tags: ["amber", "warm", "vanilla"],
      scentNotes: {
        top: ["Cardamom", "Bergamot"],
        middle: ["Amber", "Jasmine"],
        base: ["Vanilla", "Smoked Wood", "Tonka Bean"],
      },
      isActive: true,
      isFeatured: false,
    },
    // Cosmetics
    {
      slug: "velvet-lip-elixir",
      name: "Velvet Lip Elixir",
      shortDescription: "A luxurious lip treatment in deep berry tones.",
      description:
        "The Velvet Lip Elixir delivers intense colour with the comfort of a balm. Infused with rosehip oil and vitamin E, it nourishes while it adorns.",
      price: 45000, // R450.00
      category: "cosmetics" as const,
      subcategory: "Lip",
      images: ["https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=800"],
      tags: ["lip", "colour", "nourishing"],
      isActive: true,
      isFeatured: false,
    },
    {
      slug: "luminous-serum",
      name: "Luminous Serum",
      shortDescription: "A brightening serum with 15% Vitamin C complex.",
      description:
        "The Luminous Serum is a concentrated dose of radiance. Formulated with a stabilised Vitamin C complex and hyaluronic acid, it visibly brightens and plumps the skin.",
      price: 89500, // R895.00
      category: "cosmetics" as const,
      subcategory: "Skincare",
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800"],
      tags: ["serum", "vitamin-c", "brightening"],
      isActive: true,
      isFeatured: true,
    },
    // Jewelry
    {
      slug: "gold-arc-earrings",
      name: "Gold Arc Earrings",
      shortDescription: "Minimalist 18k gold-plated arc earrings.",
      description:
        "The Gold Arc Earrings are a study in elegant restraint. Crafted from sterling silver with 18k gold plating, their fluid arc form catches light with every movement.",
      price: 125000, // R1250.00
      category: "jewelry" as const,
      subcategory: "Earrings",
      images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"],
      tags: ["gold", "minimalist", "earrings"],
      isActive: true,
      isFeatured: true,
    },
    {
      slug: "obsidian-ring",
      name: "Obsidian Ring",
      shortDescription: "Sterling silver ring with a polished obsidian stone.",
      description:
        "The Obsidian Ring is a statement of quiet power. The deep black stone, set in a clean sterling silver band, speaks to those who understand that true luxury needs no embellishment.",
      price: 185000, // R1850.00
      category: "jewelry" as const,
      subcategory: "Rings",
      images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"],
      tags: ["ring", "obsidian", "statement"],
      isActive: true,
      isFeatured: false,
    },
    // Gift Sets
    {
      slug: "the-discovery-set",
      name: "The Discovery Set",
      shortDescription: "Three 10ml travel sizes of our bestselling perfumes.",
      description:
        "The Discovery Set is the perfect introduction to the Fraviont universe. Three 10ml travel atomisers — Oud Noir, Rose Absolue, and Amber Dusk — presented in a signature black box.",
      price: 95000, // R950.00
      category: "gift_sets" as const,
      subcategory: "Fragrance",
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"],
      tags: ["gift", "travel", "discovery"],
      isActive: true,
      isFeatured: true,
    },
  ];

  const insertedProducts = await db
    .insert(products)
    .values(productData)
    .onConflictDoNothing()
    .returning();

  console.log(`✓ ${insertedProducts.length} products created`);

  // ─── Variants ─────────────────────────────────────────────────────────────
  const variantData: {
    productId: string;
    sku: string;
    name: string;
    price?: number;
    stock: number;
    lowStockThreshold: number;
  }[] = [];

  for (const product of insertedProducts) {
    if (product.category === "perfumes") {
      variantData.push(
        {
          productId: product.id,
          sku: `${product.slug}-30ml`,
          name: "30ml",
          price: Math.round(product.price * 0.6),
          stock: 25,
          lowStockThreshold: 5,
        },
        {
          productId: product.id,
          sku: `${product.slug}-50ml`,
          name: "50ml",
          price: product.price,
          stock: 40,
          lowStockThreshold: 8,
        },
        {
          productId: product.id,
          sku: `${product.slug}-100ml`,
          name: "100ml",
          price: Math.round(product.price * 1.6),
          stock: 15,
          lowStockThreshold: 3,
        },
      );
    } else if (product.category === "jewelry") {
      variantData.push(
        { productId: product.id, sku: `${product.slug}-s`, name: "Small", stock: 10, lowStockThreshold: 2 },
        { productId: product.id, sku: `${product.slug}-m`, name: "Medium", stock: 15, lowStockThreshold: 3 },
        { productId: product.id, sku: `${product.slug}-l`, name: "Large", stock: 8, lowStockThreshold: 2 },
      );
    } else {
      variantData.push({
        productId: product.id,
        sku: `${product.slug}-std`,
        name: "Standard",
        stock: 30,
        lowStockThreshold: 5,
      });
    }
  }

  if (variantData.length > 0) {
    await db.insert(productVariants).values(variantData).onConflictDoNothing();
    console.log(`✓ ${variantData.length} variants created`);
  }

  // ─── Sample Customer ──────────────────────────────────────────────────────
  const [customer] = await db
    .insert(customers)
    .values({
      email: "customer@example.com",
      name: "Sample Customer",
      totalOrders: 1,
      totalSpent: 285000,
    })
    .onConflictDoNothing()
    .returning();

  if (customer) {
    // ─── Sample Order ──────────────────────────────────────────────────────
    const firstProduct = insertedProducts[0];
    if (firstProduct) {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          customerId: customer.id,
          email: customer.email,
          status: "delivered",
          paymentStatus: "paid",
          subtotal: 285000,
          total: 285000,
          shippingAddress: {
            firstName: "Sample",
            lastName: "Customer",
            line1: "123 Luxury Lane",
            city: "Cape Town",
            province: "Western Cape",
            postalCode: "8001",
            country: "ZA",
          },
        })
        .returning();

      if (order) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: firstProduct.id,
          name: firstProduct.name,
          sku: `${firstProduct.slug}-50ml`,
          quantity: 1,
          unitPrice: firstProduct.price,
          totalPrice: firstProduct.price,
        });
        console.log("✓ Sample order created");
      }
    }
    console.log("✓ Sample customer created");
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
