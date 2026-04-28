"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { type AppRouter } from "@/server/api/root";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export const api = createTRPCReact<AppRouter>();

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error: any) => {
        if (error?.message === "SESSION_INVALIDATED") {
          toast.error("Session invalidated by another login");
          void signOut({ callbackUrl: "/admin/login" });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        if (error?.message === "SESSION_INVALIDATED") {
          toast.error("Session invalidated by another login");
          void signOut({ callbackUrl: "/admin/login" });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error: any) => {
          if (error?.message === "SESSION_INVALIDATED") return false;
          return failureCount < 3;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
