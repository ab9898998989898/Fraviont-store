import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { inventoryRouter } from "./routers/inventory";
import { analyticsRouter } from "./routers/analytics";
import { customersRouter } from "./routers/customers";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  products:  productsRouter,
  orders:    ordersRouter,
  inventory: inventoryRouter,
  analytics: analyticsRouter,
  customers: customersRouter,
  ai:        aiRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
