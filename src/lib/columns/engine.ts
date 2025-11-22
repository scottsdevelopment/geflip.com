import { Parser } from "expr-eval";
import { CustomColumn, ColumnContext } from "./types";

const parser = new Parser();
// Cache parsed expressions to avoid re-parsing for every item
// Key: expression string, Value: Parsed Expression
const expressionCache = new Map<string, any>();

// Register custom functions
parser.functions.sma = (data: any[], period: number) => {
    if (!Array.isArray(data) || data.length < period) return 0;
    // Assuming data is sorted by time descending (newest first) or we need to handle it.
    // For OSRS timeseries, usually it's array of objects. We need to know the structure.
    // Let's assume data is array of { avgHighPrice, avgLowPrice, ... } or just numbers if pre-processed.
    // For now, let's assume it's passed as an array of numbers (prices).

    // If it's an array of objects, we might need a path.
    // Let's keep it simple: sma(arrayOfNumbers, period)

    const slice = data.slice(0, period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
};

// Helper to safely evaluate
export function evaluateColumn(column: CustomColumn, context: ColumnContext, allColumns: CustomColumn[] = [], depth = 0): any {
    if (depth > 10) {
        console.warn(`Circular dependency detected for column ${column.name}`);
        return null;
    }

    try {
        let expr = expressionCache.get(column.expression);
        if (!expr) {
            expr = parser.parse(column.expression);
            expressionCache.set(column.expression, expr);
        }

        // Create a proxy for 'columns' to lazily evaluate dependencies
        const columnsProxy = new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    const depCol = allColumns.find(c => c.id === prop);
                    if (depCol) {
                        return evaluateColumn(depCol, context, allColumns, depth + 1);
                    }
                }
                return undefined;
            }
        });

        // Extend context with columns proxy
        const evalContext = { ...context, columns: columnsProxy };

        return expr.evaluate(evalContext);
    } catch (error) {
        console.warn(`Error evaluating column ${column.name}:`, error);
        return null;
    }
}

export function validateExpression(expression: string): boolean {
    try {
        parser.parse(expression);
        return true;
    } catch (e) {
        return false;
    }
}

export function formatColumnValue(value: any, column: CustomColumn): string {
    if (value === null || value === undefined) return "-";

    if (column.type === "number") {
        const num = Number(value);
        if (isNaN(num)) return "-";

        switch (column.format) {
            case "currency":
                return num.toLocaleString();
            case "percentage":
                return `${num.toFixed(2)}%`;
            case "decimal":
                return num.toFixed(2);
            default:
                return num.toLocaleString();
        }
    }

    return String(value);
}
