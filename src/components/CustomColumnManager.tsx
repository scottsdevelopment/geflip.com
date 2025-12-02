"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Trash2, Columns } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import ColumnBuilder from "./ColumnBuilder";
import { useColumnsStore } from "@/stores/useColumnsStore";
import { useUIStore } from "@/stores/useUIStore";

export default function CustomColumnManager() {
    const columns = useColumnsStore(state => state.columns);
    const handleAddColumn = useColumnsStore(state => state.handleAddColumn);
    const handleUpdateColumn = useColumnsStore(state => state.handleUpdateColumn);
    const handleDeleteColumn = useColumnsStore(state => state.handleDeleteColumn);
    const handleToggleColumn = useColumnsStore(state => state.handleToggleColumn);

    const isExpanded = useUIStore(state => state.expandedPanels['columns'] || false);
    const togglePanel = useUIStore(state => state.togglePanel);

    const [editingColumn, setEditingColumn] = useState<CustomColumn | undefined>(undefined);

    // Controlled state for the inline builder
    const [name, setName] = useState("");
    const [expression, setExpression] = useState("");
    const [type, setType] = useState<CustomColumn["type"]>("number");
    const [format, setFormat] = useState<CustomColumn["format"]>("currency");
    const [group, setGroup] = useState("Custom");

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
        setName(col.name);
        setExpression(col.expression);
        setType(col.type);
        setFormat(col.format);
        setGroup(col.group || "Custom");
    };

    const handleDelete = async (id: string) => {
        try {
            await handleDeleteColumn(id);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete column");
        }
    };

    const handleSave = (col: CustomColumn) => {
        if (editingColumn) {
            handleUpdateColumn(col);
            setEditingColumn(undefined);
        } else {
            handleAddColumn(col);
        }
        // Reset form
        setName("");
        setExpression("");
        setType("number");
        setFormat("currency");
        setGroup("Custom");
    };

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            <button
                onClick={() => togglePanel('columns')}
                className="w-full px-4 py-3 bg-osrs-button text-osrs-text-dark font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Columns className="w-5 h-5" />
                    <span>Columns</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4">
                    {/* 33/66 Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Column Builder (33%) */}
                        <div className="lg:col-span-1 border-r border-osrs-border pr-6">
                            <div className="flex items-center justify-between pb-3 border-b border-osrs-border mb-4">
                                <h3 className="font-header font-bold text-osrs-text">Create Column</h3>
                            </div>

                            <ColumnBuilder
                                isOpen={true}
                                onClose={() => { }} // Not used in inline mode
                                onSave={handleSave}
                                initialColumn={editingColumn}
                                inline={true}
                                // Controlled props
                                name={name}
                                setName={setName}
                                expression={expression}
                                setExpression={setExpression}
                                type={type}
                                setType={setType}
                                format={format}
                                setFormat={setFormat}
                                group={group}
                                setGroup={setGroup}
                            />
                        </div>

                        {/* Right Column: Column List (66%) */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center pb-4 border-b-2 border-osrs-border mb-4">
                                <h3 className="font-header font-bold text-osrs-text">Toggle Columns</h3>
                                <div className="text-sm text-osrs-text">
                                    {columns.filter((c) => c.enabled).length} active
                                </div>
                            </div>

                            {/* 2-Column Grid for Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {Object.entries(groupedColumns).map(([groupName, groupColumns]) => (
                                    <div key={groupName} className="space-y-2">
                                        <h4 className="text-sm font-header font-bold text-osrs-text border-b border-osrs-border pb-1">
                                            {groupName}
                                        </h4>
                                        {groupColumns.map((col) => (
                                            <div
                                                key={col.id}
                                                className="flex items-center justify-between group hover:bg-white/50 p-2 rounded transition-colors"
                                            >
                                                <label className="flex items-center gap-2 text-sm text-osrs-text font-body cursor-pointer hover:text-osrs-accent transition-colors flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={col.enabled}
                                                        onChange={() => handleToggleColumn(col.id)}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
