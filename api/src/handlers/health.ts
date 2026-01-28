import { FMiddleware } from "@loupeat/fmiddleware";

export async function healthHandler(middleware: FMiddleware): Promise<void> {
    middleware.setResponseBody({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
}
