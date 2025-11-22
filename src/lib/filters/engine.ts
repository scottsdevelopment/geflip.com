import jsonLogic, { RulesLogic } from "json-logic-js";
import { ProcessedItem } from "../types";
import { SavedFilter } from "./types";
import { CustomColumn } from "../columns/types";
import { evaluateColumn } from "../columns/engine";

export function evaluateFilter(item: ProcessedItem, rule: RulesLogic, customColumns: CustomColumn[] = []): boolean {
    try {
        const columnValues: Record<string, any> = {};

        if (customColumns.length > 0) {
            customColumns.forEach(col => {
                columnValues[col.id] = evaluateColumn(col, { item }, customColumns);
            });
        }

        return !!jsonLogic.apply(rule, { item, columns: columnValues });
    } catch (error) {
        console.warn("Error evaluating filter rule:", error);
        return false;
    }
}

export function evaluateFilters(item: ProcessedItem, filters: SavedFilter[], customColumns: CustomColumn[] = []): boolean {
    const enabledFilters = filters.filter(f => f.enabled);
    if (enabledFilters.length === 0) return true;

    return enabledFilters.every(filter => evaluateFilter(item, filter.rule, customColumns));
}

export function validateRule(rule: RulesLogic): boolean {
    return typeof rule === "object" && rule !== null;
}
