"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Trash2, Code, Sparkles, Filter } from "lucide-react";
import { SavedFilter } from "@/lib/filters/types";
import FilterBuilder from "./FilterBuilder";
import SimpleFilterBuilder from "./SimpleFilterBuilder";
import { translateSimpleFilter, SimpleCondition, parseAdvancedFilter } from "@/lib/filters/translator";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { useUIStore } from "@/stores/useUIStore";
import { useItemsStore } from "@/stores/useItemsStore";
import { useColumnsStore } from "@/stores/useColumnsStore";

interface SavedFilterManagerProps {
    onPreviewFilter?: (filter: SavedFilter | null) => void;
}

export default function SavedFilterManager({
    onPreviewFilter,
}: SavedFilterManagerProps) {
    const filters = useFiltersStore(state => state.savedFilters);
    const handleAddFilter = useFiltersStore(state => state.handleAddFilter);
    const handleUpdateFilter = useFiltersStore(state => state.handleUpdateFilter);
    const handleDeleteFilter = useFiltersStore(state => state.handleDeleteFilter);
    const handleToggleFilter = useFiltersStore(state => state.handleToggleFilter);

    const items = useItemsStore(state => state.items);
    const columns = useColumnsStore(state => state.columns);

    const isExpanded = useUIStore(state => state.expandedPanels['filters'] || false);
    const togglePanel = useUIStore(state => state.togglePanel);

    const [editingFilter, setEditingFilter] = useState<SavedFilter | undefined>(undefined);
    const [builderMode, setBuilderMode] = useState<"simple" | "advanced">("simple");

    // Shared state
    const [filterName, setFilterName] = useState("");
    const [category, setCategory] = useState("Custom");
    const [description, setDescription] = useState("");
    const [translationWarning, setTranslationWarning] = useState<string | null>(null);

    // Simple builder state
    const [simpleConditions, setSimpleConditions] = useState<SimpleCondition[]>([
        { field: "", operator: ">", value: "", valueType: "number" }
    ]);
    const [logic, setLogic] = useState<"AND" | "OR">("AND");
    const [nameManuallyChanged, setNameManuallyChanged] = useState(false);

    // Advanced builder state
    const [advancedCode, setAdvancedCode] = useState<string>("");

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
        setFilterName(filter.name);
        setCategory(filter.category);
        setDescription(filter.description || "");

        // If it has expressions, try to load into advanced mode
        if (filter.expressions && filter.expressions.length > 0) {
            const code = filter.expressions.map(e => e.code).join(" and ");
            setAdvancedCode(code);

            // Also try to parse into simple conditions so we can switch back if needed
            const parsed = parseAdvancedFilter(code);
            if (parsed && parsed.conditions.length > 0) {
                setSimpleConditions(parsed.conditions);
                setLogic(parsed.logic);

                if (parsed.failedCount > 0) {
                    setTranslationWarning(`${parsed.failedCount} advanced expression(s) could not be translated to simple mode.`);
                } else {
                    setTranslationWarning(null);
                }

                // If successfully parsed (at least partially), default to simple mode for better UX
                setBuilderMode("simple");
            } else {
                // If complex (all failed), force advanced mode and reset simple conditions
                // But only if we actually have code to parse!
                if (code.trim()) {
                    setSimpleConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
                    setBuilderMode("advanced");
                    setTranslationWarning(null);
                } else {
                    // Empty code = empty simple mode
                    setSimpleConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
                    setBuilderMode("simple");
                }
            }
        } else {
            // No expressions, default to simple
            setBuilderMode("simple");
        }

        // Mark name as manually changed so it doesn't get overwritten by auto-generation
        setNameManuallyChanged(true);
    };

    const handleToggleMode = () => {
        if (builderMode === "simple") {
            // Convert simple to advanced
            try {
                const validConditions = simpleConditions.filter(c => c.field && c.value !== "");
                if (validConditions.length > 0) {
                    const expression = translateSimpleFilter(validConditions, logic);
                    setAdvancedCode(expression.code);
                }
            } catch (error) {
                console.error("Error converting to advanced:", error);
            }
            setBuilderMode("advanced");
        } else {
            // Switch to simple - try to parse advanced code back
            if (advancedCode) {
                const parsed = parseAdvancedFilter(advancedCode);
                if (parsed && parsed.conditions.length > 0) {
                    setSimpleConditions(parsed.conditions);
                    setLogic(parsed.logic);
                    if (parsed.failedCount > 0) {
                        setTranslationWarning(`${parsed.failedCount} advanced expression(s) could not be translated to simple mode.`);
                    } else {
                        setTranslationWarning(null);
                    }
                } else {
                    // If parsing fails completely, check if it was just empty
                    if (!advancedCode.trim()) {
                        setSimpleConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
                        setTranslationWarning(null);
                    } else {
                        setSimpleConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
                        setTranslationWarning("Could not translate advanced filter to simple mode.");
                    }
                }
            }
            setBuilderMode("simple");
        }
    };

    const handleSaveAdvanced = (filter: SavedFilter) => {
        // Ensure shared state is used if not provided in filter (though FilterBuilder should provide it)
        const finalFilter = {
            ...filter,
            name: filterName || filter.name,
            category: category || filter.category,
            description: description || filter.description
        };

        if (editingFilter) {
            handleUpdateFilter(finalFilter);
            setEditingFilter(undefined);
        } else {
            handleAddFilter(finalFilter);
        }
        // Reset state
        resetState();
    };

    const handleSaveSimple = (filter: SavedFilter) => {
        handleAddFilter(filter);
        resetState();
    };

    const handleCancelEdit = () => {
        setEditingFilter(undefined);
        resetState();
    };

    const resetState = () => {
        setFilterName("");
        setCategory("Custom");
        setDescription("");
        setSimpleConditions([{ field: "", operator: ">", value: "", valueType: "number" }]);
        setLogic("AND");
        setNameManuallyChanged(false);
        setAdvancedCode("");
        setTranslationWarning(null);
    };

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <button
                onClick={() => togglePanel('filters')}
                className="w-full px-4 py-3 bg-osrs-button text-osrs-text-dark font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {/* Content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="p-4">
                    {/* 33/66 Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Filter Builder (33%) */}
                        <div className="lg:col-span-1 border-r border-osrs-border pr-6">
                            {/* Mode Toggle */}
                            <div className="flex items-center justify-between pb-3 border-b border-osrs-border mb-4">
                                <h3 className="font-header font-bold text-osrs-text">Create Filter</h3>
                                <button
                                    onClick={handleToggleMode}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    title={builderMode === "simple" ? "Switch to Advanced (Code)" : "Switch to Simple (Visual)"}
                                >
                                    {builderMode === "simple" ? (
                                        <>
                                            <Code className="w-3 h-3" />
                                            Advanced
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3" />
                                            Simple
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Translation Warning */}
                            {translationWarning && builderMode === "simple" && (
                                <div className="mb-4 p-3 bg-osrs-input border border-osrs-accent text-osrs-primary rounded text-sm font-bold">
                                    {translationWarning}
                                </div>
                            )}

                            {/* Builder Content */}
                            {builderMode === "simple" ? (
                                <SimpleFilterBuilder
                                    items={items}
                                    columns={columns}
                                    onSave={handleSaveSimple}
                                    onPreview={onPreviewFilter}
                                    // Controlled props
                                    conditions={simpleConditions}
                                    setConditions={setSimpleConditions}
                                    logic={logic}
                                    setLogic={setLogic}
                                    filterName={filterName}
                                    setFilterName={setFilterName}
                                    category={category}
                                    setCategory={setCategory}
                                    description={description}
                                    setDescription={setDescription}
                                    nameManuallyChanged={nameManuallyChanged}
                                    setNameManuallyChanged={setNameManuallyChanged}
                                />
                            ) : (
                                <FilterBuilder
                                    isOpen={true}
                                    onClose={() => { }} // Not used in inline mode
                                    onSave={handleSaveAdvanced}
                                    initialFilter={editingFilter}
                                    inline={true}
                                    initialCode={advancedCode}
                                    // Controlled props
                                    filterName={filterName}
                                    setFilterName={setFilterName}
                                    category={category}
                                    setCategory={setCategory}
                                    description={description}
                                    setDescription={setDescription}
                                    onCodeChange={setAdvancedCode}
                                    onPreview={onPreviewFilter}
                                    items={items}
                                    columns={columns}
                                />
                            )}
                        </div>

                        {/* Right Column: Filter List (66%) */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center pb-4 border-b-2 border-osrs-border mb-4">
                                <h3 className="font-header font-bold text-osrs-text">Apply Filters</h3>
                                <div className="text-sm text-osrs-text">
                                    {filters.filter((f) => f.enabled).length} active
                                </div>
                            </div>

                            {/* 2-Column Grid for Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {Object.entries(groupedFilters).map(([groupName, groupFilters]) => (
                                    <div key={groupName} className="space-y-2">
                                        <h4 className="text-sm font-header font-bold text-osrs-text border-b border-osrs-border pb-1">
                                            {groupName}
                                        </h4>
                                        {groupFilters.map((filter) => (
                                            <div
                                                key={filter.id}
                                                className="flex items-center justify-between group hover:bg-white/50 p-2 rounded transition-colors"
                                            >
                                                <label className="flex items-center gap-2 text-sm text-osrs-text font-body cursor-pointer hover:text-osrs-accent transition-colors flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={filter.enabled}
                                                        onChange={() => handleToggleFilter(filter.id)}
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
                                                        onClick={() => handleDeleteFilter(filter.id)}
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
