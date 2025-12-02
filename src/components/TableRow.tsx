"use client";

import React, { useState, memo, useEffect } from "react";
import Link from "next/link";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { generateSlug } from "@/lib/slug";
import { ImageOff } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import { evaluateColumn, formatColumnValue } from "@/lib/columns/engine";
import { TimeseriesCache } from "@/lib/timeseries/cache";
import { Spinner } from "./Spinner";
import { NON_MEMBER_ICON, MEMBER_ICON } from "@/lib/constants/icons";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { Heart } from "lucide-react";
import { getCurrencyClass } from "@/lib/currency";

interface ItemImageProps {
    name: string;
}

const ItemImage = memo(({ name }: ItemImageProps) => {
    const [error, setError] = useState(false);
    const src = getItemImageUrl(name);

    if (error) {
        return (
            <div className="w-6 h-6 flex items-center justify-center bg-osrs-bg rounded-full" title={name}>
                <ImageOff className="w-4 h-4 text-osrs-primary opacity-60" />
            </div>
        );
    }

    return (
        <img
            className="w-6 h-6 inline-block align-middle object-contain"
            src={src}
            alt={name}
            onError={() => setError(true)}
        />
    );
});

ItemImage.displayName = "ItemImage";

export interface TableRowProps {
    item: ProcessedItem;
    columns: CustomColumn[];
    cache?: TimeseriesCache;
    action?: string;
    showActionColumn?: boolean;
}

const TableRow = memo(({ item, columns, cache, action, showActionColumn }: TableRowProps) => {
    const enabledColumns = React.useMemo(() => columns.filter(c => c.enabled), [columns]);
    const [loadingColumns, setLoadingColumns] = useState<Set<string>>(new Set());
    const [updateTrigger, setUpdateTrigger] = useState(0);
    // Subscribe to this specific item's favorite status
    const isFavoriteItem = useFavoritesStore(state => state.isFavorite(item.id));
    const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);

    // Subscribe to this item's timeseries updates
    useEffect(() => {
        if (!cache) return;

        return cache.subscribeToItem(item.id, (interval, data) => {
            // When data for this item arrives, trigger re-evaluation
            const affectedCols = columns.filter(col =>
                col.expression.includes(`timeseries(item.id, '${interval}')`)
            );

            if (affectedCols.length > 0) {
                // Remove loading state for affected columns
                setLoadingColumns(prev => {
                    const next = new Set(prev);
                    affectedCols.forEach(col => next.delete(col.id));
                    return next;
                });

                // Trigger re-render
                setUpdateTrigger(prev => prev + 1);
            }
        });
    }, [item.id, cache, columns]);

    // Check which columns are loading on mount and when columns change
    useEffect(() => {
        if (!cache) return;

        const checkLoading = async () => {
            const timeseriesCols = enabledColumns.filter(c =>
                c.expression.includes('timeseries(')
            );

            const loading = new Set<string>();

            for (const col of timeseriesCols) {
                // Extract interval from expression
                const match = col.expression.match(/timeseries\([^,]+,\s*['"]([^'"]+)['"]/);
                if (match) {
                    const interval = match[1];
                    const data = await cache.get(item.id, interval);

                    if (data === null) {
                        // Mark as loading - pre-fetch from FlippingTable will request it
                        loading.add(col.id);
                    }
                }
            }

            setLoadingColumns(loading);
        };

        checkLoading();
    }, [item.id, cache, enabledColumns]);

    return (
        <tr className="even:bg-osrs-table-even hover:bg-osrs-table-hover transition-colors">
            {enabledColumns.map((col) => {
                const value = evaluateColumn(col, { item, cache }, columns, cache);
                const formatted = formatColumnValue(value, col);
                const isLoading = loadingColumns.has(col.id) && value === null;

                if (col.id === "action") {
                    return (
                        <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light text-center">
                            {(item as any)._action && (
                                <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-osrs-accent rounded shadow-sm">
                                    {(item as any)._action}
                                </span>
                            )}
                        </td>
                    );
                }

                if (col.id === "name") {
                    return (
                        <React.Fragment key={col.id}>
                            <td className="p-3 h-12 border-b border-osrs-border-light w-10">
                                <div className="flex items-center justify-start h-full">
                                    <Link
                                        href={`/item/${generateSlug(item.name)}`}
                                        className="w-6 h-6 flex items-center justify-center text-inherit no-underline"
                                    >
                                        <ItemImage name={item.name} />
                                    </Link>
                                </div>
                            </td>
                            <td className="p-3 h-12 border-b border-osrs-border-light">
                                <div className="flex items-center justify-center h-full">
                                    <Link
                                        href={`/item/${generateSlug(item.name)}`}
                                        className="text-inherit no-underline hover:underline font-medium whitespace-nowrap"
                                    >
                                        {formatted}
                                    </Link>
                                </div>
                            </td>
                        </React.Fragment>
                    );
                }

                if (col.id === "favorite") {
                    return (
                        <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light text-center">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                }}
                                className="focus:outline-none hover:scale-110 transition-transform flex items-center justify-center w-full h-full"
                            >
                                <Heart
                                    className={`w-4 h-4 ${isFavoriteItem ? "fill-osrs-primary text-osrs-primary" : "text-osrs-text opacity-40 hover:opacity-100"}`}
                                />
                            </button>
                        </td>
                    );
                }

                if (col.format === "currency") {
                    const numVal = Number(value);
                    const colorClass = numVal >= 0 ? "text-osrs-profit font-bold" : "text-osrs-loss font-bold";
                    const coinClass = getCurrencyClass(numVal);

                    return (
                        <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light text-center">
                            {isLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                <span className={`${colorClass} ${coinClass}`}>{formatted}</span>
                            )}
                        </td>
                    );
                }

                if (col.id === "members") {
                    return (
                        <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light text-center">
                            <div className="flex items-center justify-center h-full">
                                <img
                                    src={item.members ? MEMBER_ICON : NON_MEMBER_ICON}
                                    alt={item.members ? "Member" : "Non-Member"}
                                    className="w-4 h-4"
                                />
                            </div>
                        </td>
                    );
                }

                if (col.id === "low" || col.id === "high") {
                    return (
                        <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light align-middle text-center">
                            {isLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                <span>{formatted}</span>
                            )}
                        </td>
                    );
                }

                return (
                    <td key={col.id} className="p-3 h-12 border-b border-osrs-border-light text-center">
                        {isLoading ? <Spinner size="sm" /> : formatted}
                    </td>
                );
            })}
        </tr>
    );
}, (prevProps, nextProps) => {
    // Only re-render if item ID changes or columns change
    if (prevProps.item.id !== nextProps.item.id) return false;
    if (prevProps.action !== nextProps.action) return false;
    if (prevProps.showActionColumn !== nextProps.showActionColumn) return false;

    const prevEnabled = prevProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    const nextEnabled = nextProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    if (prevEnabled !== nextEnabled) return false;

    if (prevProps.item !== nextProps.item) return false;
    if (prevProps.cache !== nextProps.cache) return false;

    return true;
});

TableRow.displayName = "TableRow";

export default TableRow;
