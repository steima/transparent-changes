import { Organisation } from "../../../domain/organisation.js";
import { InMemoryRepository } from "./base.js";

export class OrganisationRepository extends InMemoryRepository<Organisation> {
    getId(item: Organisation): string {
        return item.slug;
    }

    async findBySlug(slug: string): Promise<Organisation | null> {
        return this.findById(slug);
    }
}

export const organisationRepository = new OrganisationRepository();
