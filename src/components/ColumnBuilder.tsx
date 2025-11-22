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
}

const AVAILABLE_FIELDS = [
    { value: "item.name", label: "Name" },
    { value: "item.low", label: "Buy Price" },
    { value: "item.high", label: "Sell Price" },
    { value: "item.profit", label: "Profit" },
    { value: "item.roi", label: "ROI %" },
    { value: "item.volume", label: "Volume (24h)" },
    { value: "item.limit", label: "Limit" },
    { value: "item.avg5m", label: "5m Avg" },
    { value: "item.avg1h", label: "1h Avg" },
    { value: "item.members", label: "Members" },
];

export default function ColumnBuilder({ isOpen, onClose, onSave, initialColumn }: ColumnBuilderProps) {
    const [name, setName] = useState("");
    const [expression, setExpression] = useState("");
    const [type, setType] = useState<CustomColumn["type"]>("number");
    const [format, setFormat] = useState<CustomColumn["format"]>("currency");
    const [group, setGroup] = useState("Custom");
    const [error, setError] = useState<string | null>(null);
    const [otherColumns, setOtherColumns] = useState<CustomColumn[]>([]);

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
        } else {
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-osrs-button border-b border-osrs-border">
                    <h2 className="text-lg font-bold text-[#2c1e12] font-header">
                        {initialColumn ? "Edit Column" : "New Custom Column"}
                    </h2>
                    <button onClick={onClose} className="text-[#2c1e12] hover:text-red-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
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
                        <label className="block text-sm font-bold mb-1 text-osrs-text">
                            Expression
                            <span className="ml-2 text-xs font-normal text-gray-500">(Use 'item' variable)</span>
                        </label>
                        <textarea
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent font-mono text-sm h-24"
                            placeholder="e.g., item.roi > 10 ? 'Yes' : 'No'"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Available: item.low, item.high, item.profit, item.roi, item.volume, sma(data, period)
                        </p>
                        <div className="mt-2">
                            <p className="text-xs font-bold text-osrs-text mb-1">Insert Field:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {AVAILABLE_FIELDS.map(field => (
                                    <button
                                        key={field.value}
                                        onClick={() => setExpression(prev => prev + field.value)}
                                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                                    >
                                        {field.label}
                                    </button>
                                ))}
                                {otherColumns.map(col => (
                                    <button
                                        key={col.id}
                                        onClick={() => setExpression(prev => prev + `columns.${col.id}`)}
                                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded text-blue-700 border border-blue-200"
                                        title={col.description}
                                    >
                                        {col.name}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                                    <option value="decimal">Decimal</option>
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
                </div>

                <div className="p-4 border-t border-osrs-border flex justify-end gap-2 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-osrs-accent text-white text-sm font-bold rounded hover:bg-osrs-accent/90 transition-colors"
                    >
                        Save Column
                    </button>
                </div>
            </div>
        </div>
    );
}
