import {BaseItem, MultilingualTexts} from "./base";

export enum ChangeLogState {
    Draft = "Draft",
    Published = "Published",
    Archived = "Archived"
}

export interface ChangeLog extends BaseItem {
    organisation: string;
    project: string;
    slug: string;
    title: MultilingualTexts;
    state: ChangeLogState;
    description: MultilingualTexts;
}