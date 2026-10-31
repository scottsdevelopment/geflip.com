import { Parser } from "expr-eval-fork";
import { CustomColumn, ColumnContext } from "./types";
import { TimeseriesCache } from "../timeseries/cache";
import { geTax } from "../geTax";
import { registerScopedFunctions, withScope } from "../expressionScope";

const parser = new Parser();
registerScopedFunctions(parser);
// Cache parsed expressions to avoid re-parsing for every item.
// Expressions that fail to parse are cached as PARSE_FAILED so a bad column
// doesn't re-parse (and log) once per cell on every render.
const PARSE_FAILED = Symbol("parse-failed");
const expressionCache = new Map<string, any>();
// Only warn once per broken expression instead of once per row per render
const warnedExpressions = new Set<string>();

function warnOnce(key: string, ...args: unknown[]) {
    if (warnedExpressions.has(key)) return;
    warnedExpressions.add(key);
    console.warn(...args);
}

// GE tax for a given sale price: tax(price)
parser.functions.tax = (price: number) => geTax(Number(price));

// Array utility functions for building custom indicators
parser.functions.slice = (arr: any[], start: number, end?: number) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(start, end);
};

parser.functions.sum = (arr: any[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((a, b) => a + (Number(b) || 0), 0);
};

parser.functions.avg = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const values = arr.filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return parser.functions.sum(values) / values.length;
};

parser.functions.length = (arr: any[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.length;
};

parser.functions.field = (arr: any[], fieldName: string) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => item?.[fieldName]).filter(v => v !== null && v !== undefined);
};

// Helper to safely evaluate with async timeseries support
export function evaluateColumn(
    column: CustomColumn,
    context: ColumnContext,
    allColumns: CustomColumn[] = [],
    cache?: TimeseriesCache,
    onUpdate?: () => void,
    depth = 0,
    allItems: any[] = [] // Added allItems for cross-referencing
): any {
    if (depth > 10) {
        warnOnce(`circular:${column.id}`, `Circular dependency detected for column ${column.name}`);
        return null;
    }

    try {
        let expr = expressionCache.get(column.expression);
        if (expr === PARSE_FAILED) return null;
        if (!expr) {
            try {
                expr = parser.parse(column.expression);
            } catch (parseError) {
                expressionCache.set(column.expression, PARSE_FAILED);
                warnOnce(`parse:${column.expression}`, `Invalid expression for column ${column.name}:`, parseError);
                return null;
            }
            expressionCache.set(column.expression, expr);
        }

        // Create a proxy for 'columns' to lazily evaluate dependencies
        const columnsProxy = new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    const depCol = allColumns.find(c => c.id === prop);
                    if (depCol) {
                        return evaluateColumn(depCol, context, allColumns, cache, onUpdate, depth + 1, allItems);
                    }
                }
                return undefined;
            }
        });

        // Register timeseries function - SYNC ONLY (checks memory cache)
        const timeseriesFunc = (itemId: number, interval: string) => {
            if (!cache) return null;
            return cache.getSync(itemId, interval);
        };

        // Helper for cross-item lookup
        // getItem(idOrName) returns the item; getItem(idOrName, "low") returns one of its fields
        const getItemFunc = (idOrName: number | string, property?: string) => {
            const found = typeof idOrName === 'number'
                ? allItems.find(i => i.id === idOrName)
                : allItems.find(i => i.name === idOrName);
            if (found && property) return found[property];
            return found;
        };

        // Extend context with columns proxy; getItem/timeseries are scoped parser functions
        const evalContext = {
            ...context,
            columns: columnsProxy,
            now: Math.floor(Date.now() / 1000)
        };

        const result = withScope(
            { getItem: getItemFunc, timeseries: timeseriesFunc },
            () => expr.evaluate(evalContext)
        );
        // NaN / Infinity (e.g. division by zero) are treated as "no value"
        if (typeof result === "number" && !Number.isFinite(result)) return null;
        return result;
    } catch (error) {
        warnOnce(`eval:${column.id}:${column.expression}`, `Error evaluating column ${column.name}:`, error);
        return null;
    }
}

export function validateExpression(expression: string): boolean {
    return getExpressionError(expression) === null;
}

/** Returns a human readable parse error for an expression, or null if it parses. */
export function getExpressionError(expression: string): string | null {
    try {
        parser.parse(expression);
        return null;
    } catch (e) {
        if (!(e instanceof Error)) return "Invalid expression";
        // Turn parser token names into something readable, e.g.
        // "unexpected TEOF: EOF" -> "the formula ends too early"
        return e.message
            .replace(/unexpected TEOF: EOF/, "the formula ends too early (missing a value or closing bracket?)")
            .replace(/Expected EOF$/, "unexpected extra text (check your brackets)")
            .replace(/\bT(OP|NAME|NUMBER|STRING|PAREN|COMMA|BRACKET|SEMICOLON): /g, "")
            .replace(/^parse error \[(\d+):(\d+)\]: /, "at character $2: ");
    }
}

/**
 * Try an expression against one sample item and report runtime problems such as
 * unknown variable names (e.g. `high` instead of `item.high`). Column references
 * and getItem() are stubbed, so only the expression's own structure is checked.
 */
export function getEvaluationError(expression: string, item: object): string | null {
    try {
        parser.parse(expression).evaluate({
            item,
            columns: {},
            now: Math.floor(Date.now() / 1000),
        } as any);
        return null;
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const undefinedVar = message.match(/^undefined variable: (\w+)/);
        if (undefinedVar) {
            return `Unknown name "${undefinedVar[1]}". Item fields need the "item." prefix, e.g. item.high - use the buttons below.`;
        }
        return message;
    }
}

/** IDs of other columns referenced as `columns.<id>` in an expression. */
export function findColumnReferences(expression: string): string[] {
    const ids = new Set<string>();
    for (const match of expression.matchAll(/\bcolumns\.([A-Za-z_$][\w$]*)/g)) {
        ids.add(match[1]);
    }
    return Array.from(ids);
}

/** Make a readable, unique column id usable as `columns.<id>` in expressions. */
export function makeColumnId(name: string, existingIds: string[]): string {
    let base = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 30);
    if (!base) base = "custom";
    if (/^[0-9]/.test(base)) base = `col_${base}`;
    const taken = new Set(existingIds);
    let id = base;
    for (let i = 2; taken.has(id); i++) id = `${base}_${i}`;
    return id;
}

/** Compact gp formatting, e.g. 1.25m, 950k, 2.1b (like in-game stack values). */
export function formatCompact(num: number): string {
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    const fmt = (n: number, suffix: string) =>
        `${sign}${n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 2 : n < 100 ? 1 : 0 })}${suffix}`;
    if (abs >= 1_000_000_000) return fmt(abs / 1_000_000_000, "b");
    if (abs >= 1_000_000) return fmt(abs / 1_000_000, "m");
    if (abs >= 10_000) return fmt(abs / 1_000, "k");
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatColumnValue(value: any, column: CustomColumn): string {
    if (value === null || value === undefined) return "-";

    if (column.type === "number") {
        const num = Number(value);
        if (!Number.isFinite(num)) return "-";

        switch (column.format) {
            case "currency":
                return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
            case "compact":
                return formatCompact(num);
            case "percentage":
                return `${(100 * num).toFixed(2)}%`;
            case "decimal":
                // Smart decimal: if integer, show no decimals. If float, show 2.
                return num.toLocaleString(undefined, {
                    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
                    maximumFractionDigits: 2
                });
            case "relativeTime": {
                const now = Math.floor(Date.now() / 1000);
                const diff = now - num;
                if (diff < 60) return `${diff}s ago`;
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                return `${Math.floor(diff / 86400)}d ago`;
            }
            default:
                return num.toLocaleString();
        }
    }

    // Objects (e.g. an item returned by getItem) have no sensible display value
    if (typeof value === "object") return "-";

    return String(value);
}
