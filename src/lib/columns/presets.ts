import { CustomColumn } from "./types";

export const PRESET_COLUMNS: CustomColumn[] = [
    // Core Item Data
    {
        id: "favorite",
        name: "Fav",
        expression: "item.favorite",
        type: "boolean",
        enabled: true,
        group: "Core",
        description: "Favorite items"
    },
    {
        id: "action",
        name: "Action",
        expression: "item._action",
        type: "string",
        enabled: false,
        group: "Core",
        description: "Action to take based on filters"
    },
    {
        id: "name",
        name: "Item",
        expression: "item.name",
        type: "string",
        enabled: true,
        group: "Core",
        description: "The name of the item"
    },
    {
        id: "limit",
        name: "Buy Limit",
        expression: "item.limit",
        type: "number",
        format: "decimal",
        enabled: true,
        group: "Core",
        description: "Grand Exchange buy limit every 4 hours"
    },
    {
        id: "members",
        name: "Members",
        expression: "item.members",
        type: "boolean",
        enabled: true,
        group: "Core",
        description: "Whether the item is members only"
    },
    {
        id: "low",
        name: "Sell Price",
        expression: "item.low",
        type: "number",
        format: "decimal",
        enabled: true,
        group: "Core",
        description: "Current lowest price someone is selling for (instant buy)"
    },
    {
        id: "lowTime",
        name: "Most Recent Sell",
        expression: "item.lowTime",
        type: "number",
        format: "relativeTime",
        enabled: true,
        group: "Core",
        description: "Time of the latest low price update"
    },
    {
        id: "high",
        name: "Buy Price",
        expression: "item.high",
        type: "number",
        format: "decimal",
        enabled: true,
        group: "Core",
        description: "Current highest price someone is buying for (instant sell)"
    },
    {
        id: "highTime",
        name: "Most Recent Buy",
        expression: "item.highTime",
        type: "number",
        format: "relativeTime",
        enabled: true,
        group: "Core",
        description: "Time of the latest high price update"
    },
    {
        id: "roi",
        name: "ROI %",
        expression: "(((item.high * 0.98) - item.low) / item.low)",
        type: "number",
        format: "percentage",
        enabled: true,
        group: "Profit",
        description: "Return on Investment percentage after tax"
    },
    {
        id: "profit",
        name: "Margin",
        expression: "round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Potential profit per item after 2% GE tax"
    },
    {
        id: "volume",
        name: "Daily Volume",
        expression: "item.volume",
        type: "number",
        format: "decimal",
        enabled: true,
        group: "Volume",
        description: "Total number of items traded in the last 24 hours"
    },
    {
        id: "potentialProfit",
        name: "Potential Profit",
        expression: "item.limit * round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Max potential profit per 4 hours (Limit * Margin)"
    },
    {
        id: "marginVolume",
        name: "Margin * Volume",
        expression: "item.volume * round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Potential daily profit (Volume * Margin)"
    },

    // Disabled / Other Columns
    {
        id: "itemId",
        name: "ID",
        expression: "item.id",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "The unique item ID"
    },
    {
        id: "highTimeDelta",
        name: "High Time Delta",
        expression: "now - item.highTime",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "Seconds since last high price update"
    },
    {
        id: "lowTimeDelta",
        name: "Low Time Delta",
        expression: "now - item.lowTime",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "Seconds since last low price update"
    },
    {
        id: "total5mVol",
        name: "5m Vol",
        expression: "item.highVol5m + item.lowVol5m",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 5 minutes"
    },
    {
        id: "total1hVol",
        name: "1h Vol",
        expression: "item.highVol1h + item.lowVol1h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last hour"
    },
    {
        id: "total6hVol",
        name: "6h Vol",
        expression: "item.highVol6h + item.lowVol6h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 6 hours"
    },
    {
        id: "total24hVol",
        name: "24h Vol",
        expression: "item.highVol24h + item.lowVol24h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 24 hours (calculated from high/low)"
    },
    {
        id: "avg5m",
        name: "5m Avg",
        expression: "item.avg5m",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 5 minutes"
    },
    {
        id: "avg1h",
        name: "1h Avg",
        expression: "item.avg1h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Averages",
        description: "Average price over the last hour"
    },
    {
        id: "avg6h",
        name: "6h Avg",
        expression: "item.avg6h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 6 hours"
    },
    {
        id: "avg24h",
        name: "24h Avg",
        expression: "item.avg24h",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 24 hours"
    },
    {
        id: "alchValue",
        name: "High Alch",
        expression: "item.highalch",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Alchemy",
        description: "High alchemy value of the item"
    },
    {
        id: "alchMargin",
        name: "Alch Margin",
        expression: "item.highalch > 0 ? round(item.highalch - item.low) : 0",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Alchemy",
        description: "Profit from high alching after buying at current price"
    }
];
