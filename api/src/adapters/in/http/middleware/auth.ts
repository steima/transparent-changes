import { FMiddleware, AuthenticationError } from "@loupeat/fmiddleware";

export interface AuthContext {
    userId: string;
    organisationId: string;
}

export async function authMiddleware(
    middleware: FMiddleware
): Promise<AuthContext> {
    const authHeader = middleware.getHeader("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);

    // TODO: Implement actual token validation
    // For now, we'll just parse a simple JWT-like structure
    // In production, this should validate against your auth provider
    if (!token) {
        throw new AuthenticationError("Invalid token");
    }

    // Placeholder: In production, decode and validate the JWT
    return {
        userId: "placeholder-user-id",
        organisationId: "placeholder-org-id",
    };
}
