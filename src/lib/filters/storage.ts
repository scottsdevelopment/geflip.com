import { storage, STORAGE_KEYS } from "../persistence/storage";
import { SavedFilter } from "./types";
import { PRESET_FILTERS } from "./presets";

export async function loadFilters(): Promise<SavedFilter[]> {
    const saved = await storage.get<SavedFilter[]>(STORAGE_KEYS.FILTERS);

    if (!saved) {
        await saveFilters(PRESET_FILTERS);
        return PRESET_FILTERS;
    }

    return saved;
}

export async function saveFilters(filters: SavedFilter[]): Promise<void> {
    await storage.set(STORAGE_KEYS.FILTERS, filters);
}

export async function addFilter(filter: SavedFilter): Promise<SavedFilter[]> {
    const filters = await loadFilters();
    const newFilters = [...filters, filter];
    await saveFilters(newFilters);
    return newFilters;
}

export async function updateFilter(id: string, updates: Partial<SavedFilter>): Promise<SavedFilter[]> {
    const filters = await loadFilters();
    const newFilters = filters.map(f => f.id === id ? { ...f, ...updates } : f);
    await saveFilters(newFilters);
    return newFilters;
}

export async function deleteFilter(id: string): Promise<SavedFilter[]> {
    const filters = await loadFilters();
    const newFilters = filters.filter(f => f.id !== id);
    await saveFilters(newFilters);
    return newFilters;
}

export async function toggleFilter(id: string): Promise<SavedFilter[]> {
    const filters = await loadFilters();
    const newFilters = filters.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    await saveFilters(newFilters);
    return newFilters;
}
