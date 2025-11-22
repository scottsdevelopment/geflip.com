"use client";

import React, { useState, useEffect } from "react";
import { SavedFilter } from "@/lib/filters/types";
import { validateRule } from "@/lib/filters/engine";
import { X, Plus, Trash2 } from "lucide-react";
import { RulesLogic } from "json-logic-js";
import { CustomColumn } from "@/lib/columns/types";
import { loadColumns } from "@/lib/columns/storage";

interface FilterBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (filter: SavedFilter) => void;
    initialFilter?: SavedFilter;
}

interface Condition {
    field: string;
    operator: string;
    value: string | number;
}

const OPERATORS = [
    { value: "==", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: ">", label: "Greater Than" },
    { value: ">=", label: "Greater or Equal" },
    { value: "<", label: "Less Than" },
    { value: "<=", label: "Less or Equal" },
];

export default function FilterBuilder({ isOpen, onClose, onSave, initialFilter }: FilterBuilderProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Custom");
    const [conditions, setConditions] = useState<Condition[]>([{ field: "columns.profit", operator: ">=", value: 0 }]);
    const [advancedMode, setAdvancedMode] = useState(false);
    const [rawJson, setRawJson] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [allColumns, setAllColumns] = useState<CustomColumn[]>([]);

    useEffect(() => {
        loadColumns().then(cols => {
            setAllColumns(cols);
        });
    }, []);

    const groupedColumns = allColumns.reduce((acc, col) => {
        const group = col.group || "Other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(col);
        return acc;
    }, {} as Record<string, CustomColumn[]>);

    useEffect(() => {
        if (initialFilter) {
            setName(initialFilter.name);
            setCategory(initialFilter.category);
            setRawJson(JSON.stringify(initialFilter.rule, null, 2));

            try {
                const rule = initialFilter.rule as any;
                const newConditions: Condition[] = [];

                const parseCondition = (op: string, args: any[]) => {
                    const fieldVar = args[0]?.var;
                    const value = args[1];

                    if (fieldVar && value !== undefined) {
                        let mappedField = fieldVar;
                        if (fieldVar.startsWith("item.")) {
                            const propName = fieldVar.replace("item.", "");
                            const col = allColumns.find(c => c.id === propName || c.expression === fieldVar);
                            if (col) {
                                mappedField = `columns.${col.id}`;
                            }
                        }

                        newConditions.push({ field: mappedField, operator: op, value: String(value) });
                    }
                };

                if (rule["and"]) {
                    rule["and"].forEach((cond: any) => {
                        const op = Object.keys(cond)[0];
                        parseCondition(op, cond[op]);
                    });
                } else {
                    const op = Object.keys(rule)[0];
                    parseCondition(op, rule[op]);
                }

                if (newConditions.length > 0) {
                    setConditions(newConditions);
                    setAdvancedMode(false);
                } else {
                    setAdvancedMode(true);
                }
            } catch (e) {
                setAdvancedMode(true);
            }

        } else {
            setName("");
            setCategory("Custom");
            setConditions([{ field: "columns.profit", operator: ">=", value: 0 }]);
            setRawJson("");
            setAdvancedMode(false);
        }
        setError(null);
    }, [initialFilter, isOpen, allColumns]);

    useEffect(() => {
        if (advancedMode && !rawJson) {
            const logicConditions = conditions.map(c => {
                const val = (c.value === "true" || c.value === "false")
                    ? (c.value === "true")
                    : !isNaN(Number(c.value)) ? Number(c.value) : c.value;
                return { [c.operator]: [{ "var": c.field }, val] } as RulesLogic;
            });

            let rule: RulesLogic;
            if (logicConditions.length === 1) {
                rule = logicConditions[0];
            } else {
                rule = { "and": logicConditions } as RulesLogic;
            }
            setRawJson(JSON.stringify(rule, null, 2));
        }
    }, [advancedMode]);

    const handleAddCondition = () => {
        setConditions([...conditions, { field: "columns.profit", operator: ">=", value: 0 }]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const updateCondition = (index: number, field: keyof Condition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setConditions(newConditions);
    };

    const handleSave = () => {
        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        let rule: RulesLogic;

        if (advancedMode) {
            try {
                rule = JSON.parse(rawJson);
            } catch (e) {
                setError("Invalid JSON");
                return;
            }
        } else {
            const logicConditions = conditions.map(c => {
                const val = (c.value === "true" || c.value === "false")
                    ? (c.value === "true")
                    : !isNaN(Number(c.value)) ? Number(c.value) : c.value;
                return { [c.operator]: [{ "var": c.field }, val] } as RulesLogic;
            });

            if (logicConditions.length === 1) {
                rule = logicConditions[0];
            } else {
                rule = { "and": logicConditions } as RulesLogic;
            }
        }

        if (!validateRule(rule)) {
            setError("Invalid rule structure");
            return;
        }

        const newFilter: SavedFilter = {
            id: initialFilter?.id || `filter_${Date.now()}`,
            name,
            rule,
            enabled: true,
            category,
            description: "Custom filter"
        };

        onSave(newFilter);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-osrs-button border-b border-osrs-border">
                    <h2 className="text-lg font-bold text-[#2c1e12] font-header">
                        {initialFilter ? "Edit Filter" : "New Custom Filter"}
                    </h2>
                    <button onClick={onClose} className="text-[#2c1e12] hover:text-red-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-osrs-text">Filter Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                                placeholder="e.g., High Profit"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-osrs-text">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                            >
                                <option value="Custom">Custom</option>
                                <option value="Price">Price</option>
                                <option value="Profit">Profit</option>
                                <option value="Volume">Volume</option>
                                <option value="Strategy">Strategy</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-osrs-border pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-osrs-text">Conditions (AND)</h3>
                            <button
                                onClick={() => setAdvancedMode(!advancedMode)}
                                className="text-xs text-osrs-accent hover:underline"
                            >
                                {advancedMode ? "Switch to Simple Builder" : "Switch to Advanced JSON"}
                            </button>
                        </div>

                        {advancedMode ? (
                            <div className="space-y-2">
                                <textarea
                                    value={rawJson}
                                    onChange={(e) => setRawJson(e.target.value)}
                                    className="w-full h-48 p-2 border border-osrs-border rounded bg-osrs-input font-mono text-sm"
                                    placeholder='{"and": [{">": [{"var": "columns.profit"}, 1000]}]}'
                                />
                                <p className="text-xs text-gray-500">
                                    Use <code>{"{\"var\": \"columns.COLUMN_ID\"}"}</code> to reference columns.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {conditions.map((condition, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <select
                                            value={condition.field}
                                            onChange={(e) => updateCondition(index, "field", e.target.value)}
                                            className="flex-1 p-2 border border-osrs-border rounded bg-osrs-input"
                                        >
                                            {Object.entries(groupedColumns).map(([group, cols]) => (
                                                <optgroup key={group} label={group}>
                                                    {cols.map(col => (
                                                        <option key={col.id} value={`columns.${col.id}`}>
                                                            {col.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <select
                                            value={condition.operator}
                                            onChange={(e) => updateCondition(index, "operator", e.target.value)}
                                            className="w-32 p-2 border border-osrs-border rounded bg-osrs-input"
                                        >
                                            {OPERATORS.map(op => (
                                                <option key={op.value} value={op.value}>{op.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={condition.value}
                                            onChange={(e) => updateCondition(index, "value", e.target.value)}
                                            className="w-32 p-2 border border-osrs-border rounded bg-osrs-input"
                                            placeholder="Value"
                                        />
                                        <button
                                            onClick={() => handleRemoveCondition(index)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                                            disabled={conditions.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddCondition}
                                    className="flex items-center gap-1 text-sm text-osrs-accent hover:underline font-bold"
                                >
                                    <Plus className="w-4 h-4" /> Add Condition
                                </button>
                            </div>
                        )}
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
                        Save Filter
                    </button>
                </div>
            </div>
        </div>
    );
}
