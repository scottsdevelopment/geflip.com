import { StorageAdapter } from "./types";

export class CloudStorageAdapter implements StorageAdapter {
    constructor() {
        // Initialize cloud provider SDK here (e.g., Firebase, Supabase)
    }

    async get<T>(key: string): Promise<T | null> {
        throw new Error("Cloud storage not implemented. Please configure a cloud provider.");
        // Example implementation:
        // const doc = await db.collection('settings').doc(userId).get();
        // return doc.data()?.[key] as T;
    }

    async set<T>(key: string, value: T): Promise<void> {
        throw new Error("Cloud storage not implemented. Please configure a cloud provider.");
        // Example implementation:
        // await db.collection('settings').doc(userId).set({ [key]: value }, { merge: true });
    }

    async delete(key: string): Promise<void> {
        throw new Error("Cloud storage not implemented. Please configure a cloud provider.");
        // Example implementation:
        // await db.collection('settings').doc(userId).update({ [key]: firebase.firestore.FieldValue.delete() });
    }

    async clear(): Promise<void> {
        throw new Error("Cloud storage not implemented. Please configure a cloud provider.");
    }
}
