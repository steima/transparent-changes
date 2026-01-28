import { FMiddleware, NotFoundError, ValidationError } from "@loupeat/fmiddleware";
import { z } from "zod";
import { Organisation } from "../../../../domain/organisation.js";
import { blueprintItemMeta, updateItemMeta } from "../../../../domain/base.js";
import { organisationRepository } from "../../../out/persistence/index.js";
import { authMiddleware } from "../middleware/auth.js";

const createOrganisationSchema = z.object({
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(100),
});

const updateOrganisationSchema = z.object({
    name: z.string().min(1).max(100).optional(),
});

export async function listOrganisationsHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const organisations = await organisationRepository.findAll();

    middleware.setResponseBody({
        data: organisations,
        count: organisations.length,
    });
}

export async function getOrganisationHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const slug = middleware.getPathParam("slug");
    if (!slug) {
        throw new ValidationError("Organisation slug is required");
    }

    const organisation = await organisationRepository.findBySlug(slug);

    if (!organisation) {
        throw new NotFoundError(`Organisation '${slug}' not found`);
    }

    middleware.setResponseBody({ data: organisation });
}

export async function createOrganisationHandler(
    middleware: FMiddleware
): Promise<void> {
    const auth = await authMiddleware(middleware);

    const body = middleware.getRequestBody();
    const validated = createOrganisationSchema.parse(body);

    const existing = await organisationRepository.findBySlug(validated.slug);
    if (existing) {
        throw new ValidationError(`Organisation '${validated.slug}' already exists`);
    }

    const organisation: Organisation = {
        slug: validated.slug,
        name: validated.name,
        meta: blueprintItemMeta(auth.userId),
    };

    await organisationRepository.create(organisation);

    middleware.setStatusCode(201);
    middleware.setResponseBody({ data: organisation });
}

export async function updateOrganisationHandler(
    middleware: FMiddleware
): Promise<void> {
    const auth = await authMiddleware(middleware);

    const slug = middleware.getPathParam("slug");
    if (!slug) {
        throw new ValidationError("Organisation slug is required");
    }

    const organisation = await organisationRepository.findBySlug(slug);
    if (!organisation) {
        throw new NotFoundError(`Organisation '${slug}' not found`);
    }

    const body = middleware.getRequestBody();
    const validated = updateOrganisationSchema.parse(body);

    if (validated.name) {
        organisation.name = validated.name;
    }

    updateItemMeta(organisation, auth.userId);
    await organisationRepository.update(slug, organisation);

    middleware.setResponseBody({ data: organisation });
}

export async function deleteOrganisationHandler(
    middleware: FMiddleware
): Promise<void> {
    await authMiddleware(middleware);

    const slug = middleware.getPathParam("slug");
    if (!slug) {
        throw new ValidationError("Organisation slug is required");
    }

    const organisation = await organisationRepository.findBySlug(slug);
    if (!organisation) {
        throw new NotFoundError(`Organisation '${slug}' not found`);
    }

    await organisationRepository.delete(slug);

    middleware.setStatusCode(204);
}
