import { storage, STORAGE_KEYS } from "../persistence/storage";
import { CustomColumn } from "./types";
import { PRESET_COLUMNS } from "./presets";
import { loadFilters } from "../filters/storage";

export async function loadColumns(): Promise<CustomColumn[]> {
    const saved = await storage.get<CustomColumn[]>(STORAGE_KEYS.COLUMNS);

    if (!saved) {
        // Seed with presets
        await saveColumns(PRESET_COLUMNS);
        return PRESET_COLUMNS;
    }

    return saved;
}

export async function saveColumns(columns: CustomColumn[]): Promise<void> {
    await storage.set(STORAGE_KEYS.COLUMNS, columns);
}

export async function addColumn(column: CustomColumn): Promise<CustomColumn[]> {
    const columns = await loadColumns();
    const newColumns = [...columns, column];
    await saveColumns(newColumns);
    return newColumns;
}

export async function updateColumn(id: string, updates: Partial<CustomColumn>): Promise<CustomColumn[]> {
    const columns = await loadColumns();
    const newColumns = columns.map(col => col.id === id ? { ...col, ...updates } : col);
    await saveColumns(newColumns);
    return newColumns;
}

export async function deleteColumn(id: string): Promise<CustomColumn[]> {
    // Check dependencies first
    const filters = await loadFilters();
    const dependentFilters = filters.filter(f => JSON.stringify(f.rule).includes(`columns.${id}`));

    if (dependentFilters.length > 0) {
        throw new Error(`Cannot delete column. It is used by filters: ${dependentFilters.map(f => f.name).join(", ")}`);
    }

    const columns = await loadColumns();
    const newColumns = columns.filter(col => col.id !== id); // Allow deleting anything
    await saveColumns(newColumns);
    return newColumns;
}

export async function toggleColumn(id: string): Promise<CustomColumn[]> {
    const columns = await loadColumns();
    const newColumns = columns.map(col => col.id === id ? { ...col, enabled: !col.enabled } : col);
    await saveColumns(newColumns);
    return newColumns;
}
