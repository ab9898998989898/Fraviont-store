import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/server/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) return null;
        if (user.role !== "ADMIN") return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: (token.role as string) ?? "USER",
      },
    }),
  },
  events: {
    createUser: async ({ user }) => {
      // Send welcome email when a new customer signs up
      if (user.email && user.role !== "ADMIN") {
        try {
          const { sendEmail } = await import("@/lib/email/send");
          const { WelcomeEmail } = await import("@/lib/email/templates/WelcomeEmail");
          const { createElement } = await import("react");
          await sendEmail({
            to: user.email,
            subject: "Welcome to Fraviont — The Art of Presence",
            react: createElement(WelcomeEmail, { customerName: user.name ?? "there" }),
          });
        } catch (error) {
          console.error("[Auth] Failed to send welcome email:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
  },
});

