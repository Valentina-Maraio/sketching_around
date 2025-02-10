// src/server/trpc/root.ts
import { router } from "./trpc"
import { documentRouter } from "./routers/document"

export const appRouter = router({
  document: documentRouter,
})

// Export type signature of your API
export type AppRouter = typeof appRouter
