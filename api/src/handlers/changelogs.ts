import { FMiddleware, NotFoundError, ValidationError } from "@loupeat/fmiddleware";
import { z } from "zod";
import { ChangeLog, ChangeLogState } from "../../domain/changelog.js";
import { blueprintItemMeta, updateItemMeta, MultilingualTexts } from "../../domain/base.js";
import {
    changeLogRepository,
    projectRepository,
    organisationRepository,
} from "../repositories/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { changelogGeneratorService, githubService } from "../services/index.js";

const multilingualTextSchema = z.record(
    z.object({
        language: z.string(),
        text: z.string(),
        machineTranslated: z.boolean(),
    })
);

const createChangelogSchema = z.object({
    slug: z.string().min(1).max(50),
    title: multilingualTextSchema,
    description: multilingualTextSchema,
    state: z.nativeEnum(ChangeLogState).optional().default(ChangeLogState.Draft),
});

const updateChangelogSchema = z.object({
    title: multilingualTextSchema.optional(),
    description: multilingualTextSchema.optional(),
    state: z.nativeEnum(ChangeLogState).optional(),
});

const generateChangelogSchema = z.object({
    githubOwner: z.string().min(1),
    githubRepo: z.string().min(1),
    fromRef: z.string().min(1),
    toRef: z.string().min(1),
    githubToken: z.string().optional(),
});

export async function listChangelogsHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const orgSlug = middleware.getPathParam("orgSlug");
    const projectSlug = middleware.getPathParam("projectSlug");

    if (!orgSlug || !projectSlug) {
        throw new ValidationError("Organisation and project slugs are required");
    }

    const project = await projectRepository.findBySlug(orgSlug, projectSlug);
    if (!project) {
        throw new NotFoundError(`Project '${projectSlug}' not found`);
    }

    const changelogs = await changeLogRepository.findByProject(orgSlug, projectSlug);

    middleware.setResponseBody({
        data: changelogs,
        count: changelogs.length,
    });
}

export async function getChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

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

    middleware.setResponseBody({ data: changelog });
}

export async function createChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    const auth = await authMiddleware(middleware);

    const orgSlug = middleware.getPathParam("orgSlug");
    const projectSlug = middleware.getPathParam("projectSlug");

    if (!orgSlug || !projectSlug) {
        throw new ValidationError("Organisation and project slugs are required");
    }

    const project = await projectRepository.findBySlug(orgSlug, projectSlug);
    if (!project) {
        throw new NotFoundError(`Project '${projectSlug}' not found`);
    }

    const body = middleware.getRequestBody();
    const validated = createChangelogSchema.parse(body);

    const existing = await changeLogRepository.findBySlug(
        orgSlug,
        projectSlug,
        validated.slug
    );
    if (existing) {
        throw new ValidationError(`Changelog '${validated.slug}' already exists`);
    }

    const changelog: ChangeLog = {
        organisation: orgSlug,
        project: projectSlug,
        slug: validated.slug,
        title: validated.title as MultilingualTexts,
        description: validated.description as MultilingualTexts,
        state: validated.state,
        meta: blueprintItemMeta(auth.userId),
    };

    await changeLogRepository.create(changelog);

    middleware.setStatusCode(201);
    middleware.setResponseBody({ data: changelog });
}

export async function updateChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    const auth = await authMiddleware(middleware);

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

    const body = middleware.getRequestBody();
    const validated = updateChangelogSchema.parse(body);

    if (validated.title) {
        changelog.title = validated.title as MultilingualTexts;
    }
    if (validated.description) {
        changelog.description = validated.description as MultilingualTexts;
    }
    if (validated.state) {
        changelog.state = validated.state;
    }

    updateItemMeta(changelog, auth.userId);
    await changeLogRepository.update(
        `${orgSlug}/${projectSlug}/${changelogSlug}`,
        changelog
    );

    middleware.setResponseBody({ data: changelog });
}

export async function deleteChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

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

    await changeLogRepository.delete(`${orgSlug}/${projectSlug}/${changelogSlug}`);

    middleware.setStatusCode(204);
}

export async function generateChangelogHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const body = middleware.getRequestBody();
    const validated = generateChangelogSchema.parse(body);

    if (validated.githubToken) {
        githubService.setAccessToken(validated.githubToken);
    }

    const diff = await githubService.getCompare(
        { owner: validated.githubOwner, repo: validated.githubRepo },
        validated.fromRef,
        validated.toRef
    );

    const generated = await changelogGeneratorService.generateChangelog(diff);

    middleware.setResponseBody({
        data: {
            generated,
            diff: {
                fromRef: diff.fromRef,
                toRef: diff.toRef,
                commitCount: diff.commits.length,
                fileCount: diff.files.length,
            },
        },
    });
}
