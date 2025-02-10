import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export function createTRPCContext(_opts: FetchCreateContextFnOptions) {return {}}

export type TRPCContext = ReturnType<typeof createTRPCContext>