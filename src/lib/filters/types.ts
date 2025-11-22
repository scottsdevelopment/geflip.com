import { RulesLogic } from "json-logic-js";

export interface SavedFilter {
    id: string;
    name: string;
    rule: RulesLogic;
    enabled: boolean;
    isPreset?: boolean;
    category: string;
    description?: string;
}
