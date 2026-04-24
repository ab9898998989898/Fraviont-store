import { z } from "zod";
import { eq, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { products, productVariants, orders, orderItems } from "@/server/db/schema";
import { callAI } from "@/lib/ai/client";
import {
  SOPHIA_SYSTEM_PROMPT,
  buildDescriptionPrompt,
  buildProfilePrompt,
  buildDailyDigestPrompt,
  buildForecastPrompt,
} from "@/lib/ai/prompts";
import { withCache, chatRateLimiter, redis } from "@/lib/redis/client";
import { createHash } from "crypto";

export const aiRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({ message: z.string().min(1).max(1000), sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const { success } = await chatRateLimiter.limit(input.sessionId);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please wait before sending another message.",
        });
      }

      const reply = await callAI({
        model: "anthropic/claude-3-5-haiku",
        system: SOPHIA_SYSTEM_PROMPT,
        messages: [{ role: "user", content: input.message }],
        max_tokens: 500,
      });

      return { reply };
    }),

  generateDescription: adminProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const cacheKey = `ai:description:${input.productId}`;
      const cached = await redis.get<{ description: string; aiDescription: string }>(cacheKey);
      if (cached) return cached;

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

      const description = await callAI({
        model: "anthropic/claude-3-5-sonnet",
        system: buildDescriptionPrompt(product),
        messages: [{ role: "user", content: "Write the product description now." }],
        max_tokens: 400,
      });

      const result = { description, aiDescription: description };
      await redis.setex(cacheKey, 3600, result);
      return result;
    }),

  generateSEO: adminProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), ingredients: z.string().optional() }))
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an expert SEO copywriter for a high-end luxury e-commerce site. Write a meta title (max 60 chars) and meta description (max 160 chars). Return ONLY valid JSON in format: {"metaTitle": "Title", "metaDescription": "Description"}. Do not include markdown blocks.`;
      
      const raw = await callAI({
        model: "openai/gpt-4o",
        system: systemPrompt,
        messages: [{ role: "user", content: `Product Name: ${input.name}\nDesc: ${input.description}\nIngredients: ${input.ingredients}` }],
        apiKey: process.env.OPENROUTER2_API_KEY,
        max_tokens: 300,
      });

      try {
        const cleanJson = raw.replace(/```json\n?|\n?```/g, "");
        return JSON.parse(cleanJson) as { metaTitle: string, metaDescription: string };
      } catch (err) {
        console.error("Failed to parse SEO JSON:", err);
        return { metaTitle: "", metaDescription: "" };
      }
    }),

  generateProfile: publicProcedure
    .input(
      z.object({
        answers: z.record(z.string()),
        products: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const raw = await callAI({
        model: "anthropic/claude-3-5-haiku",
        system: buildProfilePrompt(input.answers, input.products),
        messages: [{ role: "user", content: "Generate my scent profile." }],
        max_tokens: 600,
      });

      try {
        const parsed = JSON.parse(raw) as {
          profile: string;
          scentFamily: string;
          recommendations: string[];
          reasoning: string;
        };
        return { profile: parsed.profile, recommendations: parsed.recommendations };
      } catch {
        return { profile: raw, recommendations: [] };
      }
    }),

  getDailyDigest: adminProcedure.query(async () => {
    return withCache("ai:digest", 60 * 60 * 23, async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart.getTime() - 86400000);
      const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

      const [todayOrders, yesterdayOrders, weekOrders] = await Promise.all([
        db.select().from(orders).where(gte(orders.createdAt, todayStart)),
        db.select().from(orders).where(gte(orders.createdAt, yesterdayStart)),
        db.select().from(orders).where(gte(orders.createdAt, weekStart)),
      ]);

      const stats = {
        todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
        yesterdayRevenue: yesterdayOrders.reduce((s, o) => s + o.total, 0),
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        avgOrderValue:
          weekOrders.length > 0
            ? Math.round(weekOrders.reduce((s, o) => s + o.total, 0) / weekOrders.length)
            : 0,
      };

      const digest = await callAI({
        model: "openai/gpt-4o",
        system: buildDailyDigestPrompt(stats),
        messages: [{ role: "user", content: "Write the daily digest." }],
        max_tokens: 300,
      });

      return { digest, generatedAt: new Date().toISOString() };
    });
  }),

  getForecast: adminProcedure.query(async () => {
    return withCache("ai:forecast", 3600, async () => {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);

      const [variants, recentOrderItems] = await Promise.all([
        db
          .select({
            id: productVariants.id,
            sku: productVariants.sku,
            name: productVariants.name,
            stock: productVariants.stock,
          })
          .from(productVariants),
        db
          .select({
            sku: orderItems.sku,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(gte(orders.createdAt, ninetyDaysAgo)),
      ]);

      const salesBySku = recentOrderItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.sku] = (acc[item.sku] ?? 0) + item.quantity;
        return acc;
      }, {});

      const stockData = variants.map((v) => ({ sku: v.sku, name: v.name, stock: v.stock }));
      const salesData = Object.entries(salesBySku).map(([sku, unitsSold]) => ({ sku, unitsSold }));

      const raw = await callAI({
        model: "openai/gpt-4o",
        system: buildForecastPrompt(stockData, salesData),
        messages: [{ role: "user", content: "Generate the forecast." }],
        max_tokens: 1000,
      });

      try {
        return JSON.parse(raw) as {
          variantSku: string;
          currentStock: number;
          suggestedReorder: number;
          urgency: string;
          reasoning: string;
        }[];
      } catch {
        return [];
      }
    });
  }),

  semanticSearch: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const { ilike, or } = await import("drizzle-orm");
      const searchTerm = `%${input.query}%`;

      const doSearch = async () =>
        db
          .select()
          .from(products)
          .where(
            or(
              ilike(products.name, searchTerm),
              ilike(products.shortDescription, searchTerm),
              ilike(products.description, searchTerm)
            )
          )
          .limit(10);

      try {
        const queryHash = createHash("md5").update(input.query).digest("hex").slice(0, 8);
        const cacheKey = `search:semantic:${queryHash}`;
        return await withCache(cacheKey, 300, doSearch);
      } catch {
        // Redis unavailable — fall back to direct DB query
        return await doSearch();
      }
    }),
});
