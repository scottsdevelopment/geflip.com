"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2 } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import ColumnBuilder from "./ColumnBuilder";

interface CustomColumnManagerProps {
    columns: CustomColumn[];
    onUpdateColumn: (column: CustomColumn) => void;
    onAddColumn: (column: CustomColumn) => void;
    onDeleteColumn: (id: string) => Promise<void>;
    onToggleColumn: (id: string) => void;
}

export default function CustomColumnManager({
    columns,
    onUpdateColumn,
    onAddColumn,
    onDeleteColumn,
    onToggleColumn,
}: CustomColumnManagerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<CustomColumn | undefined>(undefined);

    const groupedColumns = columns.reduce((acc, col) => {
        const group = col.group || "Other";
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(col);
        return acc;
    }, {} as Record<string, CustomColumn[]>);

    const handleEdit = (col: CustomColumn) => {
        setEditingColumn(col);
        setIsBuilderOpen(true);
    };

    const handleAdd = () => {
        setEditingColumn(undefined);
        setIsBuilderOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await onDeleteColumn(id);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete column");
        }
    };

    const handleSave = (col: CustomColumn) => {
        if (editingColumn) {
            onUpdateColumn(col);
        } else {
            onAddColumn(col);
        }
    };

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 bg-osrs-button text-[#2c1e12] font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <span>Manage Columns</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-osrs-border">
                        <div className="text-sm text-osrs-text">
                            Toggle columns to show/hide them in the table.
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-3 py-1.5 bg-osrs-accent text-white font-bold text-sm rounded hover:bg-osrs-accent/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Custom Column
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Object.entries(groupedColumns).map(([groupName, groupColumns]) => (
                            <div key={groupName} className="space-y-2">
                                <h3 className="text-sm font-header font-bold text-osrs-text border-b border-osrs-border pb-1">
                                    {groupName}
                                </h3>
                                {groupColumns.map((col) => (
                                    <div key={col.id} className="flex items-center justify-between group">
                                        <label className="flex items-center gap-2 text-sm text-osrs-text font-body cursor-pointer hover:text-osrs-accent transition-colors flex-1">
                                            <input
                                                type="checkbox"
                                                checked={col.enabled}
                                                onChange={() => onToggleColumn(col.id)}
                                                className="w-4 h-4 cursor-pointer accent-osrs-accent"
                                            />
                                            <span title={col.description}>{col.name}</span>
                                        </label>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(col)}
                                                className="p-1 text-gray-500 hover:text-osrs-accent"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(col.id)}
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

            <ColumnBuilder
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSave={handleSave}
                initialColumn={editingColumn}
            />
        </div>
    );
}
