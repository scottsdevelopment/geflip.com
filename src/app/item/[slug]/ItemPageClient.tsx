"use client";

import { fetchItemDataBySlug } from "@/lib/api";
import ItemDetails from "@/components/ItemDetails";
import ItemDetailsSkeleton from "@/components/ItemDetailsSkeleton";
import { useEffect, useState } from "react";
import { ItemMapping, PriceData } from "@/lib/types";
import { useItemsStore } from "@/stores/useItemsStore";
import { useMappingsStore } from "@/stores/useMappingsStore";
import { findItemBySlugOrId } from "@/lib/slug";

interface ItemData {
    mapping: ItemMapping;
    price: PriceData;
    volume: number;
}

interface ItemPageClientProps {
    slug: string;
}

export default function ItemPageClient({ slug }: ItemPageClientProps) {
    const { items, loading: itemsLoading } = useItemsStore();
    const { mappings, loading: mappingsLoading } = useMappingsStore();
    const [data, setData] = useState<ItemData | null>(null);
    const [loading, setLoading] = useState(true);

    const storeLoading = itemsLoading || mappingsLoading;

    useEffect(() => {
        const mappingsList = Object.values(mappings);

        // If we have mappings in the store, use them
        if (mappingsList.length > 0) {
            const mapping = findItemBySlugOrId(slug, mappingsList);

            if (mapping) {
                const processedItem = items.find(i => i.id === mapping.id);
                const price: PriceData = processedItem ? {
                    high: processedItem.high,
                    highTime: processedItem.highTime,
                    low: processedItem.low,
                    lowTime: processedItem.lowTime
                } : { high: 0, highTime: 0, low: 0, lowTime: 0 };

                const volume = processedItem ? processedItem.volume : 0;

                setData({ mapping, price, volume });

                setLoading(false);
            } else {
                setData(null);
                setLoading(false);
            }
            return;
        }

        // If store is empty but loading, wait for it
        if (storeLoading) {
            setLoading(true);
            return;
        }

        // Fallback: Store is empty and not loading (e.g. error or first load failed), fetch individually
        // Only do this once per slug
        let cancelled = false;
        async function loadData() {
            setLoading(true);
            const itemData = await fetchItemDataBySlug(slug);
            if (!cancelled) {
                setData(itemData);
                setLoading(false);

                if (itemData) {

                }
            }
        }
        loadData();

        return () => {
            cancelled = true;
        };
    }, [slug, mappings, items, storeLoading]);

    // Show loading skeleton if:
    // 1. Still loading data
    // 2. Have data but it's incomplete (missing price information)
    const showSkeleton = loading || (data && (!data.price.high || !data.price.low));

    if (showSkeleton) {
        return <ItemDetailsSkeleton />;
    }

    if (!data) {
        return <div className="p-8 text-center">Item not found</div>;
    }

    return (
        <main>
            <ItemDetails item={data.mapping} price={data.price} volume={data.volume} />
        </main>
    );
}
