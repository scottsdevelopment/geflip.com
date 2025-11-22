"use client";

import React, { useState, memo } from "react";
import Link from "next/link";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { ImageOff } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import { evaluateColumn, formatColumnValue } from "@/lib/columns/engine";

interface ItemImageProps {
    name: string;
}

const ItemImage = memo(({ name }: ItemImageProps) => {
    const [error, setError] = useState(false);
    const src = getItemImageUrl(name);

    if (error) {
        return (
            <div className="w-6 h-6 flex items-center justify-center bg-[#c0a886] rounded-full" title={name}>
                <ImageOff className="w-4 h-4 text-[#5a3820] opacity-60" />
            </div>
        );
    }

    return (
        <img
            className="w-6 h-6 inline-block align-middle"
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawData?: any;
}

const TableRow = memo(({ item, columns, rawData }: TableRowProps) => {
    const enabledColumns = columns.filter(c => c.enabled);

    return (
        <tr className="even:bg-[#dfd5c1] hover:bg-[#f0e6d2] transition-colors">
            {/* Fixed Image Column */}
            <td className="p-3 border-b border-[#c9bca0]">
                <Link
                    href={`/item/${item.id}`}
                    target="_blank"
                    className="w-6 h-6 flex items-center justify-center text-inherit no-underline"
                >
                    <ItemImage name={item.name} />
                </Link>
            </td>

            {enabledColumns.map((col) => {
                const value = evaluateColumn(col, { item, rawData }, columns);
                const formatted = formatColumnValue(value, col);

                if (col.id === "name") {
                    return (
                        <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                            <Link
                                href={`/item/${item.id}`}
                                target="_blank"
                                className="text-inherit no-underline hover:underline font-medium"
                            >
                                {formatted}
                            </Link>
                        </td>
                    );
                }

                if (col.id === "profit" || col.id === "alchMargin") {
                    const numVal = Number(value);
                    const colorClass = numVal >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold";
                    return (
                        <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                            <span className={colorClass}>{formatted}</span>
                        </td>
                    );
                }

                return (
                    <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                        {formatted}
                    </td>
                );
            })}
        </tr>
    );
}, (prevProps, nextProps) => {
    if (prevProps.item.id !== nextProps.item.id) return false;

    const prevEnabled = prevProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    const nextEnabled = nextProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    if (prevEnabled !== nextEnabled) return false;

    if (prevProps.item !== nextProps.item) return false;
    if (prevProps.rawData !== nextProps.rawData) return false;

    return true;
});

TableRow.displayName = "TableRow";

export default TableRow;
