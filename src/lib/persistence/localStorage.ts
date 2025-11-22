import { StorageAdapter } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
    async get<T>(key: string): Promise<T | null> {
        if (typeof window === "undefined") return null;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error deleting from localStorage key "${key}":`, error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
            throw error;
        }
    }
}
