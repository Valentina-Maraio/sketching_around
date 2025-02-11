import { createRouter, procedure } from "./createRouter";
import { z } from "zod";

const documentSchema = z.any(); // Be as specific as possible for type safety

let tempDocumentStore: any = null; // In-memory store (replace with a database)

export const storeRouter = createRouter({
  getStore: procedure.query(() => {
    return { document: tempDocumentStore };
  }),
  updateStore: procedure
    .input(z.object({ storeData: documentSchema }))
    .mutation(({ input }) => {
      console.log("Received store update:", input.storeData);
      tempDocumentStore = input.storeData;
      return { success: true };
    }),
});

// Combine routers into the main app router.
export const appRouter = createRouter({
  store: storeRouter,
});

export type AppRouter = typeof appRouter;
