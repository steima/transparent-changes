import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { FAWSLambdaMiddleware } from "@loupeat/fmiddleware";
import {
    healthHandler,
    listOrganisationsHandler,
    getOrganisationHandler,
    createOrganisationHandler,
    updateOrganisationHandler,
    deleteOrganisationHandler,
    listProjectsHandler,
    getProjectHandler,
    createProjectHandler,
    updateProjectHandler,
    deleteProjectHandler,
    listChangelogsHandler,
    getChangelogHandler,
    createChangelogHandler,
    updateChangelogHandler,
    deleteChangelogHandler,
    generateChangelogHandler,
    getPublicChangelogsHandler,
    getPublicChangelogHandler,
} from "./adapters/in/http/handlers/index.js";

const lambdaMiddleware = new FAWSLambdaMiddleware();

// Health
export const health = lambdaMiddleware.wrap(healthHandler);

// Public endpoints
export const publicChangelogs = lambdaMiddleware.wrap(getPublicChangelogsHandler);
export const publicChangelog = lambdaMiddleware.wrap(getPublicChangelogHandler);

// Organisations
export const listOrganisations = lambdaMiddleware.wrap(listOrganisationsHandler);
export const getOrganisation = lambdaMiddleware.wrap(getOrganisationHandler);
export const createOrganisation = lambdaMiddleware.wrap(createOrganisationHandler);
export const updateOrganisation = lambdaMiddleware.wrap(updateOrganisationHandler);
export const deleteOrganisation = lambdaMiddleware.wrap(deleteOrganisationHandler);

// Projects
export const listProjects = lambdaMiddleware.wrap(listProjectsHandler);
export const getProject = lambdaMiddleware.wrap(getProjectHandler);
export const createProject = lambdaMiddleware.wrap(createProjectHandler);
export const updateProject = lambdaMiddleware.wrap(updateProjectHandler);
export const deleteProject = lambdaMiddleware.wrap(deleteProjectHandler);

// Changelogs
export const listChangelogs = lambdaMiddleware.wrap(listChangelogsHandler);
export const getChangelog = lambdaMiddleware.wrap(getChangelogHandler);
export const createChangelog = lambdaMiddleware.wrap(createChangelogHandler);
export const updateChangelog = lambdaMiddleware.wrap(updateChangelogHandler);
export const deleteChangelog = lambdaMiddleware.wrap(deleteChangelogHandler);

// AI Generation
export const generateChangelog = lambdaMiddleware.wrap(generateChangelogHandler);

// Single handler for API Gateway with path-based routing (alternative approach)
export async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    const path = event.path;
    const method = event.httpMethod;

    // Route to appropriate handler based on path and method
    const routes: Record<string, Record<string, typeof health>> = {
        "/api/health": { GET: health },
        "/api/organisations": {
            GET: listOrganisations,
            POST: createOrganisation,
        },
        "/api/generate-changelog": { POST: generateChangelog },
    };

    // Check for exact match first
    const exactRoute = routes[path];
    if (exactRoute?.[method]) {
        return exactRoute[method](event, context);
    }

    // Pattern matching for parameterized routes
    if (path.match(/^\/api\/public\/[^/]+\/[^/]+$/)) {
        return publicChangelogs(event, context);
    }
    if (path.match(/^\/api\/public\/[^/]+\/[^/]+\/[^/]+$/)) {
        return publicChangelog(event, context);
    }
    if (path.match(/^\/api\/organisations\/[^/]+$/) && !path.includes("/projects")) {
        if (method === "GET") return getOrganisation(event, context);
        if (method === "PUT") return updateOrganisation(event, context);
        if (method === "DELETE") return deleteOrganisation(event, context);
    }
    if (path.match(/^\/api\/organisations\/[^/]+\/projects$/)) {
        if (method === "GET") return listProjects(event, context);
        if (method === "POST") return createProject(event, context);
    }
    if (path.match(/^\/api\/organisations\/[^/]+\/projects\/[^/]+$/) && !path.includes("/changelogs")) {
        if (method === "GET") return getProject(event, context);
        if (method === "PUT") return updateProject(event, context);
        if (method === "DELETE") return deleteProject(event, context);
    }
    if (path.match(/^\/api\/organisations\/[^/]+\/projects\/[^/]+\/changelogs$/)) {
        if (method === "GET") return listChangelogs(event, context);
        if (method === "POST") return createChangelog(event, context);
    }
    if (path.match(/^\/api\/organisations\/[^/]+\/projects\/[^/]+\/changelogs\/[^/]+$/)) {
        if (method === "GET") return getChangelog(event, context);
        if (method === "PUT") return updateChangelog(event, context);
        if (method === "DELETE") return deleteChangelog(event, context);
    }

    return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Not found" }),
    };
}
