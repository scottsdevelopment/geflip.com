export interface ItemMapping {
    id: number;
    name: string;
    members: boolean;
    limit?: number;
    value?: number;
    highalch?: number;
    lowalch?: number;
    examine?: string;
    icon?: string;
}

export interface PriceData {
    high: number;
    highTime: number;
    low: number;
    lowTime: number;
}

export interface TimeSeriesData {
    avgHighPrice: number | null;
    highPriceVolume: number;
    avgLowPrice: number | null;
    lowPriceVolume: number;
    timestamp?: number;
}

// Simplified ProcessedItem - only contains raw API data
export interface ProcessedItem {
    // Core item data from mapping
    id: number;
    name: string;
    members: boolean;
    limit: number | string;
    highalch: number | null;

    // Latest price data
    low: number;
    high: number;

    // Volume data
    volume: number; // 24h volume

    // 5m data
    avg5m: number | string;
    highVol5m: number;
    lowVol5m: number;

    // 1h data
    avg1h: number | string;
    highVol1h: number;
    lowVol1h: number;
}
