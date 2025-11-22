import { StorageAdapter } from "./types";
import { LocalStorageAdapter } from "./localStorage";
import { CloudStorageAdapter } from "./cloudStorage";

export type StorageType = "local" | "cloud";

class StorageFactory {
    private static instance: StorageAdapter;
    private static type: StorageType = "local";

    static create(type: StorageType = "local"): StorageAdapter {
        if (this.instance && this.type === type) {
            return this.instance;
        }

        this.type = type;
        switch (type) {
            case "local":
                this.instance = new LocalStorageAdapter();
                break;
            case "cloud":
                this.instance = new CloudStorageAdapter();
                break;
            default:
                throw new Error(`Unknown storage type: ${type}`);
        }

        return this.instance;
    }

    static getInstance(): StorageAdapter {
        if (!this.instance) {
            return this.create(this.type);
        }
        return this.instance;
    }
}

export const storage = StorageFactory.getInstance();

export const STORAGE_KEYS = {
    COLUMNS: "osrs-flipper-columns-v4",
    FILTERS: "osrs-flipper-filters-v4",
    SETUP_VERSION: "osrs-flipper-setup-v1",
} as const;
