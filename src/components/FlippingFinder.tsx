"use client";

import React, { useState, useEffect } from "react";
import { ProcessedItem } from "@/lib/types";
import FlippingTable from "./FlippingTable";
import { useItemData } from "@/context/ItemDataContext";
import SavedFilterManager from "./SavedFilterManager";
import { SavedFilter } from "@/lib/filters/types";
import { loadFilters, addFilter, updateFilter, deleteFilter, toggleFilter } from "@/lib/filters/storage";
import { PRESET_FILTERS } from "@/lib/filters/presets";
import { evaluateFilters } from "@/lib/filters/engine";

import { CustomColumn } from "@/lib/columns/types";
import { loadColumns } from "@/lib/columns/storage";
import { PRESET_COLUMNS } from "@/lib/columns/presets";

export default function FlippingFinder() {
    const { items, loading } = useItemData();
    const [searchQuery, setSearchQuery] = useState("");
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(PRESET_FILTERS);
    const [customColumns, setCustomColumns] = useState<CustomColumn[]>(PRESET_COLUMNS);

    useEffect(() => {
        loadFilters().then(setSavedFilters);
        loadColumns().then(setCustomColumns);
    }, []);

    const handleAddFilter = async (filter: SavedFilter) => {
        const newFilters = await addFilter(filter);
        setSavedFilters(newFilters);
    };

    const handleUpdateFilter = async (filter: SavedFilter) => {
        const newFilters = await updateFilter(filter.id, filter);
        setSavedFilters(newFilters);
    };

    const handleDeleteFilter = async (id: string) => {
        const newFilters = await deleteFilter(id);
        setSavedFilters(newFilters);
    };

    const handleToggleFilter = async (id: string) => {
        const newFilters = await toggleFilter(id);
        setSavedFilters(newFilters);
    };

    // Filter logic
    const filteredItems = items.filter((item) => {
        // 1. Apply Saved Filters (JSON Logic)
        if (!evaluateFilters(item, savedFilters, customColumns)) return false;

        // 2. Apply Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!item.name.toLowerCase().includes(query)) return false;
        }

        return true;
    });

    return (
        <div id="flipping-tab" className="block w-full">
            <SavedFilterManager
                filters={savedFilters}
                onAddFilter={handleAddFilter}
                onUpdateFilter={handleUpdateFilter}
                onDeleteFilter={handleDeleteFilter}
                onToggleFilter={handleToggleFilter}
            />
            {loading && items.length === 0 ? (
                <div className="text-center p-4 text-osrs-text">Loading data...</div>
            ) : (
                <FlippingTable
                    items={filteredItems}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            )}
        </div>
    );
}
