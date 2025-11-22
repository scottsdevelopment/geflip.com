"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ProcessedItem, TimeSeriesData } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import Tooltip from "./Tooltip";
import Pagination from "./Pagination";
import CustomColumnManager from "./CustomColumnManager";
import TableRow from "./TableRow";
import { CustomColumn } from "@/lib/columns/types";
import { loadColumns, saveColumns, addColumn, updateColumn, deleteColumn, toggleColumn } from "@/lib/columns/storage";
import { PRESET_COLUMNS } from "@/lib/columns/presets";
import { evaluateColumn } from "@/lib/columns/engine";
import { fetchTimeseriesForSMA } from "@/lib/api";

interface FlippingTableProps {
    items: ProcessedItem[];
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

type SortDirection = "asc" | "desc";

interface SortState {
    key: string;
    direction: SortDirection;
}

const DEFAULT_PAGE_SIZE = 50;

export default function FlippingTable({ items, searchQuery = "", onSearchChange }: FlippingTableProps) {
    const [columns, setColumns] = useState<CustomColumn[]>(PRESET_COLUMNS);
    const [sort, setSort] = useState<SortState>({ key: "profit", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [smaData, setSmaData] = useState<Record<number, TimeSeriesData[]>>({});
    const [loadingSma, setLoadingSma] = useState(false);

    // Load columns on mount
    useEffect(() => {
        loadColumns().then(setColumns);
    }, []);

    // Column Management Handlers
    const handleAddColumn = async (col: CustomColumn) => {
        const newCols = await addColumn(col);
        setColumns(newCols);
    };

    const handleUpdateColumn = async (col: CustomColumn) => {
        const newCols = await updateColumn(col.id, col);
        setColumns(newCols);
    };

    const handleDeleteColumn = async (id: string) => {
        // This will throw if dependency check fails
        const newCols = await deleteColumn(id);
        setColumns(newCols);
    };

    const handleToggleColumn = async (id: string) => {
        const newCols = await toggleColumn(id);
        setColumns(newCols);
    };

    // Sorting
    const handleSort = useCallback((key: string) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
        }));
        setCurrentPage(1);
    }, []);

    // Memoize sorted items
    const sortedItems = useMemo(() => {
        const sortCol = columns.find(c => c.id === sort.key);

        return [...items].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortCol) {
                aVal = evaluateColumn(sortCol, { item: a, rawData: {} }, columns);
                bVal = evaluateColumn(sortCol, { item: b, rawData: {} }, columns);
            } else {
                aVal = (a as any)[sort.key];
                bVal = (b as any)[sort.key];
            }

            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sort.direction === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (typeof aVal === "number" && typeof bVal === "number") {
                return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });
    }, [items, sort, columns]);

    // Pagination
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedItems.slice(startIndex, endIndex);
    }, [sortedItems, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }, []);

    // Fetch SMA data for visible items if SMA column is enabled
    useEffect(() => {
        const smaColumn = columns.find(c => c.id === "sma7" && c.enabled);
        if (!smaColumn) return;

        const idsToFetch = paginatedItems
            .map(item => item.id)
            .filter(id => !smaData[id]); // Only fetch missing

        if (idsToFetch.length === 0) return;

        setLoadingSma(true);
        fetchTimeseriesForSMA(idsToFetch).then(newData => {
            setSmaData(prev => ({ ...prev, ...newData }));
            setLoadingSma(false);
        });
    }, [paginatedItems, columns, smaData]);

    const SortIcon = ({ columnId }: { columnId: string }) => {
        if (sort.key !== columnId) return null;
        return sort.direction === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };

    if (items.length === 0) {
        return (
            <div className="text-center p-4 text-osrs-text">
                No items match the current filters.
            </div>
        );
    }

    const enabledColumns = columns.filter(c => c.enabled);

    return (
        <div>
            {/* Column Manager */}
            <CustomColumnManager
                columns={columns}
                onAddColumn={handleAddColumn}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
                onToggleColumn={handleToggleColumn}
            />

            {/* Table and Pagination Container */}
            <div className="w-full">
                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="w-full p-3 border border-osrs-border rounded bg-osrs-input text-osrs-text focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20 transition-all font-bold"
                    />
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />

                <div className="overflow-x-auto relative">
                    {loadingSma && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-200 overflow-hidden z-10">
                            <div className="animate-progress w-full h-full bg-blue-500 origin-left-right"></div>
                        </div>
                    )}
                    <table className="w-full border-separate border-spacing-0 bg-osrs-panel shadow-lg rounded-lg overflow-hidden border border-osrs-border">
                        <thead>
                            <tr>
                                {/* Fixed Image Column Header */}
                                <th className="p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold border-b-2 border-osrs-border w-10"></th>

                                {enabledColumns.map((col) => (
                                    <th
                                        key={col.id}
                                        onClick={() => handleSort(col.id)}
                                        className={`p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold cursor-pointer border-b-2 border-osrs-border hover:bg-osrs-button-hover transition-colors relative whitespace-nowrap ${sort.key === col.id ? "bg-osrs-button-hover" : ""
                                            }`}
                                    >
                                        <Tooltip content={col.description || ""}>
                                            <div className="flex items-center gap-1 w-full h-full">
                                                {col.name}
                                                <SortIcon columnId={col.id} />
                                            </div>
                                        </Tooltip>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map((item) => (
                                <TableRow
                                    key={item.id}
                                    item={item}
                                    columns={columns}
                                    rawData={{ timeseries: smaData[item.id] }}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
