"use client";

import React, { useState, useEffect } from "react";
import { SavedFilter, FilterExpression } from "@/lib/filters/types";
import { validateExpressionString } from "@/lib/filters/engine";
import { X, Plus, Trash2, HelpCircle } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import { loadColumns } from "@/lib/columns/storage";
import { ProcessedItem } from "@/lib/types";
import { evaluateFilters } from "@/lib/filters/engine";

interface FilterBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (filter: SavedFilter) => void;
    initialFilter?: SavedFilter;
    inline?: boolean;
    initialCode?: string;
    // Controlled props
    filterName: string;
    setFilterName: (name: string) => void;
    category: string;
    setCategory: (category: string) => void;
    description: string;
    setDescription: (description: string) => void;
    onCodeChange?: (code: string) => void;
    onPreview?: (filter: SavedFilter | null) => void;
    items?: ProcessedItem[];
    columns?: CustomColumn[];
}

export default function FilterBuilder({
    isOpen,
    onClose,
    onSave,
    initialFilter,
    inline = false,
    initialCode = "",
    filterName,
    setFilterName,
    category,
    setCategory,
    description,
    setDescription,
    onCodeChange,
    onPreview,
    items = [],
    columns = []
}: FilterBuilderProps) {
    // We still keep expressions internal, but sync with initialCode and report changes
    const [expressions, setExpressions] = useState<FilterExpression[]>([{ code: "" }]);
    const [independent, setIndependent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allColumns, setAllColumns] = useState<CustomColumn[]>([]);
    const isInternalUpdate = React.useRef(false);

    useEffect(() => {
        loadColumns().then(setAllColumns);
    }, []);

    useEffect(() => {
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }

        if (initialFilter) {
            setIndependent(initialFilter.independent || false);
            if (initialFilter.expressions) {
                setExpressions(initialFilter.expressions);
            } else {
                setExpressions([{ code: "" }]);
            }
        } else {
            setIndependent(false);
            if (initialCode) {
                setExpressions([{ code: initialCode }]);
            } else if (!inline) {
                // Only reset if not inline (to avoid wiping state on re-renders if parent doesn't pass initialCode correctly)
                setExpressions([{ code: "" }]);
            }
        }
        setError(null);
    }, [initialFilter, isOpen, initialCode, inline]);


    // Report code changes and trigger preview (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const code = expressions.map(e => e.code).join(" and ");
            if (onCodeChange) {
                onCodeChange(code);
            }

            if (onPreview) {
                // Create a temporary filter for preview
                const tempFilter: SavedFilter = {
                    id: "preview",
                    name: filterName,
                    category: category,
                    description: description,
                    expressions: expressions,
                    enabled: true,
                    independent: independent
                };
                onPreview(tempFilter);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [expressions, filterName, category, description, independent, onCodeChange, onPreview]);

    // Count matching items for internal preview (debounced)
    const [matchCount, setMatchCount] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!items.length) {
                setMatchCount(0);
                return;
            }

            // Create temporary filter
            const tempFilter: SavedFilter = {
                id: "preview",
                name: filterName,
                category: category,
                description: description,
                expressions: expressions,
                enabled: true,
                independent: independent
            };

            // Filter valid expressions
            const validExpressions = expressions.filter(e => e.code.trim() && validateExpressionString(e.code));
            if (validExpressions.length === 0) {
                setMatchCount(0);
                return;
            }

            // Use only valid expressions for counting
            const filterToTest = { ...tempFilter, expressions: validExpressions };

            try {
                const count = items.filter((item) => {
                    const results = evaluateFilters(item, [filterToTest], columns, items);
                    return results.length > 0;
                }).length;
                setMatchCount(count);
            } catch (e) {
                console.error("Error evaluating filter preview:", e);
                setMatchCount(0);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [expressions, items, columns, filterName, category, description, independent]);

    const handleAddExpression = () => {
        isInternalUpdate.current = true;
        setExpressions([...expressions, { code: "" }]);
    };

    const handleRemoveExpression = (index: number) => {
        isInternalUpdate.current = true;
        setExpressions(expressions.filter((_, i) => i !== index));
    };

    const updateExpression = (index: number, field: keyof FilterExpression, value: string) => {
        isInternalUpdate.current = true;
        const newExpressions = [...expressions];
        newExpressions[index] = { ...newExpressions[index], [field]: value };
        setExpressions(newExpressions);
    };

    const handleSave = () => {
        if (!filterName.trim()) {
            setError("Name is required");
            return;
        }

        // Validate all expressions
        for (let i = 0; i < expressions.length; i++) {
            const expr = expressions[i];
            if (!expr.code.trim()) {
                setError(`Expression #${i + 1} cannot be empty`);
                return;
            }
            if (!validateExpressionString(expr.code)) {
                setError(`Invalid syntax in Expression #${i + 1}`);
                return;
            }
            if (expr.highlightItem && !validateExpressionString(expr.highlightItem)) {
                setError(`Invalid syntax in Highlight Item for Expression #${i + 1}`);
                return;
            }
        }

        const newFilter: SavedFilter = {
            id: initialFilter?.id || `filter_${Date.now()}`,
            name: filterName,
            expressions,
            enabled: true,
            category,
            description,
            independent
        };

        onSave(newFilter);
        onClose();
    };

    if (!isOpen && !inline) return null;

    const content = (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1 text-osrs-text">Filter Name</label>
                    <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                        placeholder="e.g., High Volume and Margin"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 text-osrs-text">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-[42px] px-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                    >
                        <option value="Custom">Custom</option>
                        <option value="Price">Price</option>
                        <option value="Profit">Profit</option>
                        <option value="Volume">Volume</option>
                        <option value="Strategy">Strategy</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-1 text-osrs-text">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                        placeholder="Briefly describe what this filter does..."
                    />
                </div>
                {!inline && (
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="independent-mode"
                            checked={independent}
                            onChange={(e) => setIndependent(e.target.checked)}
                            className="w-4 h-4 accent-osrs-accent"
                        />
                        <label htmlFor="independent-mode" className="text-sm font-bold text-osrs-text cursor-pointer">
                            Independent Mode (Results are added to the table regardless of other filters)
                        </label>
                    </div>
                )}
            </div>

            <div className="border-t border-osrs-border pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-osrs-text text-sm">Expressions</h3>
                </div>

                <div className="space-y-4">
                    {expressions.map((expr, index) => (
                        <div key={index} className="p-3 border border-osrs-border rounded bg-white/50 relative">
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => handleRemoveExpression(index)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    disabled={expressions.length === 1}
                                    title="Remove Expression"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold mb-1 text-gray-600">Condition (JS Code)</label>
                                    <textarea
                                        value={expr.code}
                                        onChange={(e) => updateExpression(index, "code", e.target.value)}
                                        className="w-full h-20 p-2 border border-osrs-border rounded bg-osrs-input font-mono text-sm focus:outline-none focus:border-osrs-accent"
                                        placeholder="e.g. columns.profit > 1000 and item.members"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-gray-600">Action Label (Optional)</label>
                                        <input
                                            type="text"
                                            value={expr.action || ""}
                                            onChange={(e) => updateExpression(index, "action", e.target.value)}
                                            className="w-full p-2 border border-osrs-border rounded bg-osrs-input text-sm"
                                            placeholder="e.g. Flip"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1 text-gray-600">Highlight Item (Optional)</label>
                                        <input
                                            type="text"
                                            value={expr.highlightItem || ""}
                                            onChange={(e) => updateExpression(index, "highlightItem", e.target.value)}
                                            className="w-full p-2 border border-osrs-border rounded bg-osrs-input text-sm font-mono"
                                            placeholder="Expression or ID (e.g. getItem(123))"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAddExpression}
                    className="mt-4 flex items-center gap-1 text-sm text-osrs-accent hover:underline font-bold"
                >
                    <Plus className="w-4 h-4" /> Add Another Expression
                </button>
            </div>

            {/* Preview */}
            <div className="p-3 bg-osrs-panel border border-osrs-border rounded">
                <div className="text-sm font-bold text-osrs-text mb-1">Live Preview</div>
                {expressions.some(e => e.code.trim()) ? (
                    <div className="text-sm">
                        <div className="text-green-600 font-bold">
                            ✓ {matchCount} item{matchCount !== 1 ? "s" : ""} match this filter
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        Enter an expression to see preview
                    </div>
                )}
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
                    Save Filter
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
            <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 bg-osrs-button border-b border-osrs-border">
                    <h2 className="text-lg font-bold text-osrs-text-dark font-header">
                        {initialFilter ? "Edit Filter" : "New Custom Filter"}
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
