import { storage, STORAGE_KEYS } from "../persistence/storage";
import { CustomColumn } from "./types";
import { PRESET_COLUMNS } from "./presets";
import { findColumnReferences } from "./engine";
import { loadFilters } from "../filters/storage";

// Previous default expressions of preset columns, used to upgrade stored copies.
const LEGACY_PRESET_EXPRESSIONS: Record<string, string[]> = {
    roi: ["(((item.high * 0.98) - item.low) / item.low)"],
    profit: ["round((item.high * 0.98) - item.low)"],
    potentialProfit: ["item.limit * round((item.high * 0.98) - item.low)"],
    marginVolume: ["item.volume * round((item.high * 0.98) - item.low)"],
};

export async function loadColumns(): Promise<CustomColumn[]> {
    let saved = await storage.get<CustomColumn[]>(STORAGE_KEYS.COLUMNS);

    if (!saved) {
        // Seed with presets
        await saveColumns(PRESET_COLUMNS);
        return PRESET_COLUMNS;
    }

    // Guard against corrupted/foreign data in localStorage
    if (!Array.isArray(saved)) {
        await saveColumns(PRESET_COLUMNS);
        return PRESET_COLUMNS;
    }

    // Migrate preset columns that still use an outdated preset expression
    // (e.g. the old flat "* 0.98" tax) to the current preset definition.
    // Columns the user edited themselves are left untouched.
    let migratedAny = false;
    saved = saved.map(col => {
        const preset = PRESET_COLUMNS.find(p => p.id === col.id);
        if (preset && LEGACY_PRESET_EXPRESSIONS[col.id]?.includes(col.expression)) {
            migratedAny = true;
            return { ...col, expression: preset.expression, description: preset.description };
        }
        return col;
    });

    // Merge in any new presets that aren't in saved
    const savedIds = new Set(saved.map(c => c.id));
    const newPresets = PRESET_COLUMNS.filter(c => !savedIds.has(c.id));

    if (newPresets.length > 0) {
        const merged = [...saved, ...newPresets];
        await saveColumns(merged);
        return merged;
    }

    if (migratedAny) await saveColumns(saved);
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
    const refersTo = (code: string | undefined) => !!code && findColumnReferences(code).includes(id);

    const filters = await loadFilters();
    const dependentFilters = filters.filter(f =>
        (f.expressions || []).some(expr => refersTo(expr.code) || refersTo(expr.highlightItem))
    );

    if (dependentFilters.length > 0) {
        throw new Error(`Cannot delete column. It is used by filters: ${dependentFilters.map(f => f.name).join(", ")}`);
    }

    const columns = await loadColumns();
    const dependentColumns = columns.filter(c => c.id !== id && refersTo(c.expression));
    if (dependentColumns.length > 0) {
        throw new Error(`Cannot delete column. It is used by columns: ${dependentColumns.map(c => c.name).join(", ")}`);
    }

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
