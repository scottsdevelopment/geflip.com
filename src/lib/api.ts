import { ItemMapping, ProcessedItem, PriceData, TimeSeriesData } from "./types";
import { findItemBySlugOrId } from "./slug";

const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_LATEST = `${API_BASE}/latest`;
const API_5M = `${API_BASE}/5m`;
const API_1H = `${API_BASE}/1h`;
const API_6H = `${API_BASE}/6h`;
const API_24H = `${API_BASE}/24h`;
const API_MAPPING = `${API_BASE}/mapping`;
const API_VOLUMES = `${API_BASE}/volumes`;
const API_TIMESERIES = `${API_BASE}/timeseries`;

// Module-level cache for mappings (they never change)
let cachedMappings: ItemMapping[] | null = null;
let mappingsFetchPromise: Promise<ItemMapping[]> | null = null;

const IS_SERVER = typeof window === "undefined";

// The Wiki prices API rejects requests without a descriptive User-Agent (HTTP 403),
// which breaks the static build. Browsers don't allow setting User-Agent, so only
// send it from the server/build side.
// See https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices#Please_set_a_descriptive_User-Agent!
const SERVER_HEADERS: HeadersInit = {
    "User-Agent": "geflip.com - OSRS flipping tools (https://github.com/scottsdevelopment/geflip.com)",
};

async function apiFetchJson<T>(url: string, revalidate: number): Promise<T> {
    const res = await fetch(url, {
        headers: IS_SERVER ? SERVER_HEADERS : undefined,
        next: { revalidate },
    });
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return (await res.json()) as T;
}

// Short-lived in-memory cache so slow-moving endpoints aren't re-downloaded on every
// refresh (and so the static build fetches bulk endpoints once per worker instead of per page).
const jsonCache = new Map<string, { expires: number; promise: Promise<unknown> }>();

function cachedFetchJson<T>(url: string, ttlSeconds: number): Promise<T> {
    const now = Date.now();
    const hit = jsonCache.get(url);
    if (hit && hit.expires > now) return hit.promise as Promise<T>;

    const promise = apiFetchJson<T>(url, ttlSeconds);
    jsonCache.set(url, { expires: now + ttlSeconds * 1000, promise });
    // Don't keep failed requests cached
    promise.catch(() => jsonCache.delete(url));
    return promise;
}

type DataResponse<T> = { data: Record<string, T> };

export async function fetchItemData(id: number): Promise<{ mapping: ItemMapping; price: PriceData; volume: number } | null> {
    try {
        // On the server (static build) fetch the bulk /latest once and reuse it for every item page,
        // instead of one request per item. In the browser, ask for just this item.
        const latestUrl = IS_SERVER ? API_LATEST : `${API_LATEST}?id=${id}`;
        const [mapping, latestRes, volumesRes] = await Promise.all([
            fetchAllMappings(),
            cachedFetchJson<DataResponse<PriceData>>(latestUrl, IS_SERVER ? 3600 : 60),
            cachedFetchJson<DataResponse<number>>(API_VOLUMES, 1800),
        ]);

        const latest = latestRes.data;
        const volumes = volumesRes.data;

        const itemMapping = mapping.find((i) => i.id === id);
        const itemPrice = latest[id];
        const itemVolume = volumes[id];

        if (!itemMapping) return null;

        return {
            mapping: itemMapping,
            price: itemPrice || { high: 0, highTime: 0, low: 0, lowTime: 0 },
            volume: itemVolume || 0,
        };
    } catch (err) {
        console.error("Error fetching item data:", err);
        return null;
    }
}

export async function fetchAllMappings(): Promise<ItemMapping[]> {
    // Return cached mappings if available
    if (cachedMappings) {
        return cachedMappings;
    }

    // Return existing promise if fetch is in progress
    if (mappingsFetchPromise) {
        return mappingsFetchPromise;
    }

    // Start new fetch
    mappingsFetchPromise = (async () => {
        try {
            const data = await apiFetchJson<ItemMapping[]>(API_MAPPING, 3600);
            cachedMappings = data;
            return data;
        } catch (err) {
            console.error("Error fetching mappings:", err);
            if (IS_SERVER) throw err; // fail the static build loudly rather than exporting no item pages
            return [];
        } finally {
            mappingsFetchPromise = null;
        }
    })();

    return mappingsFetchPromise;
}

export async function fetchItemDataBySlug(slug: string): Promise<{ mapping: ItemMapping; price: PriceData; volume: number } | null> {
    try {
        // 1. Fetch all mappings to find the ID from the slug
        const mappings = await fetchAllMappings();
        const item = findItemBySlugOrId(slug, mappings);

        if (!item) {
            return null;
        }

        // 2. Once we have the ID, fetch the specific data
        // We can reuse fetchItemData since we now have the ID
        return fetchItemData(item.id);
    } catch (err) {
        console.error("Error fetching item data by slug:", err);
        return null;
    }
}

export async function fetchTimeSeries(id: number, timestep: string): Promise<TimeSeriesData[]> {
    try {
        const json = await apiFetchJson<{ data?: TimeSeriesData[] }>(`${API_TIMESERIES}?timestep=${timestep}&id=${id}`, 300);
        return json.data || [];
    } catch (err) {
        console.error("Error fetching time series:", err);
        return [];
    }
}

export async function fetchFlippingData(): Promise<{ items: ProcessedItem[] }> {
    try {
        // /latest changes every minute; the averaged endpoints only update every 5 minutes / hour,
        // so cache those to avoid re-downloading several MB on every 60s refresh.
        const [latestRes, fiveMRes, oneHRes, sixHRes, twentyFourHRes, volumesRes] = await Promise.all([
            apiFetchJson<DataResponse<PriceData>>(API_LATEST, 60),
            cachedFetchJson<DataResponse<TimeSeriesData>>(API_5M, 240),
            cachedFetchJson<DataResponse<TimeSeriesData>>(API_1H, 600),
            cachedFetchJson<DataResponse<TimeSeriesData>>(API_6H, 1800),
            cachedFetchJson<DataResponse<TimeSeriesData>>(API_24H, 1800),
            cachedFetchJson<DataResponse<number>>(API_VOLUMES, 1800),
        ]);

        const latest = latestRes.data;
        const fiveM = fiveMRes.data;
        const oneH = oneHRes.data;
        const sixH = sixHRes.data;
        const twentyFourH = twentyFourHRes.data;
        const volumes = volumesRes.data;

        // Get mappings (cached at module level)
        const mapping = await fetchAllMappings();

        const results: ProcessedItem[] = [];

        for (const item of mapping) {
            const id = item.id;
            const price = latest[id];
            const volume = volumes[id];
            const limit = item.limit;

            if (!price || !price.high || !price.low || !volume) continue;

            const low = price.low;
            const lowTime = price.lowTime;
            const high = price.high;
            const highTime = price.highTime;

            // 5m Data
            const item5m = fiveM[id];
            const avg5m = item5m?.avgHighPrice || 0;
            const highVol5m = item5m?.highPriceVolume || 0;
            const lowVol5m = item5m?.lowPriceVolume || 0;

            // 1h Data
            const item1h = oneH[id];
            const avg1h = item1h?.avgHighPrice || 0;
            const highVol1h = item1h?.highPriceVolume || 0;
            const lowVol1h = item1h?.lowPriceVolume || 0;

            // 6h Data
            const item6h = sixH[id];
            const avg6h = item6h?.avgHighPrice || 0;
            const highVol6h = item6h?.highPriceVolume || 0;
            const lowVol6h = item6h?.lowPriceVolume || 0;

            // 24h Data
            const item24h = twentyFourH[id];
            const avg24h = item24h?.avgHighPrice || 0;
            const highVol24h = item24h?.highPriceVolume || 0;
            const lowVol24h = item24h?.lowPriceVolume || 0;

            // Only include raw data from API
            results.push({
                id,
                name: item.name,
                members: item.members,
                limit: limit !== undefined ? limit : 0,
                highalch: item.highalch || 0,
                low,
                lowTime,
                high,
                highTime,
                volume,
                avg5m,
                highVol5m,
                lowVol5m,
                avg1h,
                highVol1h,
                lowVol1h,
                avg6h,
                highVol6h,
                lowVol6h,
                avg24h,
                highVol24h,
                lowVol24h,
            });
        }

        return { items: results };
    } catch (err) {
        console.error("Error fetching flipping data:", err);
        // Rethrow so callers can keep showing the previous data instead of an empty table
        throw err;
    }
}

export function getItemImageUrl(name: string): string {
    const encoded = encodeURIComponent(name.replace(/ /g, "_"));
    return `https://oldschool.runescape.wiki/images/${encoded}_detail.png`;
}

export async function fetchTimeseriesForSMA(ids: number[], timestep: "24h" = "24h"): Promise<Record<number, TimeSeriesData[]>> {
    const BATCH_SIZE = 20;
    const results: Record<number, TimeSeriesData[]> = {};

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        try {
            const promises = batch.map(id =>
                apiFetchJson<{ data?: TimeSeriesData[] }>(`${API_TIMESERIES}?timestep=${timestep}&id=${id}`, 3600)
                    .then(json => ({ id, data: json.data }))
                    .catch(err => {
                        console.error(`Error fetching timeseries for ${id}:`, err);
                        return { id, data: [] };
                    })
            );

            const batchResults = await Promise.all(promises);
            batchResults.forEach(res => {
                if (res.data) {
                    results[res.id] = res.data;
                }
            });

        } catch (err) {
            console.error("Error fetching batch timeseries:", err);
        }
    }

    return results;
}
