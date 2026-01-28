import { ChangeLog } from "../../domain/changelog.js";
import { InMemoryRepository } from "./base.js";

export class ChangeLogRepository extends InMemoryRepository<ChangeLog> {
    getId(item: ChangeLog): string {
        return `${item.organisation}/${item.project}/${item.slug}`;
    }

    async findByProject(
        organisationSlug: string,
        projectSlug: string
    ): Promise<ChangeLog[]> {
        return this.findAll({
            organisation: organisationSlug,
            project: projectSlug,
        } as Partial<ChangeLog>);
    }

    async findBySlug(
        organisationSlug: string,
        projectSlug: string,
        changelogSlug: string
    ): Promise<ChangeLog | null> {
        return this.findById(
            `${organisationSlug}/${projectSlug}/${changelogSlug}`
        );
    }
}

export const changeLogRepository = new ChangeLogRepository();
