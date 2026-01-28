import { Project } from "../../../domain/project.js";
import { InMemoryRepository } from "./base.js";

export class ProjectRepository extends InMemoryRepository<Project> {
    getId(item: Project): string {
        return `${item.organisation}/${item.slug}`;
    }

    async findByOrganisation(organisationSlug: string): Promise<Project[]> {
        return this.findAll({ organisation: organisationSlug } as Partial<Project>);
    }

    async findBySlug(
        organisationSlug: string,
        projectSlug: string
    ): Promise<Project | null> {
        return this.findById(`${organisationSlug}/${projectSlug}`);
    }
}

export const projectRepository = new ProjectRepository();
