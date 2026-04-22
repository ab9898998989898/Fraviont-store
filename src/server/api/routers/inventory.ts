import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { productVariants, products, inventoryLogs } from "@/server/db/schema";

export const inventoryRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    const variants = await db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        name: productVariants.name,
        stock: productVariants.stock,
        lowStockThreshold: productVariants.lowStockThreshold,
        updatedAt: productVariants.updatedAt,
        productId: productVariants.productId,
        productName: products.name,
        productCategory: products.category,
      })
      .from(productVariants)
      .leftJoin(products, eq(productVariants.productId, products.id))
      .orderBy(productVariants.stock);
    return variants;
  }),

  adjust: adminProcedure
    .input(
      z.object({
        variantId: z.string().uuid(),
        type: z.enum(["restock", "sale", "adjustment", "return"]),
        quantityChange: z.number().int(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, input.variantId))
        .limit(1);

      if (!variant) throw new Error("Variant not found");

      const newQuantity = Math.max(0, variant.stock + input.quantityChange);

      await db
        .update(productVariants)
        .set({ stock: newQuantity, updatedAt: new Date() })
        .where(eq(productVariants.id, input.variantId));

      await db.insert(inventoryLogs).values({
        variantId: input.variantId,
        type: input.type,
        quantityChange: input.quantityChange,
        newQuantity,
        note: input.note,
      });

      return { newQuantity };
    }),

  getLogs: adminProcedure
    .input(z.object({ variantId: z.string().uuid().optional() }))
    .query(async ({ input }) => {
      if (input.variantId) {
        return db
          .select()
          .from(inventoryLogs)
          .where(eq(inventoryLogs.variantId, input.variantId))
          .orderBy(desc(inventoryLogs.createdAt))
          .limit(100);
      }

      return db
        .select()
        .from(inventoryLogs)
        .orderBy(desc(inventoryLogs.createdAt))
        .limit(100);
    }),
});
