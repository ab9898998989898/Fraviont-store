import { z } from "zod";
import { eq, ilike, or, desc } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { customers, orders } from "@/server/db/schema";

export const customersRouter = createTRPCRouter({
  getAll: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const where = input.search
        ? or(
            ilike(customers.name, `%${input.search}%`),
            ilike(customers.email, `%${input.search}%`)
          )
        : undefined;

      const [rows, allRows] = await Promise.all([
        db
          .select()
          .from(customers)
          .where(where)
          .orderBy(desc(customers.createdAt))
          .limit(input.limit)
          .offset(offset),
        db.select({ id: customers.id }).from(customers).where(where),
      ]);

      return { customers: rows, total: allRows.length };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, input.id))
        .limit(1);

      if (!customer) return null;

      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, customer.id))
        .orderBy(desc(orders.createdAt));

      return { ...customer, orders: customerOrders };
    }),
});
