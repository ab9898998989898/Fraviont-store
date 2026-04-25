import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { storeSettings } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";

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
  get: protectedProcedure.query(async () => {
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

  update: protectedProcedure
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
});
