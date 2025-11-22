import { SavedFilter } from "./types";

export const PRESET_FILTERS: SavedFilter[] = [
    {
        id: "f2p_only",
        name: "F2P Only",
        rule: { "==": [{ "var": "item.members" }, false] },
        enabled: false,
        category: "Restrictions",
        description: "Show only Free-to-Play items"
    },
    {
        id: "buy_under_5m",
        name: "Buy < 5m Avg",
        rule: { "<": [{ "var": "columns.low" }, { "var": "columns.avg5m" }] },
        enabled: false,
        category: "Price",
        description: "Current buy price is lower than 5 minute average"
    },
    {
        id: "high_volume",
        name: "High Volume (>10k)",
        rule: { ">=": [{ "var": "columns.volume" }, 10000] },
        enabled: false,
        category: "Volume",
        description: "Daily volume greater than 10,000"
    },
    {
        id: "high_roi",
        name: "High ROI (>5%)",
        rule: { ">=": [{ "var": "columns.roi" }, 5] },
        enabled: false,
        category: "Profit",
        description: "Return on Investment greater than 5%"
    },
    {
        id: "high_profit",
        name: "High Profit (>10k)",
        rule: { ">=": [{ "var": "columns.profit" }, 10000] },
        enabled: false,
        category: "Profit",
        description: "Profit per item greater than 10,000 GP"
    },
    {
        id: "potential_flip",
        name: "Potential Flip",
        rule: {
            "and": [
                { ">": [{ "var": "columns.roi" }, 2] },
                { ">": [{ "var": "columns.volume" }, 1000] },
                { ">": [{ "var": "columns.profit" }, 1000] }
            ]
        },
        enabled: false,
        category: "Strategy",
        description: "ROI > 2%, Vol > 1000, Profit > 1000"
    }
];
