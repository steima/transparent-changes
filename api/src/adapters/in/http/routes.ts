import { FExpressMiddleware } from "@loupeat/fmiddleware";
import { Router } from "express";
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
} from "./handlers/index.js";

export function createRouter(): Router {
    const router = Router();
    const expressMiddleware = new FExpressMiddleware();

    // Health check
    router.get("/health", expressMiddleware.wrap(healthHandler));

    // Public API (no authentication required)
    router.get(
        "/public/:orgSlug/:projectSlug",
        expressMiddleware.wrap(getPublicChangelogsHandler)
    );
    router.get(
        "/public/:orgSlug/:projectSlug/:changelogSlug",
        expressMiddleware.wrap(getPublicChangelogHandler)
    );

    // Organisations
    router.get("/organisations", expressMiddleware.wrap(listOrganisationsHandler));
    router.get("/organisations/:slug", expressMiddleware.wrap(getOrganisationHandler));
    router.post("/organisations", expressMiddleware.wrap(createOrganisationHandler));
    router.put("/organisations/:slug", expressMiddleware.wrap(updateOrganisationHandler));
    router.delete("/organisations/:slug", expressMiddleware.wrap(deleteOrganisationHandler));

    // Projects
    router.get(
        "/organisations/:orgSlug/projects",
        expressMiddleware.wrap(listProjectsHandler)
    );
    router.get(
        "/organisations/:orgSlug/projects/:projectSlug",
        expressMiddleware.wrap(getProjectHandler)
    );
    router.post(
        "/organisations/:orgSlug/projects",
        expressMiddleware.wrap(createProjectHandler)
    );
    router.put(
        "/organisations/:orgSlug/projects/:projectSlug",
        expressMiddleware.wrap(updateProjectHandler)
    );
    router.delete(
        "/organisations/:orgSlug/projects/:projectSlug",
        expressMiddleware.wrap(deleteProjectHandler)
    );

    // Changelogs
    router.get(
        "/organisations/:orgSlug/projects/:projectSlug/changelogs",
        expressMiddleware.wrap(listChangelogsHandler)
    );
    router.get(
        "/organisations/:orgSlug/projects/:projectSlug/changelogs/:changelogSlug",
        expressMiddleware.wrap(getChangelogHandler)
    );
    router.post(
        "/organisations/:orgSlug/projects/:projectSlug/changelogs",
        expressMiddleware.wrap(createChangelogHandler)
    );
    router.put(
        "/organisations/:orgSlug/projects/:projectSlug/changelogs/:changelogSlug",
        expressMiddleware.wrap(updateChangelogHandler)
    );
    router.delete(
        "/organisations/:orgSlug/projects/:projectSlug/changelogs/:changelogSlug",
        expressMiddleware.wrap(deleteChangelogHandler)
    );

    // AI Changelog Generation
    router.post("/generate-changelog", expressMiddleware.wrap(generateChangelogHandler));

    return router;
}
