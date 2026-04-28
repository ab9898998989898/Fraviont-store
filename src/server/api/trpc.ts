import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = await auth();
  return {
    session,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    // Session Eviction Check: Verify if the session ID in the token matches the one in the DB
    const [user] = await db
      .select({ activeSessionId: users.activeSessionId })
      .from(users)
      .where(eq(users.id, ctx.session.user.id))
      .limit(1);

    const sessionUser = ctx.session.user as { id: string; role: string; activeSessionId?: string };
    
    // Only enforce if the user has an active session ID in the DB
    // or if the session token already carries one.
    if (user?.activeSessionId) {
      if (user.activeSessionId !== sessionUser.activeSessionId) {
        throw new TRPCError({ 
          code: "UNAUTHORIZED", 
          message: "SESSION_INVALIDATED" 
        });
      }
    }
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    console.error("[TRPC] adminProcedure error:", error);
    // On unexpected DB errors, we allow the request to proceed to avoid total lockout
    // but we log it.
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
