// src/server/trpc/routers/document.ts
import { z } from "zod"
import { procedure, router } from "../trpc" // see step below for "procedure"
// For the example, we’ll store data in memory. In production, use a DB!
const mockDatabase: Record<string, any> = {}

export const documentRouter = router({
  getDoc: procedure
    .input(z.object({ id: z.string() })) 
    .query(({ input }) => {
      const { id } = input
      // Return existing doc or `null` if not found
      return mockDatabase[id] ?? null
    }),
  saveDoc: procedure
    .input(
      z.object({
        id: z.string(),
        data: z.any(), // shape of your data
      }),
    )
    .mutation(({ input }) => {
      const { id, data } = input
      mockDatabase[id] = data
      return { success: true }
    }),
})
