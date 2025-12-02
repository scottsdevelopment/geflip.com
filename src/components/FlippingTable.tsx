"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUp, ArrowDown, Heart } from "lucide-react";
import Tooltip from "./Tooltip";
import Pagination from "./Pagination";
import TableRow from "./TableRow";
import { evaluateColumn } from "@/lib/columns/engine";
import { TimeseriesCache } from "@/lib/timeseries/cache";
import { SavedFilter } from "@/lib/filters/types";
import { evaluateFilters } from "@/lib/filters/engine";
import { PRESET_FILTERS } from "@/lib/filters/presets";
import { BUY_ICON, SELL_ICON } from "@/lib/constants/icons";
import { useItemsStore } from "@/stores/useItemsStore";
import { useFiltersStore } from "@/stores/useFiltersStore";
import { useColumnsStore } from "@/stores/useColumnsStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useUIStore } from "@/stores/useUIStore";

import { SkeletonTableHeader, SkeletonTableBody } from "./SkeletonTable";

interface FlippingTableProps {
    filters?: SavedFilter[]; // Add filters as a prop
}

export default function FlippingTable({ filters: externalFilters }: FlippingTableProps) {
    // Zustand stores
    const items = useItemsStore(state => state.items);
    const loading = useItemsStore(state => state.loading);
    const columns = useColumnsStore(state => state.columns);
    const handleColumnReorder = useColumnsStore(state => state.handleColumnReorder);
    const handleToggleColumn = useColumnsStore(state => state.handleToggleColumn);
    const savedFilters = useFiltersStore(state => state.savedFilters);
    const isFavorite = useFavoritesStore(state => state.isFavorite);

    // UI state from store
    const searchQuery = useUIStore(state => state.searchQuery);
    const setSearchQuery = useUIStore(state => state.setSearchQuery);
    const currentPage = useUIStore(state => state.currentPage);
    const setCurrentPage = useUIStore(state => state.setCurrentPage);
    const itemsPerPage = useUIStore(state => state.itemsPerPage);
    const setItemsPerPage = useUIStore(state => state.setItemsPerPage);
    const sortKey = useUIStore(state => state.sortKey);
    const sortDirection = useUIStore(state => state.sortDirection);
    const setSort = useUIStore(state => state.setSort);

    // Local state
    const [cache] = useState(() => new TimeseriesCache());
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [filters, setFilters] = useState<SavedFilter[]>([]);

    // Use external filters if provided, otherwise use saved filters
    useEffect(() => {
        if (externalFilters) {
            setFilters(externalFilters);
        } else {
            // Combine saved filters with presets
            const savedIds = new Set(savedFilters.map(f => f.id));
            const presets = PRESET_FILTERS.filter(f => !savedIds.has(f.id));
            setFilters([...presets, ...savedFilters]);
        }
    }, [externalFilters, savedFilters]);

    // Subscribe to cache updates
    useEffect(() => {
        return cache.subscribe(() => {
            setUpdateTrigger(prev => prev + 1);
        });
    }, [cache]);

    // Pre-fetch timeseries logic
    const timeseriesIntervals = useMemo(() => {
        const intervals = new Set<string>();
        const enabledCols = columns.filter(c => c.enabled);
        const hasTimeseries = enabledCols.some(col => col.expression.includes('timeseries('));

        if (hasTimeseries) {
            enabledCols.forEach(col => {
                const matches = col.expression.matchAll(/timeseries\([^,]+,\s*['"]([^'"]+)['"]/g);
                for (const match of matches) {
                    intervals.add(match[1]);
                }
            });
        }
        return Array.from(intervals);
    }, [columns]);

    useEffect(() => {
        if (timeseriesIntervals.length > 0 && items.length > 0) {
            timeseriesIntervals.forEach(interval => {
                cache.prefetch(items.map(item => item.id), interval, 0);
            });
        }
    }, [timeseriesIntervals, items, cache]);

    // Filter and Transform Items
    const processedItems = useMemo(() => {
        if (items.length === 0) return [];

        // 1. Filter by search query first (optimization)
        let candidateItems = items;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            candidateItems = items.filter(item => item.name.toLowerCase().includes(lowerQuery));
        }

        // 2. Apply Filters & Strategies
        return candidateItems.flatMap(item => {
            // Inject favorite status for evaluation
            const itemWithFav = { ...item, favorite: isFavorite(item.id) };
            const results = evaluateFilters(itemWithFav, filters, columns, items);

            if (results.length === 0) return []; // Filtered out

            return results.map(res => {
                const displayItem = res.highlightItem || itemWithFav;

                return {
                    ...displayItem,
                    _action: res.action,
                    _sourceId: item.id
                };
            });
        });
    }, [items, searchQuery, filters, columns, updateTrigger, isFavorite]);

    // Auto-enable/disable Action column based on whether actions exist
    useEffect(() => {
        const hasActions = processedItems.some((i: any) => i._action);
        const actionColumn = columns.find(c => c.id === "action");

        if (actionColumn && actionColumn.enabled !== hasActions) {
            handleToggleColumn("action");
        }
    }, [processedItems, columns, handleToggleColumn]);


    // Sorting
    const handleSort = useCallback((key: string) => {
        setSort(key);
    }, [setSort]);

    const sortedItems = useMemo(() => {
        const sortCol = columns.find(c => c.id === sortKey);

        return [...processedItems].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortCol) {
                aVal = evaluateColumn(sortCol, { item: a, cache }, columns, cache, undefined, 0, items);
                bVal = evaluateColumn(sortCol, { item: b, cache }, columns, cache, undefined, 0, items);
            } else {
                // Handle special _action column or standard props
                if (sortKey === "_action") {
                    aVal = (a as any)._action;
                    bVal = (b as any)._action;
                } else {
                    aVal = (a as any)[sortKey];
                    bVal = (b as any)[sortKey];
                }
            }

            // Handle null/undefined values - always push to bottom
            if ((aVal === null || aVal === undefined) && (bVal === null || bVal === undefined)) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDirection === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (typeof aVal === "boolean" && typeof bVal === "boolean") {
                const aNum = aVal ? 1 : 0;
                const bNum = bVal ? 1 : 0;
                return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
            }

            if (typeof aVal === "number" && typeof bVal === "number") {
                return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });
    }, [processedItems, sortKey, sortDirection, columns, cache, items]);

    // Pagination
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedItems.slice(startIndex, endIndex);
    }, [sortedItems, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, [setCurrentPage]);

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
    }, [setItemsPerPage]);

    // Reset page if we are out of bounds (e.g. after filtering)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages, setCurrentPage]);

    const SortIcon = ({ columnId }: { columnId: string }) => {
        if (sortKey !== columnId) return null;
        return sortDirection === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };

    const enabledColumns = columns.filter(c => c.enabled);
    // Check if any visible item has an action
    const showActionColumn = processedItems.some((i: any) => i._action);

    return (
        <div>

            {/* Table and Pagination Container */}
            <div className="w-full">
                {/* Sticky Header Container for Search and Pagination */}
                <div className="z-30 pt-2 bg-osrs-bg">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 shadow-sm border border-osrs-border rounded bg-osrs-input text-osrs-text focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20 transition-all font-bold"
                        />
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedItems.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        loading={loading && items.length === 0}
                    />
                </div>

                <div className="max-h-[90vh] overflow-auto relative scrollbar-thin scrollbar-thumb-osrs-accent scrollbar-track-osrs-panel">
                    <table className="relative w-full border-separate border-spacing-0 bg-osrs-panel shadow-lg overflow-hidden border border-osrs-border">
                        <thead>
                            {loading && items.length === 0 ? (
                                <SkeletonTableHeader />
                            ) : (
                                <tr>
                                    {enabledColumns.map((col) => (
                                        <th
                                            key={col.id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData("text/plain", col.id);
                                                e.dataTransfer.effectAllowed = "move";
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = "move";
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const draggedId = e.dataTransfer.getData("text/plain");
                                                handleColumnReorder(draggedId, col.id);
                                            }}
                                            onClick={() => handleSort(col.id)}
                                            colSpan={col.id === "name" ? 2 : 1}
                                            className={`sticky left-0 top-0 z-20 p-3 h-12 bg-osrs-button text-osrs-text-dark font-header font-bold cursor-pointer border-b-2 border-osrs-border hover:bg-osrs-button-hover transition-colors relative whitespace-nowrap shadow-sm text-center ${sortKey === col.id ? "bg-osrs-button-hover" : ""}`}
                                        >
                                            <Tooltip content={col.description || ""}>
                                                <div className="flex items-center justify-center gap-1 w-full h-full">
                                                    {col.id === "low" && (
                                                        <img src={BUY_ICON} alt="Buy" className="w-3 h-3 object-contain" />
                                                    )}
                                                    {col.id === "high" && (
                                                        <img src={SELL_ICON} alt="Sell" className="w-3 h-3 object-contain" />
                                                    )}
                                                    {col.id === "favorite" ? (
                                                        <Heart size={16} className="text-osrs-primary fill-current" />
                                                    ) : (
                                                        <span>{col.name}</span>
                                                    )}
                                                    <SortIcon columnId={col.id} />
                                                </div>
                                            </Tooltip>
                                        </th>
                                    ))}
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {loading && items.length === 0 ? (
                                <SkeletonTableBody />
                            ) : paginatedItems.length === 0 && !(loading && items.length === 0) ? (
                                <tr>
                                    <td
                                        colSpan={enabledColumns.length + 1 + (showActionColumn ? 1 : 0)}
                                        className="text-center p-8 text-osrs-text bg-osrs-panel"
                                    >
                                        {searchQuery ? (
                                            <div>
                                                <p className="text-lg font-bold mb-2">No items found</p>
                                                <p className="text-sm opacity-75">No items match "{searchQuery}"</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-lg font-bold mb-2">No items found</p>
                                                <p className="text-sm opacity-75">No items match the current filters</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item: any, index) => (
                                    <TableRow
                                        key={`${item.id}-${index}`}
                                        item={item}
                                        columns={columns}
                                        cache={cache}
                                        action={item._action}
                                        showActionColumn={showActionColumn}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
