import { initTRPC } from "@trpc/server";
//import type { Context } from "./context";

// Initialize tRPC with your context.
//const t = initTRPC.context<Context>().create();
const t = initTRPC.context().create();

// Export a helper that creates a router from an object.
//export const createRouter = <T extends Record<string, any>>(routers: T) => {
//  return t.router(routers);
//};

// Export the procedure helper to define queries/mutations.
export const createRouter = t.router;
export const procedure = t.procedure;