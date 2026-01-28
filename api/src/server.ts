import express from "express";
import { config } from "./config/index.js";
import { createRouter } from "./routes.js";

const app = express();

// Middleware
app.use(express.json());

// CORS for development
app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (_req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
});

// API routes
app.use("/api", createRouter());

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error("Unhandled error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health check: http://localhost:${config.port}/api/health`);
});

export { app };
