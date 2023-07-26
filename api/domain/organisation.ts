import {BaseItem} from "./base";


export interface OrganisationBaseSettings {
    defaultLanguages: string[];
}

export interface Organisation extends BaseItem {
    slug: string;
    name: string;
}