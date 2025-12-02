"use client";

import React, { useState } from "react";
import FlippingTable from "./FlippingTable";
import SavedFilterManager from "./SavedFilterManager";
import { SavedFilter } from "@/lib/filters/types";
import { useItemsStore } from "@/stores/useItemsStore";
import { useFiltersStore } from "@/stores/useFiltersStore";
import CustomColumnManager from "./CustomColumnManager";

export default function FlippingFinder() {
    const items = useItemsStore(state => state.items);
    const loading = useItemsStore(state => state.loading);
    const savedFilters = useFiltersStore(state => state.savedFilters);

    const [previewFilter, setPreviewFilter] = useState<SavedFilter | null>(null);

    const handlePreviewFilter = (filter: SavedFilter | null) => {
        setPreviewFilter(filter);
    };

    // Combine saved filters with preview filter for table display
    const effectiveFilters = previewFilter
        ? [...savedFilters, { ...previewFilter, enabled: true }]
        : undefined; // Let FlippingTable use its own filters

    return (
        <div id="flipping-tab" className="block w-full">
            <SavedFilterManager
                onPreviewFilter={handlePreviewFilter}
            />

            <CustomColumnManager />

            <FlippingTable
                filters={effectiveFilters}
            />
        </div>
    );
}
