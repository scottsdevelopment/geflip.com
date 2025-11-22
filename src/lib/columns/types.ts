import { ProcessedItem } from "../types";

export interface CustomColumn {
    id: string;
    name: string;
    expression: string;
    type: "number" | "string" | "boolean";
    format?: "currency" | "percentage" | "decimal";
    enabled: boolean;
    isPreset?: boolean;
    group?: string;
    description?: string;
}

export interface ColumnContext {
    item: ProcessedItem;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawData?: any; // For SMA calculations or other advanced data
}
