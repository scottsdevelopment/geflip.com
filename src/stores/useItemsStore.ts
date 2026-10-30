import { create } from 'zustand';
import { ProcessedItem } from '@/lib/types';
import { fetchFlippingData } from '@/lib/api';

interface ItemsState {
    items: ProcessedItem[];
    loading: boolean;
    lastUpdated: Date | null;
    error: string | null;
    autoRefresh: boolean;
    timeLeft: number;
    refreshData: () => Promise<void>;
    toggleAutoRefresh: () => void;
    setTimeLeft: (time: number) => void;
}

export const useItemsStore = create<ItemsState>((set, get) => {
    // Auto-refresh timer
    let intervalId: NodeJS.Timeout | null = null;

    const startAutoRefresh = () => {
        if (intervalId) clearInterval(intervalId);

        intervalId = setInterval(() => {
            const state = get();
            // Don't poll the Wiki API while the tab is in the background
            if (typeof document !== 'undefined' && document.hidden) return;
            if (state.autoRefresh) {
                const newTimeLeft = state.timeLeft - 1;
                if (newTimeLeft <= 0) {
                    get().refreshData();
                    set({ timeLeft: 60 });
                } else {
                    set({ timeLeft: newTimeLeft });
                }
            }
        }, 1000);
    };

    // Start the timer immediately (browser only - avoid a stray interval during the static build)
    if (typeof window !== 'undefined') startAutoRefresh();

    return {
        items: [],
        loading: true,
        lastUpdated: null,
        error: null,
        autoRefresh: true,
        timeLeft: 60,

        refreshData: async () => {
            set({ loading: true });
            try {
                const { items } = await fetchFlippingData();
                set({
                    items,
                    lastUpdated: new Date(),
                    error: null,
                    timeLeft: 60
                });
            } catch (error) {
                // Keep the previously loaded items; just record the error
                console.error('Failed to refresh data:', error);
                set({ error: 'Could not load prices from the OSRS Wiki API. Retrying shortly.', timeLeft: 60 });
            } finally {
                set({ loading: false });
            }
        },

        toggleAutoRefresh: () => {
            set((state) => ({ autoRefresh: !state.autoRefresh }));
        },

        setTimeLeft: (time: number) => {
            set({ timeLeft: time });
        },
    };
});

// Initialize data on store creation - wait for mappings first
if (typeof window !== 'undefined') (async () => {
    const { useMappingsStore } = await import('@/stores/useMappingsStore');
    await useMappingsStore.getState().loadMappings();
    useItemsStore.getState().refreshData();
})();
