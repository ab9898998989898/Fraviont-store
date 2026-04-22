import "server-only";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { cache } from "react";
import { headers } from "next/headers";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  return createTRPCContext({
    req: new Request("http://internal", { headers: heads }),
  } as { req: import("next/server").NextRequest });
});

export const api = createCaller(createContext);
