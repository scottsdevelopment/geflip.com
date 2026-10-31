import { ProcessedItem } from "../types";
import { TimeseriesCache } from "../timeseries/cache";

export interface CustomColumn {
    id: string;
    name: string;
    expression: string;
    type: "number" | "string" | "boolean";
    format?: "currency" | "compact" | "percentage" | "decimal" | "relativeTime";
    enabled: boolean;
    isPreset?: boolean;
    group?: string;
    description?: string;
}

export interface ColumnContext {
    item: ProcessedItem;
    cache?: TimeseriesCache;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawData?: any; // Deprecated - use cache instead
}
