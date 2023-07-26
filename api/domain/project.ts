import {BaseItem, MultilingualTexts} from "./base";

export interface ProjectBaseSettings {
    defaultLanguages: string[];
}

export interface Project extends BaseItem {
    organisation: string;
    slug: string;
    name: MultilingualTexts;
    description: MultilingualTexts;
}