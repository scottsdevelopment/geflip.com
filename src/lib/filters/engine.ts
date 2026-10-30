import { Parser } from "expr-eval";
import { ProcessedItem } from "../types";
import { SavedFilter, FilterResult } from "./types";
import { CustomColumn } from "../columns/types";
import { evaluateColumn } from "../columns/engine";
import { geTax } from "../geTax";

const parser = new Parser();
parser.functions.tax = (price: number) => geTax(Number(price));
const expressionCache = new Map<string, any>();

// Helper to safely evaluate filter expression
function evaluateExpression(
    code: string | undefined,
    context: any
): boolean {
    if (!code) return false;
    try {
        let expr = expressionCache.get(code);
        if (!expr) {
            expr = parser.parse(code);
            expressionCache.set(code, expr);
        }
        return !!expr.evaluate(context);
    } catch (error) {
        console.warn(`Error evaluating filter expression "${code}":`, error);
        return false;
    }
}

export function evaluateFilter(
    item: ProcessedItem,
    filter: SavedFilter,
    customColumns: CustomColumn[] = [],
    allItems: ProcessedItem[] = []
): FilterResult {
    if (!filter.enabled) return { match: false };

    // Prepare context
    // Create a proxy for lazy evaluation of columns
    const columnsProxy = new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === "string") {
                const col = customColumns.find(c => c.id === prop);
                if (col) {
                    return evaluateColumn(col, { item }, customColumns);
                }
            }
            return undefined;
        }
    });

    // Define getItem function with optional property parameter
    const getItemFunc = (idOrName: number | string, property?: string) => {
        let foundItem: ProcessedItem | undefined;

        if (typeof idOrName === 'number') {
            foundItem = allItems.find(i => i.id === idOrName);
        } else {
            foundItem = allItems.find(i => i.name === idOrName);
        }

        // If property is specified, return that property value
        if (foundItem && property) {
            return (foundItem as any)[property];
        }

        return foundItem;
    };

    const context = {
        item,
        columns: columnsProxy,
        getItem: getItemFunc
    };

    // Handle legacy filters or missing expressions
    const rawExpressions = filter.expressions || [];
    // Filter out empty expressions
    const expressions = rawExpressions.filter(e => e.code && e.code.trim() !== "");

    // If no expressions (or only empty ones), match everything
    if (expressions.length === 0) return { match: true };

    // Iterate through expressions (OR logic within a single filter)
    for (const expr of expressions) {
        const isMatch = evaluateExpression(expr.code, context);
        if (isMatch) {
            let highlightItem: ProcessedItem | undefined;

            // Evaluate highlight item if present
            if (expr.highlightItem) {
                try {
                    // Try to evaluate as an expression first
                    const result = parser.evaluate(expr.highlightItem, context as any);

                    // If result is an object (item), use it
                    if (typeof result === 'object' && result !== null && 'id' in (result as any)) {
                        highlightItem = result as ProcessedItem;
                    }
                    // If result is a string (item name), look it up
                    else if (typeof result === 'string') {
                        highlightItem = allItems.find(i => i.name === result);
                    }
                    // If result is a number (item ID), look it up
                    else if (typeof result === 'number') {
                        highlightItem = allItems.find(i => i.id === result);
                    }
                } catch (e) {
                    // If expression evaluation fails, treat it as a literal string name
                    const trimmed = expr.highlightItem.trim();
                    // Remove quotes if present
                    const nameOrId = trimmed.replace(/^['"]|['"]$/g, '');

                    // Try as number first
                    const asNumber = Number(nameOrId);
                    if (!isNaN(asNumber)) {
                        highlightItem = allItems.find(i => i.id === asNumber);
                    } else {
                        // Try as name
                        highlightItem = allItems.find(i => i.name === nameOrId);
                    }
                }
            }

            return {
                match: true,
                action: expr.action,
                highlightItem
            };
        }
    }

    return { match: false };
}

export function evaluateFilters(
    item: ProcessedItem,
    filters: SavedFilter[],
    customColumns: CustomColumn[] = [],
    allItems: ProcessedItem[] = []
): FilterResult[] {
    const results: FilterResult[] = [];
    const activeFilters = filters.filter(f => f.enabled);

    if (activeFilters.length === 0) return [{ match: true }];

    const regularFilters = activeFilters.filter(f => !f.independent);
    const independentFilters = activeFilters.filter(f => f.independent);

    // Check Regular Filters (AND logic)
    let regularMatch = true;
    let regularAction: string | undefined;
    let regularHighlight: ProcessedItem | undefined;

    if (regularFilters.length > 0) {
        for (const filter of regularFilters) {
            const result = evaluateFilter(item, filter, customColumns, allItems);
            if (!result.match) {
                regularMatch = false;
                break;
            }
            // Use the last matching action/highlight for now
            if (result.action) regularAction = result.action;
            if (result.highlightItem) regularHighlight = result.highlightItem;
        }
    } else {
        // If NO filters enabled, show all.
        // If ONLY independent filters are enabled, we probably only show items matching them.
        if (independentFilters.length > 0) {
            regularMatch = false; // Don't show "everything" if we have specific independent filters
        } else {
            regularMatch = true; // Show everything if no filters at all
        }
    }

    if (regularMatch) {
        results.push({
            match: true,
            action: regularAction,
            highlightItem: regularHighlight
        });
    }

    // Check Independent Filters (OR logic - each is a separate reason to include)
    for (const filter of independentFilters) {
        const result = evaluateFilter(item, filter, customColumns, allItems);
        if (result.match) {
            results.push(result);
        }
    }

    return results;
}

export function validateExpressionString(code: string): boolean {
    try {
        parser.parse(code);
        return true;
    } catch (e) {
        return false;
    }
}
