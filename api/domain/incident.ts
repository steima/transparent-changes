import {BaseItem, MultilingualTexts} from "./base";

export enum IncidentState {
    New = "Reported",
    Resolving = "Resolving",
    Resolved = "Resolved",
}

export enum Criticality {
    Severe = "Severe",
    Significant = "Significant",
    Moderate = "Moderate",
    Minor = "Minor",
}

export interface Incident extends BaseItem {
    organisation: string;
    project: string;
    incidentId: string;
    title: MultilingualTexts;
    state: IncidentState;
    criticality: Criticality;
}

export interface IncidentComment {
    incidentId: string;
    commentId: string;
    state: IncidentState;
    criticality: Criticality;
    comment: MultilingualTexts;
}