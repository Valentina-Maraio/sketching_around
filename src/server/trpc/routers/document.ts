import { z } from "zod"
import { procedure, router } from "../trpc"

// In-memory mock database (for demo purposes)
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
        data: z.any(), // shape of your data – refine as needed
      }),
    )
    .mutation(({ input }) => {
      const { id, data } = input
      mockDatabase[id] = data
      return { success: true }
    }),
})
