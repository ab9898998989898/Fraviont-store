import { z } from "zod";
import { eq, gte, lt, and, lte, desc, sql } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { orders, products, productVariants, customers } from "@/server/db/schema";

export const analyticsRouter = createTRPCRouter({
  getDashboardStats: adminProcedure.query(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

    const [todayOrders, yesterdayOrders, weekOrders, recentOrders, lowStockVariants] =
      await Promise.all([
        db.select().from(orders).where(
          and(gte(orders.createdAt, todayStart), eq(orders.paymentStatus, "paid"))
        ),
        db.select().from(orders).where(
          and(
            gte(orders.createdAt, yesterdayStart),
            lt(orders.createdAt, todayStart),
            eq(orders.paymentStatus, "paid")
          )
        ),
        db.select().from(orders).where(
          and(gte(orders.createdAt, weekStart), eq(orders.paymentStatus, "paid"))
        ),
        db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
        db.select({
          id: productVariants.id,
          sku: productVariants.sku,
          name: productVariants.name,
          stock: productVariants.stock,
          lowStockThreshold: productVariants.lowStockThreshold,
        }).from(productVariants).where(
          lte(productVariants.stock, productVariants.lowStockThreshold)
        ),
      ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue = weekOrders.length > 0 ? Math.round(weekRevenue / weekOrders.length) : 0;

    return {
      todayRevenue,
      yesterdayRevenue,
      todayOrders: todayOrders.length,
      weekOrders: weekOrders.length,
      avgOrderValue,
      recentOrders,
      lowStockVariants,
    };
  }),

  getRevenue: adminProcedure
    .input(z.object({ period: z.enum(["7d", "30d", "90d", "12m"]) }))
    .query(async ({ input }) => {
      const now = new Date();
      const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : 365;
      const start = new Date(now.getTime() - days * 86400000);

      const rows = await db
        .select()
        .from(orders)
        .where(and(gte(orders.createdAt, start), eq(orders.paymentStatus, "paid")));

      const byDate = new Map<string, number>();
      rows.forEach((o) => {
        if (!o.createdAt) return;
        const date = o.createdAt.toISOString().slice(0, 10);
        byDate.set(date, (byDate.get(date) ?? 0) + o.total);
      });

      return Array.from(byDate.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }),

  getOrderStats: adminProcedure.query(async () => {
    const allOrders = await db.select({ status: orders.status }).from(orders);
    const byStatus = allOrders.reduce<Record<string, number>>((acc, o) => {
      const s = o.status ?? "pending";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});
    return { total: allOrders.length, byStatus };
  }),

  getTopProducts: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const topProducts = await db
        .select({ id: products.id, name: products.name, price: products.price })
        .from(products)
        .where(eq(products.isActive, true))
        .limit(input.limit);
      return topProducts;
    }),

  getCustomerStats: adminProcedure.query(async () => {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(customers);
    return { totalCustomers: Number(total?.count ?? 0) };
  }),

  getPnL: adminProcedure.query(async () => {
    const paidOrders = await db
      .select({ total: orders.total })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
    return { revenue, expenses: 0, profit: revenue };
  }),
});
