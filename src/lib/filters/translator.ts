import { FilterExpression, SavedFilter } from "./types";

/**
 * Simple condition interface for user-friendly filter building
 */
export interface SimpleCondition {
    field: string;       // Column ID or item property (e.g., 'roi', 'low', 'volume')
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number | string | boolean;
    valueType: 'number' | 'percentage' | 'currency' | 'boolean' | 'string';
}

/**
 * Configuration for a simple filter built through the UI
 */
export interface SimpleFilterConfig {
    name: string;
    category: string;
    description: string;
    conditions: SimpleCondition[];
    logic: 'AND' | 'OR';
}

/**
 * Available filter fields with metadata
 */
export interface FilterField {
    id: string;
    name: string;
    group: string;
    valueType: 'number' | 'percentage' | 'currency' | 'boolean' | 'string';
    isColumn: boolean;  // true if it's a column, false if it's an item property
    description?: string;
}

/**
 * Predefined filter fields that users can select from
 */
export const FILTER_FIELDS: FilterField[] = [
    // Price fields
    { id: 'low', name: 'Buy Price', group: 'Price', valueType: 'currency', isColumn: false, description: 'Current instant buy price' },
    { id: 'high', name: 'Sell Price', group: 'Price', valueType: 'currency', isColumn: false, description: 'Current instant sell price' },
    { id: 'avg5m', name: '5m Average', group: 'Price', valueType: 'currency', isColumn: false, description: '5-minute average price' },
    { id: 'avg1h', name: '1h Average', group: 'Price', valueType: 'currency', isColumn: false, description: '1-hour average price' },
    { id: 'avg24h', name: '24h Average', group: 'Price', valueType: 'currency', isColumn: false, description: '24-hour average price' },

    // Profit fields
    { id: 'roi', name: 'ROI %', group: 'Profit', valueType: 'percentage', isColumn: true, description: 'Return on investment percentage' },
    { id: 'profit', name: 'Margin', group: 'Profit', valueType: 'currency', isColumn: true, description: 'Profit per item after tax' },
    { id: 'potentialProfit', name: 'Potential Profit', group: 'Profit', valueType: 'currency', isColumn: true, description: 'Max profit per 4 hours' },
    { id: 'marginVolume', name: 'Margin × Volume', group: 'Profit', valueType: 'currency', isColumn: true, description: 'Potential daily profit' },

    // Volume fields
    { id: 'volume', name: 'Daily Volume', group: 'Volume', valueType: 'number', isColumn: false, description: 'Total 24h trading volume' },
    { id: 'total5mVol', name: '5m Volume', group: 'Volume', valueType: 'number', isColumn: true, description: '5-minute trading volume' },
    { id: 'total1hVol', name: '1h Volume', group: 'Volume', valueType: 'number', isColumn: true, description: '1-hour trading volume' },

    // Core item properties
    { id: 'members', name: 'Members Only', group: 'Core', valueType: 'boolean', isColumn: false, description: 'Whether item is members-only' },
    { id: 'limit', name: 'Buy Limit', group: 'Core', valueType: 'number', isColumn: false, description: 'GE buy limit per 4 hours' },
    { id: 'favorite', name: 'Favorited', group: 'Core', valueType: 'boolean', isColumn: false, description: 'Whether item is favorited' },

    // Alchemy
    { id: 'alchValue', name: 'High Alch Value', group: 'Alchemy', valueType: 'currency', isColumn: true, description: 'High alchemy gold value' },
    { id: 'alchMargin', name: 'Alch Margin', group: 'Alchemy', valueType: 'currency', isColumn: true, description: 'Profit from high alching' },
];

/**
 * Format a value based on its type for display purposes
 */
export function formatFilterValue(value: number | string | boolean, valueType: string): string {
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (typeof value === 'string') {
        return `"${value}"`;
    }

    if (valueType === 'percentage') {
        return `${value}%`;
    }

    if (valueType === 'currency') {
        return `${value.toLocaleString()} GP`;
    }

    return value.toString();
}

/**
 * Parse a user input value based on the expected type
 */
export function parseFilterValue(input: string, valueType: string): number | string | boolean | null {
    const trimmed = input.trim();

    if (valueType === 'boolean') {
        const lower = trimmed.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
        return null;
    }

    if (valueType === 'percentage') {
        // Remove % sign if present and convert to decimal
        const cleaned = trimmed.replace('%', '').replace(/,/g, '');
        const num = parseFloat(cleaned);
        if (isNaN(num)) return null;
        return num / 100; // Convert percentage to decimal for expression
    }

    if (valueType === 'currency' || valueType === 'number') {
        // Remove common formatting characters
        const cleaned = trimmed.replace(/[,\s]/g, '').replace(/gp$/i, '').replace(/k$/i, '000').replace(/m$/i, '000000');
        const num = parseFloat(cleaned);
        if (isNaN(num)) return null;
        return num;
    }

    if (valueType === 'string') {
        return trimmed;
    }

    return null;
}

/**
 * Translate a single condition to a JavaScript expression
 */
export function translateConditionToExpression(condition: SimpleCondition): string {
    const field = FILTER_FIELDS.find(f => f.id === condition.field);
    if (!field) {
        throw new Error(`Unknown field: ${condition.field}`);
    }

    // Determine the prefix (item. or columns.)
    const prefix = field.isColumn ? 'columns.' : 'item.';
    const fieldRef = `${prefix}${condition.field}`;

    // Handle boolean values specially
    if (condition.valueType === 'boolean') {
        if (condition.operator === '==') {
            return condition.value ? fieldRef : `!${fieldRef}`;
        } else if (condition.operator === '!=') {
            return condition.value ? `!${fieldRef}` : fieldRef;
        }
    }

    // Handle string values (needs quotes)
    if (condition.valueType === 'string') {
        return `${fieldRef} ${condition.operator} "${condition.value}"`;
    }

    // Handle percentage values (convert to decimal)
    if (condition.valueType === 'percentage') {
        const decimalValue = Number(condition.value) / 100;
        return `${fieldRef} ${condition.operator} ${decimalValue}`;
    }

    // Numeric values
    return `${fieldRef} ${condition.operator} ${condition.value}`;
}

/**
 * Translate multiple conditions into a complete filter expression
 */
export function translateSimpleFilter(conditions: SimpleCondition[], logic: 'AND' | 'OR'): FilterExpression {
    if (conditions.length === 0) {
        throw new Error("At least one condition is required");
    }

    const expressions = conditions.map(translateConditionToExpression);
    const logicOp = logic === 'AND' ? ' and ' : ' or ';
    const code = expressions.join(logicOp);

    return {
        code
    };
}

/**
 * Validate that a condition is complete and valid
 */
export function validateCondition(condition: SimpleCondition): { valid: boolean; error?: string } {
    if (!condition.field) {
        return { valid: false, error: "Field is required" };
    }

    const field = FILTER_FIELDS.find(f => f.id === condition.field);
    if (!field) {
        return { valid: false, error: `Unknown field: ${condition.field}` };
    }

    if (!condition.operator) {
        return { valid: false, error: "Operator is required" };
    }

    if (condition.value === null || condition.value === undefined || condition.value === '') {
        return { valid: false, error: "Value is required" };
    }

    // Validate value type matches field type
    if (field.valueType === 'boolean' && typeof condition.value !== 'boolean') {
        return { valid: false, error: "Value must be true or false" };
    }

    if ((field.valueType === 'number' || field.valueType === 'currency' || field.valueType === 'percentage')
        && typeof condition.value !== 'number') {
        return { valid: false, error: "Value must be a number" };
    }

    return { valid: true };
}

/**
 * Auto-generate a filter name from conditions
 */
export function generateFilterName(conditions: SimpleCondition[], logic: 'AND' | 'OR'): string {
    if (conditions.length === 0) return "Unnamed Filter";

    if (conditions.length === 1) {
        const cond = conditions[0];
        const field = FILTER_FIELDS.find(f => f.id === cond.field);
        if (!field) return "Custom Filter";

        const opSymbol = cond.operator;
        let valueStr = '';

        // Format value for display
        if (cond.valueType === 'boolean') {
            valueStr = cond.value ? 'true' : 'false';
        } else if (cond.valueType === 'percentage') {
            valueStr = `${(Number(cond.value) * 100).toFixed(0)}%`;
        } else if (cond.valueType === 'currency') {
            const num = Number(cond.value);
            if (num >= 1000000) {
                valueStr = `${(num / 1000000).toFixed(1)}m`;
            } else if (num >= 1000) {
                valueStr = `${(num / 1000).toFixed(0)}k`;
            } else {
                valueStr = num.toString();
            }
        } else {
            valueStr = cond.value.toString();
        }

        return `${field.name} ${opSymbol} ${valueStr}`;
    }

    // Multiple conditions - show all with logic
    const parts = conditions.map(cond => {
        const field = FILTER_FIELDS.find(f => f.id === cond.field);
        if (!field) return '';

        let valueStr = '';
        if (cond.valueType === 'boolean') {
            valueStr = cond.value ? 'true' : 'false';
        } else if (cond.valueType === 'percentage') {
            valueStr = `${(Number(cond.value) * 100).toFixed(0)}%`;
        } else if (cond.valueType === 'currency') {
            const num = Number(cond.value);
            if (num >= 1000000) {
                valueStr = `${(num / 1000000).toFixed(1)}m`;
            } else if (num >= 1000) {
                valueStr = `${(num / 1000).toFixed(0)}k`;
            } else {
                valueStr = num.toString();
            }
        } else {
            valueStr = cond.value.toString();
        }

        return `${field.name} ${cond.operator} ${valueStr}`;
    }).filter(p => p);

    // Join with logic operator
    const logicStr = logic === 'AND' ? ' AND ' : ' OR ';
    return parts.join(logicStr);
}

/**
 * Convert a SimpleFilterConfig to a SavedFilter
 */
export function simpleFilterToSavedFilter(config: SimpleFilterConfig): SavedFilter {
    const expression = translateSimpleFilter(config.conditions, config.logic);

    return {
        id: `filter_${Date.now()}`,
        name: config.name || generateFilterName(config.conditions, config.logic),
        expressions: [expression],
        enabled: true,
        category: config.category || 'Custom',
        description: config.description || `${config.logic} filter with ${config.conditions.length} condition(s)`,
        independent: false
    };
}

/**
 * Attempt to parse an advanced filter code string back into SimpleConditions
 * Returns null if parsing fails or code is too complex
 */
export function parseAdvancedFilter(code: string): { conditions: SimpleCondition[], logic: 'AND' | 'OR', failedCount: number } | null {
    if (!code || !code.trim()) return null;

    // Determine logic
    let logic: 'AND' | 'OR' = 'AND';
    let parts: string[] = [code];

    if (code.includes(' or ')) {
        logic = 'OR';
        parts = code.split(' or ');
    } else if (code.includes(' and ')) {
        logic = 'AND';
        parts = code.split(' and ');
    }

    const conditions: SimpleCondition[] = [];
    let failedCount = 0;

    for (const part of parts) {
        const trimmed = part.trim();
        // Remove parentheses if present (simple handling)
        const cleanPart = trimmed.replace(/^\((.*)\)$/, '$1');

        // Try to match standard comparison: prefix.field op value
        // Put longer operators first to avoid partial matching (e.g. matching > instead of >=)
        const match = cleanPart.match(/^(columns\.|item\.)(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);

        if (match) {
            const [, , fieldId, operator, valueStr] = match;
            const field = FILTER_FIELDS.find(f => f.id === fieldId);

            if (!field) {
                failedCount++;
                continue;
            }

            // Parse value
            let value: any = valueStr;
            const valueType = field.valueType;

            // Remove quotes for strings
            if (valueType === 'string' && (value.startsWith('"') || value.startsWith("'"))) {
                value = value.slice(1, -1);
            } else if (valueType === 'boolean') {
                value = value === 'true';
            } else if (valueType === 'number' || valueType === 'currency' || valueType === 'percentage') {
                value = parseFloat(value);
                if (isNaN(value)) {
                    failedCount++;
                    continue;
                }

                // For percentage, the expression uses decimal (0.05), but UI uses percentage (5)
                if (valueType === 'percentage') {
                    value = value * 100;
                    // Round to avoid floating point errors e.g. 5.0000000001
                    value = Math.round(value * 100) / 100;
                }
            }

            conditions.push({
                field: fieldId,
                operator: operator as any,
                value,
                valueType
            });
            continue;
        }

        // Try to match boolean shorthand: item.members or !item.members
        const boolMatch = cleanPart.match(/^(!?)\s*(columns\.|item\.)(\w+)$/);
        if (boolMatch) {
            const [, notPrefix, , fieldId] = boolMatch;
            const field = FILTER_FIELDS.find(f => f.id === fieldId);

            if (!field || field.valueType !== 'boolean') {
                failedCount++;
                continue;
            }

            conditions.push({
                field: fieldId,
                operator: '==',
                value: notPrefix !== '!', // if "!", value is false. if "", value is true.
                valueType: 'boolean'
            });
            continue;
        }

        // If no match found, parsing fails for this part
        failedCount++;
    }

    return { conditions, logic, failedCount };
}
