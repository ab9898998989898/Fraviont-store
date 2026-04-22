import { z } from "zod";
import { eq, desc, and, gte, lte, ilike, or } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { orders, orderItems, customers } from "@/server/db/schema";
import { Resend } from "resend";
import { ShippingNotification } from "@/lib/email/templates/ShippingNotification";

const resend = new Resend(process.env.RESEND_API_KEY);

export const ordersRouter = createTRPCRouter({
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.session.user.email;
    if (!userEmail) return [];

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, userEmail))
      .limit(1);

    if (!customer) return [];

    return db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customer.id))
      .orderBy(desc(orders.createdAt));
  }),

  getAll: adminProcedure
    .input(
      z.object({
        status: z
          .enum([
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ])
          .optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.status) conditions.push(eq(orders.status, input.status));
      if (input.dateFrom)
        conditions.push(gte(orders.createdAt, new Date(input.dateFrom)));
      if (input.dateTo)
        conditions.push(lte(orders.createdAt, new Date(input.dateTo)));
      if (input.search) {
        conditions.push(
          or(
            ilike(orders.orderNumber, `%${input.search}%`),
            ilike(orders.email, `%${input.search}%`),
          ),
        );
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const [rows, allRows] = await Promise.all([
        db
          .select()
          .from(orders)
          .where(where)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit)
          .offset(offset),
        db.select({ id: orders.id }).from(orders).where(where),
      ]);
      return { orders: rows, total: allRows.length };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);
      if (!order) return null;
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
        trackingNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [order] = await db
        .update(orders)
        .set({
          status: input.status,
          trackingNumber: input.trackingNumber,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id))
        .returning();

      // Send shipping notification when status changes to "shipped"
      if (order && input.status === "shipped" && input.trackingNumber) {
        resend.emails.send({
          from: "noreply@fraviont.com",
          to: order.email,
          subject: `Your Fraviont order has shipped — ${order.orderNumber}`,
          react: ShippingNotification({
            orderNumber: order.orderNumber,
            customerName: order.email,
            trackingNumber: input.trackingNumber,
          }),
        }).catch(console.error);
      }

      return order;
    }),

  addNote: adminProcedure
    .input(z.object({ id: z.string().uuid(), note: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [order] = await db
        .update(orders)
        .set({ notes: input.note, updatedAt: new Date() })
        .where(eq(orders.id, input.id))
        .returning();
      return order;
    }),
});
