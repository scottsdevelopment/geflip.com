"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CustomColumn } from "@/lib/columns/types";
import {
    evaluateColumn,
    findColumnReferences,
    formatColumnValue,
    getEvaluationError,
    getExpressionError,
    makeColumnId,
} from "@/lib/columns/engine";
import { X } from "lucide-react";
import { useColumnsStore } from "@/stores/useColumnsStore";
import { useItemsStore } from "@/stores/useItemsStore";

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

export const MAX_COLUMN_NAME_LENGTH = 40;

// Item properties users can reference, with player-friendly labels
const ITEM_FIELDS: { code: string; label: string; hint: string }[] = [
    { code: "item.low", label: "Instant-sell price", hint: "Latest low price (you buy around here)" },
    { code: "item.high", label: "Instant-buy price", hint: "Latest high price (you sell around here)" },
    { code: "item.limit", label: "Buy limit", hint: "GE buy limit per 4 hours" },
    { code: "item.volume", label: "Daily volume", hint: "Items traded in the last 24h" },
    { code: "item.highalch", label: "High alch", hint: "High alchemy value" },
    { code: "item.avg1h", label: "1h avg", hint: "Average high price over the last hour" },
    { code: "item.avg24h", label: "24h avg", hint: "Average high price over the last 24 hours" },
    { code: "item.highVol1h + item.lowVol1h", label: "1h volume", hint: "Items traded in the last hour" },
    { code: "item.members", label: "Members", hint: "true for members items" },
    { code: "now - item.highTime", label: "Secs since buy", hint: "Seconds since the last instant buy" },
];

const FUNCTIONS: { code: string; label: string; hint: string }[] = [
    { code: "tax(item.high)", label: "tax()", hint: "GE tax for a sale price (2%, max 5m)" },
    { code: "round()", label: "round()", hint: "Round to a whole number" },
    { code: "min(, )", label: "min()", hint: "Smaller of two values" },
    { code: "max(, )", label: "max()", hint: "Larger of two values" },
    { code: "abs()", label: "abs()", hint: "Absolute value" },
    { code: 'getItem("Nature rune", "low")', label: "getItem()", hint: "Price or field of another item" },
];

const TEMPLATES: { name: string; expression: string; format: CustomColumn["format"] }[] = [
    { name: "Profit after tax", expression: "item.high - tax(item.high) - item.low", format: "currency" },
    { name: "Profit per limit", expression: "(item.high - tax(item.high) - item.low) * item.limit", format: "compact" },
    { name: "ROI after tax", expression: "(item.high - tax(item.high) - item.low) / item.low", format: "percentage" },
    { name: "Cost of full limit", expression: "item.low * item.limit", format: "compact" },
    { name: "Alch profit", expression: 'item.highalch - item.low - getItem("Nature rune", "low")', format: "currency" },
    { name: "Price vs 24h avg", expression: "item.avg24h > 0 ? (item.high - item.avg24h) / item.avg24h : 0", format: "percentage" },
    { name: "Hourly volume", expression: "item.highVol1h + item.lowVol1h", format: "decimal" },
];

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const allColumns = useColumnsStore(state => state.columns);
    const items = useItemsStore(state => state.items);

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

    const otherColumns = useMemo(
        () => allColumns.filter(c => c.id !== initialColumn?.id && c.id !== "action" && c.id !== "favorite"),
        [allColumns, initialColumn]
    );

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialColumn, isOpen]);

    // Live validation: syntax errors and references to columns that don't exist
    const expressionProblem = useMemo(() => {
        if (!expression.trim()) return null;
        const parseError = getExpressionError(expression);
        if (parseError) return `Syntax error: ${parseError}`;
        const refs = findColumnReferences(expression);
        if (initialColumn && refs.includes(initialColumn.id)) return "A column can't reference itself.";
        const missing = refs.filter(id => !allColumns.some(c => c.id === id));
        if (missing.length > 0) return `Unknown column: ${missing.map(id => `columns.${id}`).join(", ")}`;
        if (items.length > 0) return getEvaluationError(expression, items[0]);
        return null;
    }, [expression, allColumns, initialColumn, items]);

    // Live preview on a few well-traded items
    const previewRows = useMemo(() => {
        if (!expression.trim() || expressionProblem || items.length === 0) return [];
        const samples = [...items].sort((a, b) => b.volume * b.high - a.volume * a.high).slice(0, 3);
        const draft: CustomColumn = {
            id: initialColumn?.id || "__preview__",
            name: name || "Preview",
            expression,
            type,
            format: type === "number" ? format : undefined,
            enabled: true,
        };
        return samples.map(item => ({
            name: item.name,
            value: formatColumnValue(evaluateColumn(draft, { item }, allColumns, undefined, undefined, 0, items), draft),
        }));
    }, [expression, expressionProblem, items, name, type, format, allColumns, initialColumn]);

    const insertAtCursor = (code: string) => {
        const el = textareaRef.current;
        if (!el) {
            setExpression(expression + code);
            return;
        }
        const start = el.selectionStart ?? expression.length;
        const end = el.selectionEnd ?? expression.length;
        const before = expression.slice(0, start);
        const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
        const insert = (needsSpace ? " " : "") + code;
        setExpression(before + insert + expression.slice(end));
        requestAnimationFrame(() => {
            el.focus();
            const pos = start + insert.length;
            el.setSelectionRange(pos, pos);
        });
    };

    const applyTemplate = (index: number) => {
        const template = TEMPLATES[index];
        if (!template) return;
        if (!name.trim()) setName(template.name);
        setExpression(template.expression);
        setType("number");
        setFormat(template.format);
        setError(null);
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Give the column a name.");
            return;
        }
        if (trimmedName.length > MAX_COLUMN_NAME_LENGTH) {
            setError(`Name must be ${MAX_COLUMN_NAME_LENGTH} characters or fewer.`);
            return;
        }
        if (otherColumns.some(c => c.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
            setError(`A column named "${trimmedName}" already exists.`);
            return;
        }
        if (!expression.trim()) {
            setError("Enter a formula, or pick a starter template above.");
            return;
        }
        if (expressionProblem) {
            setError(expressionProblem);
            return;
        }

        const newColumn: CustomColumn = {
            // Keep existing fields (enabled, description, isPreset) when editing
            ...initialColumn,
            id: initialColumn?.id || makeColumnId(trimmedName, allColumns.map(c => c.id)),
            name: trimmedName,
            expression: expression.trim(),
            type,
            format: type === "number" ? format : undefined,
            group,
            enabled: initialColumn ? initialColumn.enabled : true,
            description: initialColumn?.description || `Custom: ${expression.trim()}`,
        };

        setError(null);
        onSave(newColumn);
        if (!inline) {
            onClose();
        }
    };

    if (!isOpen && !inline) return null;

    const chipClass =
        "px-2 py-1 text-xs rounded border border-osrs-border bg-osrs-input text-osrs-text hover:border-osrs-accent hover:text-osrs-accent transition-colors";
    const shownError = error || expressionProblem;

    const content = (
        <div className="space-y-4">
            {!initialColumn && (
                <div>
                    <label htmlFor="column-template" className="block text-sm font-bold mb-1 text-osrs-text">
                        Start from a template <span className="font-normal opacity-75">(optional)</span>
                    </label>
                    <select
                        id="column-template"
                        value=""
                        onChange={(e) => applyTemplate(Number(e.target.value))}
                        className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                    >
                        <option value="" disabled>Choose a template…</option>
                        {TEMPLATES.map((t, i) => (
                            <option key={t.name} value={i}>{t.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label htmlFor="column-name" className="block text-sm font-bold mb-1 text-osrs-text">Column Name</label>
                <input
                    id="column-name"
                    type="text"
                    value={name}
                    maxLength={MAX_COLUMN_NAME_LENGTH}
                    onChange={(e) => { setName(e.target.value); setError(null); }}
                    className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                    placeholder="e.g., High ROI"
                />
            </div>

            <div>
                <label htmlFor="column-expression" className="block text-sm font-bold mb-1 text-osrs-text">Formula</label>
                <textarea
                    id="column-expression"
                    ref={textareaRef}
                    value={expression}
                    onChange={(e) => { setExpression(e.target.value); setError(null); }}
                    aria-invalid={!!expressionProblem}
                    aria-describedby="column-builder-help"
                    spellCheck={false}
                    className={`w-full p-2 border rounded bg-osrs-input focus:outline-none font-mono text-sm h-24 ${expressionProblem ? "border-osrs-loss" : "border-osrs-border focus:border-osrs-accent"}`}
                    placeholder="e.g., item.high - tax(item.high) - item.low"
                />

                <div id="column-builder-help" className="mt-2 space-y-2">
                    <p className="text-xs text-osrs-text opacity-80">Click to insert into the formula:</p>
                    <div className="flex flex-wrap gap-1">
                        {ITEM_FIELDS.map(f => (
                            <button key={f.code} type="button" title={`${f.hint} (${f.code})`} onClick={() => insertAtCursor(f.code)} className={chipClass}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {FUNCTIONS.map(f => (
                            <button key={f.code} type="button" title={f.hint} onClick={() => insertAtCursor(f.code)} className={`${chipClass} font-mono`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {otherColumns.length > 0 && (
                        <details className="text-xs text-osrs-text">
                            <summary className="cursor-pointer select-none opacity-80">Use another column’s value</summary>
                            <div className="flex flex-wrap gap-1 mt-1 max-h-28 overflow-y-auto">
                                {otherColumns.map(c => (
                                    <button key={c.id} type="button" title={`columns.${c.id}`} onClick={() => insertAtCursor(`columns.${c.id}`)} className={chipClass}>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>

            {previewRows.length > 0 && (
                <div className="text-sm border border-osrs-border rounded bg-osrs-input p-2" aria-live="polite">
                    <p className="text-xs font-bold text-osrs-text mb-1">Preview</p>
                    <ul className="space-y-0.5">
                        {previewRows.map(r => (
                            <li key={r.name} className="flex justify-between gap-2">
                                <span className="truncate">{r.name}</span>
                                <span className="font-mono font-bold whitespace-nowrap">{r.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="column-type" className="block text-sm font-bold mb-1 text-osrs-text">Type</label>
                    <select
                        id="column-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as CustomColumn["type"])}
                        className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                    >
                        <option value="number">Number</option>
                        <option value="string">Text</option>
                        <option value="boolean">Yes / No</option>
                    </select>
                </div>

                {type === "number" && (
                    <div>
                        <label htmlFor="column-format" className="block text-sm font-bold mb-1 text-osrs-text">Format</label>
                        <select
                            id="column-format"
                            value={format}
                            onChange={(e) => setFormat(e.target.value as CustomColumn["format"])}
                            className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                        >
                            <option value="currency">GP (1,234,567)</option>
                            <option value="compact">GP short (1.23m)</option>
                            <option value="percentage">Percent (0.05 → 5%)</option>
                            <option value="decimal">Number</option>
                            <option value="relativeTime">Time ago</option>
                        </select>
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="column-group" className="block text-sm font-bold mb-1 text-osrs-text">Group</label>
                <select
                    id="column-group"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full p-2 border border-osrs-border rounded bg-osrs-input focus:outline-none focus:border-osrs-accent"
                >
                    <option value="Custom">Custom</option>
                    <option value="Core">Core</option>
                    <option value="Profit">Profit</option>
                    <option value="Volume">Volume</option>
                    <option value="Averages">Averages</option>
                    <option value="Pressure">Pressure</option>
                    <option value="Alchemy">Alchemy</option>
                    <option value="Technical">Technical</option>
                </select>
            </div>

            {shownError && (
                <div id="column-builder-error" role="alert" className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm break-words">
                    {shownError}
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
                    {initialColumn ? "Update Column" : "Save Column"}
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
                    <button onClick={onClose} className="text-osrs-text-dark hover:text-red-600" aria-label="Close">
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
