"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import {
    SimpleCondition,
    SimpleFilterConfig,
    FILTER_FIELDS,
    FilterField,
    validateCondition,
    generateFilterName,
    simpleFilterToSavedFilter,
    parseFilterValue,
    formatFilterValue,
} from "@/lib/filters/translator";
import { SavedFilter } from "@/lib/filters/types";
import { ProcessedItem } from "@/lib/types";
import { CustomColumn } from "@/lib/columns/types";
import { evaluateFilters } from "@/lib/filters/engine";

interface SimpleFilterBuilderProps {
    items: ProcessedItem[];
    columns: CustomColumn[];
    onSave: (filter: SavedFilter) => void;
    onPreview?: (filter: SavedFilter | null) => void;
    // Controlled props
    conditions: SimpleCondition[];
    setConditions: (conditions: SimpleCondition[]) => void;
    logic: "AND" | "OR";
    setLogic: (logic: "AND" | "OR") => void;
    filterName: string;
    setFilterName: (name: string) => void;
    category: string;
    setCategory: (category: string) => void;
    description: string;
    setDescription: (description: string) => void;
    nameManuallyChanged: boolean;
    setNameManuallyChanged: (changed: boolean) => void;
}

export default function SimpleFilterBuilder({
    items,
    columns,
    onSave,
    onPreview,
    conditions,
    setConditions,
    logic,
    setLogic,
    filterName,
    setFilterName,
    category,
    setCategory,
    description,
    setDescription,
    nameManuallyChanged,
    setNameManuallyChanged,
}: SimpleFilterBuilderProps) {
    const [errors, setErrors] = useState<string[]>([]);

    // Group fields by category
    const groupedFields = useMemo(() => {
        const groups: Record<string, FilterField[]> = {};
        FILTER_FIELDS.forEach((field) => {
            if (!groups[field.group]) {
                groups[field.group] = [];
            }
            groups[field.group].push(field);
        });
        return groups;
    }, []);

    // Validate all conditions
    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        conditions.forEach((cond, idx) => {
            const result = validateCondition(cond);
            if (!result.valid && result.error) {
                errors.push(`Condition ${idx + 1}: ${result.error}`);
            }
        });
        return errors;
    }, [conditions]);

    // Check if filter is valid
    const isValid = useMemo(() => {
        return (
            conditions.length > 0 &&
            conditions.every((c) => c.field && c.operator && c.value !== "") &&
            validationErrors.length === 0
        );
    }, [conditions, validationErrors]);

    // Generate preview filter
    const previewFilter = useMemo(() => {
        if (!isValid) return null;

        try {
            const config: SimpleFilterConfig = {
                name: filterName || generateFilterName(conditions, logic),
                category,
                description,
                conditions,
                logic,
            };
            return simpleFilterToSavedFilter(config);
        } catch {
            return null;
        }
    }, [isValid, conditions, logic, filterName, category, description]);

    // Count matching items
    const matchCount = useMemo(() => {
        if (!previewFilter || items.length === 0) return 0;

        const testFilter = { ...previewFilter, enabled: true };

        // Optimization: For simple filters, we can just check if the item passes
        // But evaluateFilters is the source of truth
        let count = 0;
        for (const item of items) {
            const results = evaluateFilters(item, [testFilter], columns, items);
            if (results.length > 0) {
                count++;
            }
        }
        return count;
    }, [previewFilter, items, columns]);

    // Notify parent of preview changes
    useEffect(() => {
        if (onPreview) {
            onPreview(previewFilter);
        }
    }, [previewFilter, onPreview]);

    // Auto-generate filter name when conditions change (only if not manually changed)
    useEffect(() => {
        if (!nameManuallyChanged && conditions.length > 0 && conditions.every(c => c.field)) {
            const generated = generateFilterName(conditions, logic);
            setFilterName(generated);
        }
    }, [conditions, logic, nameManuallyChanged]);

    const handleAddCondition = () => {
        setConditions([
            ...conditions,
            { field: "", operator: ">", value: "", valueType: "number" },
        ]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index: number, fieldId: string) => {
        const field = FILTER_FIELDS.find((f) => f.id === fieldId);
        if (!field) return;

        const newConditions = [...conditions];
        newConditions[index] = {
            ...newConditions[index],
            field: fieldId,
            valueType: field.valueType,
            value: field.valueType === "boolean" ? false : "",
            operator: field.valueType === "boolean" ? "==" : ">",
        };
        setConditions(newConditions);
    };

    const handleOperatorChange = (index: number, operator: string) => {
        const newConditions = [...conditions];
        newConditions[index] = {
            ...newConditions[index],
            operator: operator as SimpleCondition["operator"],
        };
        setConditions(newConditions);
    };

    const handleValueChange = (index: number, input: string) => {
        const condition = conditions[index];
        const parsed = parseFilterValue(input, condition.valueType);

        const newConditions = [...conditions];
        newConditions[index] = {
            ...newConditions[index],
            value: parsed !== null ? parsed : input,
        };
        setConditions(newConditions);
    };

    const handleBooleanChange = (index: number, value: boolean) => {
        const newConditions = [...conditions];
        newConditions[index] = {
            ...newConditions[index],
            value,
        };
        setConditions(newConditions);
    };

    const handleSave = () => {
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        try {
            const config: SimpleFilterConfig = {
                name: filterName || generateFilterName(conditions, logic),
                category,
                description,
                conditions,
                logic,
            };
            const filter = simpleFilterToSavedFilter(config);
            onSave(filter);

            // Reset form
            setConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
            setFilterName("");
            setDescription("");
            setErrors([]);
            setNameManuallyChanged(false);
        } catch (error) {
            setErrors([error instanceof Error ? error.message : "Failed to create filter"]);
        }
    };

    const getOperatorsForType = (valueType: string) => {
        if (valueType === "boolean") {
            return [
                { value: "==", label: "is" },
                { value: "!=", label: "is not" },
            ];
        }
        return [
            { value: ">", label: ">" },
            { value: ">=", label: ">=" },
            { value: "<", label: "<" },
            { value: "<=", label: "<=" },
            { value: "==", label: "=" },
            { value: "!=", label: "≠" },
        ];
    };

    return (
        <div className="space-y-6">
            {/* Filter Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1 text-osrs-text">
                        Filter Name
                    </label>
                    <input
                        type="text"
                        value={filterName}
                        onChange={(e) => {
                            setFilterName(e.target.value);
                            setNameManuallyChanged(true); // Mark as manually changed
                        }}
                        className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                        placeholder={
                            conditions.length > 0 && conditions.every(c => c.field)
                                ? generateFilterName(conditions, logic)
                                : "e.g., High Volume and Margin"
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1 text-osrs-text">
                        Category
                    </label>
                    <select
                        aria-label="Filter category"
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
                    <label className="block text-sm font-bold mb-1 text-osrs-text">
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                        placeholder="Briefly describe what this filter does..."
                    />
                </div>
            </div>

            {/* Conditions */}
            <div className="border-t border-osrs-border pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-osrs-text text-sm">Expressions</h3>
                </div>
                <div className="space-y-4">
                    {conditions.map((condition, index) => {
                        const field = FILTER_FIELDS.find((f) => f.id === condition.field);
                        const operators = getOperatorsForType(condition.valueType);

                        return (
                            <div key={index} className="p-3 border border-osrs-border rounded bg-white/50">
                                <div className="flex items-start gap-2">
                                    {/* Field Selection */}
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            Field
                                        </label>
                                        <select
                                            aria-label={`Condition ${index + 1} field`}
                                            value={condition.field}
                                            onChange={(e) => handleFieldChange(index, e.target.value)}
                                            className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                                        >
                                            <option value="">Select field...</option>
                                            {Object.entries(groupedFields).map(([group, fields]) => (
                                                <optgroup key={group} label={group}>
                                                    {fields.map((f) => (
                                                        <option key={f.id} value={f.id}>
                                                            {f.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Operator Selection */}
                                    <div className="w-20">
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            Op
                                        </label>
                                        <select
                                            aria-label={`Condition ${index + 1} operator`}
                                            value={condition.operator}
                                            onChange={(e) => handleOperatorChange(index, e.target.value)}
                                            className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                                            disabled={!condition.field}
                                        >
                                            {operators.map((op) => (
                                                <option key={op.value} value={op.value}>
                                                    {op.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Value Input */}
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            Value
                                        </label>
                                        {condition.valueType === "boolean" ? (
                                            <select
                                                aria-label={`Condition ${index + 1} value`}
                                                value={condition.value.toString()}
                                                onChange={(e) =>
                                                    handleBooleanChange(index, e.target.value === "true")
                                                }
                                                className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                                                disabled={!condition.field}
                                            >
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={condition.value.toString()}
                                                onChange={(e) => handleValueChange(index, e.target.value)}
                                                className="w-full h-[42px] p-2 border border-osrs-border rounded bg-osrs-input text-sm focus:outline-none focus:border-osrs-accent"
                                                placeholder={
                                                    condition.valueType === "percentage"
                                                        ? "5 (for 5%)"
                                                        : condition.valueType === "currency"
                                                            ? "100000 or 100k"
                                                            : "Enter value"
                                                }
                                                disabled={!condition.field}
                                            />
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <div className="pt-5">
                                        <button
                                            onClick={() => handleRemoveCondition(index)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                            disabled={conditions.length === 1}
                                            title="Remove condition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {field && (
                                    <div className="mt-1 text-xs text-gray-500 italic">
                                        {field.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>


                {/* Logic Toggle (AND/OR) */}
                {conditions.length > 1 && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-600">Combine with:</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setLogic("AND")}
                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${logic === "AND"
                                    ? "bg-osrs-accent text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                AND
                            </button>
                            <button
                                onClick={() => setLogic("OR")}
                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${logic === "OR"
                                    ? "bg-osrs-accent text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                OR
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Condition Button */}
                <button
                    onClick={handleAddCondition}
                    className="mt-4 flex items-center gap-1 text-sm text-osrs-accent hover:underline font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Add Condition
                </button>
            </div>

            {/* Preview */}
            <div className="p-3 bg-osrs-panel border border-osrs-border rounded">
                <div className="text-sm font-bold text-osrs-text mb-1">Live Preview</div>
                {isValid && (
                    <div className="text-sm">
                        <div className="text-green-600 font-bold">
                            ✓ {matchCount} item{matchCount !== 1 ? "s" : ""} match this filter
                        </div>
                    </div>
                )}
                {!isValid && (
                    <div className="text-sm text-gray-500">
                        Complete all fields to see preview
                    </div>
                )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    <ul className="list-disc list-inside">
                        {errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className="px-4 py-2 bg-osrs-accent text-white text-sm font-bold rounded hover:bg-osrs-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Filter
                </button>
            </div>
        </div>
    );
}
