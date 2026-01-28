import { z } from "zod";

const configSchema = z.object({
    port: z.coerce.number().default(3000),
    nodeEnv: z.enum(["development", "production", "test"]).default("development"),
    anthropicApiKey: z.string().optional(),
    github: z.object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
    }),
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
    return configSchema.parse({
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
    });
}

export const config = loadConfig();
