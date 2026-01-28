import { FMiddleware, NotFoundError, ValidationError } from "@loupeat/fmiddleware";
import { z } from "zod";
import { Project } from "../../domain/project.js";
import { blueprintItemMeta, updateItemMeta, MultilingualTexts } from "../../domain/base.js";
import { projectRepository, organisationRepository } from "../repositories/index.js";
import { authMiddleware } from "../middleware/auth.js";

const multilingualTextSchema = z.record(
    z.object({
        language: z.string(),
        text: z.string(),
        machineTranslated: z.boolean(),
    })
);

const createProjectSchema = z.object({
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    name: multilingualTextSchema,
    description: multilingualTextSchema,
});

const updateProjectSchema = z.object({
    name: multilingualTextSchema.optional(),
    description: multilingualTextSchema.optional(),
});

export async function listProjectsHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const orgSlug = middleware.getPathParam("orgSlug");
    if (!orgSlug) {
        throw new ValidationError("Organisation slug is required");
    }

    const organisation = await organisationRepository.findBySlug(orgSlug);
    if (!organisation) {
        throw new NotFoundError(`Organisation '${orgSlug}' not found`);
    }

    const projects = await projectRepository.findByOrganisation(orgSlug);

    middleware.setResponseBody({
        data: projects,
        count: projects.length,
    });
}

export async function getProjectHandler(
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

    middleware.setResponseBody({ data: project });
}

export async function createProjectHandler(
    middleware: FMiddleware
): Promise<void> {
    const auth = await authMiddleware(middleware);

    const orgSlug = middleware.getPathParam("orgSlug");
    if (!orgSlug) {
        throw new ValidationError("Organisation slug is required");
    }

    const organisation = await organisationRepository.findBySlug(orgSlug);
    if (!organisation) {
        throw new NotFoundError(`Organisation '${orgSlug}' not found`);
    }

    const body = middleware.getRequestBody();
    const validated = createProjectSchema.parse(body);

    const existing = await projectRepository.findBySlug(orgSlug, validated.slug);
    if (existing) {
        throw new ValidationError(`Project '${validated.slug}' already exists`);
    }

    const project: Project = {
        organisation: orgSlug,
        slug: validated.slug,
        name: validated.name as MultilingualTexts,
        description: validated.description as MultilingualTexts,
        meta: blueprintItemMeta(auth.userId),
    };

    await projectRepository.create(project);

    middleware.setStatusCode(201);
    middleware.setResponseBody({ data: project });
}

export async function updateProjectHandler(
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
    const validated = updateProjectSchema.parse(body);

    if (validated.name) {
        project.name = validated.name as MultilingualTexts;
    }
    if (validated.description) {
        project.description = validated.description as MultilingualTexts;
    }

    updateItemMeta(project, auth.userId);
    await projectRepository.update(`${orgSlug}/${projectSlug}`, project);

    middleware.setResponseBody({ data: project });
}

export async function deleteProjectHandler(
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

    await projectRepository.delete(`${orgSlug}/${projectSlug}`);

    middleware.setStatusCode(204);
}
