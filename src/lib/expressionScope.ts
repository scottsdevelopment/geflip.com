import { Parser } from "expr-eval-fork";

// expr-eval-fork refuses functions passed in through the evaluation context (that was the
// code-execution hole in expr-eval), so helpers that need per-evaluation data, like
// getItem() and timeseries(), are registered on the parser and read that data from the
// scope of the evaluation currently running. Evaluation is synchronous, so a module-level
// scope is safe; withScope restores the previous one so nested column evaluation works.
export interface ExpressionScope {
    getItem?: (idOrName: number | string, property?: string) => unknown;
    timeseries?: (itemId: number, interval: string) => unknown;
}

let currentScope: ExpressionScope = {};

export function registerScopedFunctions(parser: Parser) {
    parser.functions.getItem = (idOrName: number | string, property?: string) =>
        currentScope.getItem?.(idOrName, property);
    parser.functions.timeseries = (itemId: number, interval: string) =>
        currentScope.timeseries?.(itemId, interval) ?? null;
}

export function withScope<T>(scope: ExpressionScope, fn: () => T): T {
    const previous = currentScope;
    currentScope = scope;
    try {
        return fn();
    } finally {
        currentScope = previous;
    }
}
