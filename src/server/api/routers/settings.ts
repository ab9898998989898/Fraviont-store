import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { storeSettings, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

const settingsSchema = z.object({
  storeName: z.string().min(1),
  storeTagline: z.string().min(1),
  contactEmail: z.string().email(),
  currency: z.string().min(1),
  orderAlerts: z.boolean(),
  lowStockAlerts: z.boolean(),
  returnRequests: z.boolean(),
  customerSignups: z.boolean(),
  weeklyDigest: z.boolean(),
});

export const settingsRouter = createTRPCRouter({
  get: adminProcedure.query(async () => {
    // We only expect one settings row. If it doesn't exist, return defaults or create it.
    const settings = await db.query.storeSettings.findFirst();
    if (settings) return settings;

    // Create default settings if none exist
    const [newSettings] = await db
      .insert(storeSettings)
      .values({})
      .returning();
    return newSettings;
  }),

  update: adminProcedure
    .input(settingsSchema)
    .mutation(async ({ input }) => {
      const existing = await db.query.storeSettings.findFirst();
      
      if (existing) {
        const [updated] = await db
          .update(storeSettings)
          .set(input)
          .where(eq(storeSettings.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(storeSettings)
          .values(input)
          .returning();
        return created;
      }
    }),

  updatePassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (user.password) {
        const isValid = await bcrypt.compare(input.currentPassword, user.password);
        if (!isValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect current password" });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

      return { success: true };
    }),
});

