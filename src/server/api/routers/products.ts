import { z } from "zod";
import { eq, and, ilike, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { products, productVariants } from "@/server/db/schema";
import { withCache, redis } from "@/lib/redis/client";
import { createHash } from "crypto";

function hashInput(input: unknown): string {
  return createHash("md5").update(JSON.stringify(input)).digest("hex").slice(0, 8);
}

const ProductVariantInput = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  weight: z.number().int().positive().optional(),
});

const ProductCreateInput = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  category: z.enum(["perfumes", "cosmetics", "jewelry", "gift_sets"]),
  subcategory: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  ingredients: z.string().optional(),
  scentNotes: z
    .object({
      top: z.array(z.string()),
      middle: z.array(z.string()),
      base: z.array(z.string()),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(ProductVariantInput).default([]),
});

export const productsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        category: z.enum(["perfumes", "cosmetics", "jewelry", "gift_sets"]).optional(),
        search: z.string().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(12),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = `products:list:${hashInput(input)}`;
      return withCache(cacheKey, 120, async () => {
        const offset = (input.page - 1) * input.limit;

        const conditions = [eq(products.isActive, true)];
        if (input.category) conditions.push(eq(products.category, input.category));
        if (input.search) conditions.push(ilike(products.name, `%${input.search}%`));

        const where = and(...conditions);

        const [rows, allRows] = await Promise.all([
          db
            .select()
            .from(products)
            .where(where)
            .orderBy(desc(products.createdAt))
            .limit(input.limit)
            .offset(offset),
          db.select({ id: products.id }).from(products).where(where),
        ]);

        const total = allRows.length;
        return {
          products: rows,
          total,
          hasMore: offset + rows.length < total,
        };
      });
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `products:slug:${input.slug}`;
      return withCache(cacheKey, 300, async () => {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.slug, input.slug))
          .limit(1);

        if (!product) return null;

        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id));

        return { ...product, variants };
      });
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      if (!product) return null;
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));
      return { ...product, variants };
    }),

  create: adminProcedure
    .input(ProductCreateInput)
    .mutation(async ({ input }) => {
      const { variants, ...productData } = input;
      const [product] = await db.insert(products).values(productData).returning();
      if (!product) throw new Error("Failed to create product");
      if (variants.length > 0) {
        await db.insert(productVariants).values(
          variants.map((v) => ({ ...v, productId: product.id }))
        );
      }
      await redis.del(`products:slug:${product.slug}`);
      return product;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid() }).merge(ProductCreateInput.partial()))
    .mutation(async ({ input }) => {
      const { id, variants, ...updateData } = input;
      const [product] = await db
        .update(products)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      if (!product) throw new Error("Product not found");
      await redis.del(`products:slug:${product.slug}`);
      await redis.del(`products:id:${id}`);
      return product;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [product] = await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, input.id))
        .returning();
      if (!product) throw new Error("Product not found");
      await redis.del(`products:slug:${product.slug}`);
      return { success: true };
    }),
});
