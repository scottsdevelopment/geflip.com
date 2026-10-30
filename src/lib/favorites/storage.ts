import { storage, STORAGE_KEYS } from "../persistence/storage";

export async function loadFavorites(): Promise<number[]> {
    const saved = await storage.get<number[]>(STORAGE_KEYS.FAVORITES);
    return Array.isArray(saved) ? saved.filter(id => typeof id === "number") : [];
}

export async function saveFavorites(favorites: number[]): Promise<void> {
    await storage.set(STORAGE_KEYS.FAVORITES, favorites);
}
