export interface ItemMeta {
    version: number;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
}

export interface BaseItem {
    meta: ItemMeta;
}

export function blueprintItemMeta(username: string): ItemMeta {
    const now = new Date().toISOString();
    return {
        version: 1,
        createdAt: now,
        createdBy: username,
        updatedAt: now,
        updatedBy: username
    };
}

export function updateItemMeta(item: BaseItem, username: string): BaseItem {
    const now = new Date().toISOString();
    item.meta.version ++;
    item.meta.updatedAt = now;
    item.meta.updatedBy = username;
    return item;
}

export interface MultilingualText {
    language: string;
    text: string;
    machineTranslated: boolean;
}

export interface MultilingualTexts {
    [key: string]: MultilingualText;
}