import { create } from 'zustand';
import { ItemMapping } from '@/lib/types';
import { fetchAllMappings } from '@/lib/api';

interface MappingsState {
    mappings: Record<number, ItemMapping>;
    loading: boolean;
    loaded: boolean;
    loadMappings: () => Promise<void>;
}

export const useMappingsStore = create<MappingsState>((set, get) => ({
    mappings: {},
    loading: false,
    loaded: false,
    loadMappings: async () => {
        // Only load once
        if (get().loaded || get().loading) {
            return;
        }

        set({ loading: true });
        try {
            const mappingsList = await fetchAllMappings();
            const mappingsMap: Record<number, ItemMapping> = {};
            mappingsList.forEach(item => {
                mappingsMap[item.id] = item;
            });
            set({ mappings: mappingsMap, loaded: true });
        } catch (error) {
            console.error('Failed to load mappings:', error);
        } finally {
            set({ loading: false });
        }
    }
}));

// Initialize mappings on store creation
if (typeof window !== "undefined") useMappingsStore.getState().loadMappings();
