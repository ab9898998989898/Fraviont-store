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

  // Session Eviction Check: Verify if the session ID in the token matches the one in the DB
  const [user] = await db
    .select({ activeSessionId: users.activeSessionId })
    .from(users)
    .where(eq(users.id, ctx.session.user.id))
    .limit(1);

  // If the IDs don't match, it means another login happened
  if (!user || user.activeSessionId !== (ctx.session.user as any).activeSessionId) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "SESSION_INVALIDATED" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
