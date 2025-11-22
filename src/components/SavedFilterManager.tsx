"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2 } from "lucide-react";
import { SavedFilter } from "@/lib/filters/types";
import FilterBuilder from "./FilterBuilder";

interface SavedFilterManagerProps {
    filters: SavedFilter[];
    onUpdateFilter: (filter: SavedFilter) => void;
    onAddFilter: (filter: SavedFilter) => void;
    onDeleteFilter: (id: string) => void;
    onToggleFilter: (id: string) => void;
}

export default function SavedFilterManager({
    filters,
    onUpdateFilter,
    onAddFilter,
    onDeleteFilter,
    onToggleFilter,
}: SavedFilterManagerProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingFilter, setEditingFilter] = useState<SavedFilter | undefined>(undefined);

    // Group filters
    const groupedFilters = filters.reduce((acc, filter) => {
        const group = filter.category || "Other";
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(filter);
        return acc;
    }, {} as Record<string, SavedFilter[]>);

    const handleEdit = (filter: SavedFilter) => {
        setEditingFilter(filter);
        setIsBuilderOpen(true);
    };

    const handleAdd = () => {
        setEditingFilter(undefined);
        setIsBuilderOpen(true);
    };

    const handleSave = (filter: SavedFilter) => {
        if (editingFilter) {
            onUpdateFilter(filter);
        } else {
            onAddFilter(filter);
        }
    };

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 bg-osrs-button text-[#2c1e12] font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <span>Saved Filters</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-osrs-border">
                        <div className="text-sm text-osrs-text">
                            Enable filters to refine your search.
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-3 py-1.5 bg-osrs-accent text-white font-bold text-sm rounded hover:bg-osrs-accent/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Custom Filter
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedFilters).map(([groupName, groupFilters]) => (
                            <div key={groupName} className="space-y-2">
                                <h3 className="text-sm font-header font-bold text-osrs-text border-b border-osrs-border pb-1">
                                    {groupName}
                                </h3>
                                {groupFilters.map((filter) => (
                                    <div key={filter.id} className="flex items-center justify-between group">
                                        <label className="flex items-center gap-2 text-sm text-osrs-text font-body cursor-pointer hover:text-osrs-accent transition-colors flex-1">
                                            <input
                                                type="checkbox"
                                                checked={filter.enabled}
                                                onChange={() => onToggleFilter(filter.id)}
                                                className="w-4 h-4 cursor-pointer accent-osrs-accent"
                                            />
                                            <span title={filter.description}>{filter.name}</span>
                                        </label>


                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(filter)}
                                                className="p-1 text-gray-500 hover:text-osrs-accent"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteFilter(filter.id)}
                                                className="p-1 text-gray-500 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <FilterBuilder
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSave={handleSave}
                initialFilter={editingFilter}
            />
        </div>
    );
}
