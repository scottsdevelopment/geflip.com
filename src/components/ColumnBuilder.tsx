"use client";

import React, { useState, useEffect } from "react";
import { CustomColumn } from "@/lib/columns/types";
import { validateExpression } from "@/lib/columns/engine";
import { X } from "lucide-react";
import { loadColumns } from "@/lib/columns/storage";

interface ColumnBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (column: CustomColumn) => void;
    initialColumn?: CustomColumn;
    inline?: boolean;
    // Controlled props for inline mode
    name?: string;
    setName?: (name: string) => void;
    expression?: string;
    setExpression?: (expression: string) => void;
    type?: CustomColumn["type"];
    setType?: (type: CustomColumn["type"]) => void;
    format?: CustomColumn["format"];
    setFormat?: (format: CustomColumn["format"]) => void;
    group?: string;
    setGroup?: (group: string) => void;
}

export default function ColumnBuilder({
    isOpen,
    onClose,
    onSave,
    initialColumn,
    inline = false,
    name: controlledName,
    setName: controlledSetName,
    expression: controlledExpression,
    setExpression: controlledSetExpression,
    type: controlledType,
    setType: controlledSetType,
    format: controlledFormat,
    setFormat: controlledSetFormat,
    group: controlledGroup,
    setGroup: controlledSetGroup
}: ColumnBuilderProps) {
    // Internal state (used when not controlled)
    const [internalName, setInternalName] = useState("");
    const [internalExpression, setInternalExpression] = useState("");
    const [internalType, setInternalType] = useState<CustomColumn["type"]>("number");
    const [internalFormat, setInternalFormat] = useState<CustomColumn["format"]>("currency");
    const [internalGroup, setInternalGroup] = useState("Custom");
    const [error, setError] = useState<string | null>(null);
    const [otherColumns, setOtherColumns] = useState<CustomColumn[]>([]);

    // Use controlled props if provided, otherwise use internal state
    const name = controlledName !== undefined ? controlledName : internalName;
    const setName = controlledSetName || setInternalName;
    const expression = controlledExpression !== undefined ? controlledExpression : internalExpression;
    const setExpression = controlledSetExpression || setInternalExpression;
    const type = controlledType !== undefined ? controlledType : internalType;
    const setType = controlledSetType || setInternalType;
    const format = controlledFormat !== undefined ? controlledFormat : internalFormat;
    const setFormat = controlledSetFormat || setInternalFormat;
    const group = controlledGroup !== undefined ? controlledGroup : internalGroup;
    const setGroup = controlledSetGroup || setInternalGroup;

    useEffect(() => {
        loadColumns().then(cols => {
            setOtherColumns(cols.filter(c => c.id !== initialColumn?.id));
        });
    }, [initialColumn]);

    useEffect(() => {
        if (initialColumn) {
            setName(initialColumn.name);
            setExpression(initialColumn.expression);
            setType(initialColumn.type);
            setFormat(initialColumn.format);
            setGroup(initialColumn.group || "Custom");
        } else if (!inline) {
            // Only reset if not inline (to avoid wiping state on re-renders)
            setName("");
            setExpression("");
            setType("number");
            setFormat("currency");
            setGroup("Custom");
        }
        setError(null);
    }, [initialColumn, isOpen]);

    const handleSave = () => {
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (!expression.trim()) {
            setError("Expression is required");
            return;
        }
        if (!validateExpression(expression)) {
            setError("Invalid expression syntax");
            return;
        }

        const newColumn: CustomColumn = {
            id: initialColumn?.id || `custom_${Date.now()}`,
            name,
            expression,
            type,
            format: type === "number" ? format : undefined,
            group,
            enabled: true,
            description: "Custom column"
        };

        onSave(newColumn);
        if (!inline) {
            onClose();
        }
    };

    if (!isOpen && !inline) return null;

    const content = (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1 text-osrs-text">Column Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                    placeholder="e.g., High ROI"
                />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1 text-osrs-text">Expression</label>
                <textarea
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent font-mono text-sm h-24"
                    placeholder="e.g., item.roi > 10 ? 'Yes' : 'No'"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1 text-osrs-text">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                    >
                        <option value="number">Number</option>
                        <option value="string">String</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </div>

                {type === "number" && (
                    <div>
                        <label className="block text-sm font-bold mb-1 text-osrs-text">Format</label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value as any)}
                            className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                        >
                            <option value="currency">Currency (GP)</option>
                            <option value="percentage">Percentage (%)</option>
                            <option value="decimal">Number</option>
                        </select>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold mb-1 text-osrs-text">Group</label>
                <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                >
                    <option value="Custom">Custom</option>
                    <option value="Core">Core</option>
                    <option value="Volume">Volume</option>
                    <option value="Averages">Averages</option>
                    <option value="Pressure">Pressure</option>
                    <option value="Alchemy">Alchemy</option>
                    <option value="Technical">Technical</option>
                </select>
            </div>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-2">
                {!inline && (
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-osrs-accent text-white text-sm font-bold rounded hover:bg-osrs-accent/90 transition-colors"
                >
                    Save Column
                </button>
            </div>
        </div>
    );

    // If inline, render without modal wrapper
    if (inline) {
        return content;
    }

    // Otherwise, render with modal wrapper
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-osrs-button border-b border-osrs-border">
                    <h2 className="text-lg font-bold text-osrs-text-dark font-header">
                        {initialColumn ? "Edit Column" : "New Custom Column"}
                    </h2>
                    <button onClick={onClose} className="text-osrs-text-dark hover:text-red-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {content}
                </div>
            </div>
        </div>
    );
}

