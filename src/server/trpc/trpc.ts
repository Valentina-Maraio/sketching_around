// src/server/trpc/trpc.ts
import { initTRPC } from "@trpc/server"
import superjson from 'superjson'
import { TRPCContext } from "./context"

// Be sure to specify your context type here
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const procedure = t.procedure
