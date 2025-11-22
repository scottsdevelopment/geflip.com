export interface StorageAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}

export interface MigrationFunction {
    version: number;
    migrate: (data: any) => any;
}
