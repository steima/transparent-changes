import { FMiddleware, NotFoundError, ValidationError } from "@loupeat/fmiddleware";
import { ChangeLogState } from "../../domain/changelog.js";
import {
    changeLogRepository,
    projectRepository,
    organisationRepository,
} from "../repositories/index.js";

export async function getPublicChangelogsHandler(
    middleware: FMiddleware
): Promise<void> {
    const orgSlug = middleware.getPathParam("orgSlug");
    const projectSlug = middleware.getPathParam("projectSlug");

    if (!orgSlug || !projectSlug) {
        throw new ValidationError("Organisation and project slugs are required");
    }

    const organisation = await organisationRepository.findBySlug(orgSlug);
    if (!organisation) {
        throw new NotFoundError(`Organisation '${orgSlug}' not found`);
    }

    const project = await projectRepository.findBySlug(orgSlug, projectSlug);
    if (!project) {
        throw new NotFoundError(`Project '${projectSlug}' not found`);
    }

    const allChangelogs = await changeLogRepository.findByProject(orgSlug, projectSlug);

    // Only return published changelogs for public access
    const publishedChangelogs = allChangelogs.filter(
        (c) => c.state === ChangeLogState.Published
    );

    middleware.setResponseBody({
        organisation: {
            slug: organisation.slug,
            name: organisation.name,
        },
        project: {
            slug: project.slug,
            name: project.name,
            description: project.description,
        },
        changelogs: publishedChangelogs.map((c) => ({
            slug: c.slug,
            title: c.title,
            description: c.description,
            publishedAt: c.meta.updatedAt,
        })),
        count: publishedChangelogs.length,
    });
}

export async function getPublicChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    const orgSlug = middleware.getPathParam("orgSlug");
    const projectSlug = middleware.getPathParam("projectSlug");
    const changelogSlug = middleware.getPathParam("changelogSlug");

    if (!orgSlug || !projectSlug || !changelogSlug) {
        throw new ValidationError("Organisation, project, and changelog slugs are required");
    }

    const changelog = await changeLogRepository.findBySlug(
        orgSlug,
        projectSlug,
        changelogSlug
    );

    if (!changelog) {
        throw new NotFoundError(`Changelog '${changelogSlug}' not found`);
    }

    // Only allow access to published changelogs
    if (changelog.state !== ChangeLogState.Published) {
        throw new NotFoundError(`Changelog '${changelogSlug}' not found`);
    }

    const organisation = await organisationRepository.findBySlug(orgSlug);
    const project = await projectRepository.findBySlug(orgSlug, projectSlug);

    middleware.setResponseBody({
        organisation: organisation
            ? {
                  slug: organisation.slug,
                  name: organisation.name,
              }
            : null,
        project: project
            ? {
                  slug: project.slug,
                  name: project.name,
                  description: project.description,
              }
            : null,
        changelog: {
            slug: changelog.slug,
            title: changelog.title,
            description: changelog.description,
            publishedAt: changelog.meta.updatedAt,
        },
    });
}
