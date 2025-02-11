import { appRouter } from "@/server/trpc/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

export const runtime = "edge";

const handler = (request: Request) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: () => ({}),
    })
}

export { handler as GET, handler as POST}