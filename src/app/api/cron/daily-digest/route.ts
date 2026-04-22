import { NextRequest, NextResponse } from "next/server";
import { gte } from "drizzle-orm";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { callAI } from "@/lib/ai/client";
import { buildDailyDigestPrompt } from "@/lib/ai/prompts";
import { redis } from "@/lib/redis/client";

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handler(req: NextRequest) {
  try {
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

    const result = { digest, generatedAt: new Date().toISOString() };
    await redis.setex("ai:digest", 60 * 60 * 23, result);

    return NextResponse.json({ success: true, generatedAt: result.generatedAt });
  } catch (error) {
    console.error("Daily digest cron error:", error);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
