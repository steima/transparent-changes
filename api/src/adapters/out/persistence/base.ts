import { BaseItem } from "../../../domain/base.js";

export interface Repository<T extends BaseItem> {
    findById(id: string): Promise<T | null>;
    findAll(filter?: Partial<T>): Promise<T[]>;
    create(item: T): Promise<T>;
    update(id: string, item: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export abstract class InMemoryRepository<T extends BaseItem>
    implements Repository<T>
{
    protected items: Map<string, T> = new Map();

    abstract getId(item: T): string;

    async findById(id: string): Promise<T | null> {
        return this.items.get(id) ?? null;
    }

    async findAll(filter?: Partial<T>): Promise<T[]> {
        const allItems = Array.from(this.items.values());

        if (!filter) {
            return allItems;
        }

        return allItems.filter((item) => {
            for (const [key, value] of Object.entries(filter)) {
                if (item[key as keyof T] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    async create(item: T): Promise<T> {
        const id = this.getId(item);
        this.items.set(id, item);
        return item;
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        const existing = this.items.get(id);
        if (!existing) {
            throw new Error(`Item with id ${id} not found`);
        }

        const updated = { ...existing, ...updates };
        this.items.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<void> {
        this.items.delete(id);
    }
}
