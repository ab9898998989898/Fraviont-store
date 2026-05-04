import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { newsletterSubscribers } from "@/server/db/schema";

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // 1. Persist email (ignore duplicate gracefully)
      try {
        await db.insert(newsletterSubscribers).values({ email: input.email });
      } catch (err: unknown) {
        // Postgres unique violation code = 23505
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: string }).code === "23505"
        ) {
          // Already subscribed — return success silently
          return { success: true, alreadySubscribed: true };
        }
        
        // Prevent leaking DB internals to the client
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process subscription.",
        });
      }

      // 2. Send welcome email via Resend (best-effort)
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (RESEND_API_KEY) {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Fraviont <hello@fraviont.com>",
              to: [input.email],
              subject: "Welcome to The Inner Circle",
              html: `
                <div style="background:#0a0a0a;color:#f5f0e8;font-family:Georgia,serif;padding:48px 32px;max-width:560px;margin:0 auto;">
                  <p style="color:#b8954a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">Fraviont — The Inner Circle</p>
                  <h1 style="font-size:28px;font-weight:300;color:#f5f0e8;margin:0 0 24px;line-height:1.3;">
                    You are in.
                  </h1>
                  <p style="font-size:15px;color:#c8b99a;line-height:1.7;margin:0 0 16px;">
                    Welcome to The Inner Circle — Fraviont's exclusive space for those who appreciate the quiet luxury of a perfectly chosen scent.
                  </p>
                  <p style="font-size:15px;color:#c8b99a;line-height:1.7;margin:0 0 32px;">
                    Expect early access to new collections, curated editorial stories, and exclusive offers delivered only to this circle.
                  </p>
                  <a href="https://fraviont.com/shop" style="display:inline-block;background:#b8954a;color:#0a0a0a;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 32px;text-decoration:none;font-family:sans-serif;font-weight:500;">
                    Explore the Collection
                  </a>
                  <p style="font-size:11px;color:#666;margin:48px 0 0;line-height:1.6;">
                    You received this because you subscribed at fraviont.com. If this was a mistake, simply disregard this message.
                  </p>
                </div>
              `,
            }),
          });

          // Fetch doesn't throw on 400/500 level errors, so we handle it manually
          if (!res.ok) {
            const errorText = await res.text();
            console.error("[Newsletter] Resend API rejected payload:", errorText);
          }
        }
      } catch (emailErr) {
        // This only catches network-level failures (e.g. DNS issues)
        console.error("[Newsletter] Network error sending welcome email:", emailErr);
      }

      return { success: true, alreadySubscribed: false };
    }),
});