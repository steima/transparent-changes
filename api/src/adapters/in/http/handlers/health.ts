import { FMiddleware } from "@loupeat/fmiddleware";

export async function healthHandler(middleware: FMiddleware): Promise<void> {
    middleware.setResponseBody({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
}
