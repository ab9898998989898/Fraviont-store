import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { type AppRouter } from "@/server/api/root";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
    }),
  ],
});
