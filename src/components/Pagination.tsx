"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import SkeletonLoader from "./SkeletonLoader";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    loading?: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    loading = false,
}: PaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleJumpToPage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const page = parseInt(formData.get("page") as string, 10);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            e.currentTarget.reset();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-osrs-panel border-1 border-osrs-border rounded-t-lg">
            {/* Items count */}
            <div className="text-sm text-osrs-text font-body w-[250px]">
                {loading ? (
                    <SkeletonLoader width={250} height={20} />
                ) : (
                    <>
                        Showing <span className="font-bold">{startItem}-{endItem}</span> of{" "}
                        <span className="font-bold">{totalItems}</span> items
                    </>
                )}
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-2 bg-osrs-button text-osrs-text-dark font-header font-bold rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-osrs-button text-osrs-text-dark font-header font-bold rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-osrs-text font-body px-2 w-[120px] inline-block text-center">
                    {loading ? (
                        <SkeletonLoader width={100} height={20} />
                    ) : (
                        <>
                            Page <span className="font-bold">{currentPage}</span> of{" "}
                            <span className="font-bold">{totalPages}</span>
                        </>
                    )}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-2 bg-osrs-button text-osrs-text-dark font-header font-bold rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 py-2 bg-osrs-button text-osrs-text-dark font-header font-bold rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>

            {/* Page size selector and jump to page */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="page-size" className="text-sm text-osrs-text font-body">
                        Per page:
                    </label>
                    <select
                        id="page-size"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
                        className="px-2 py-1 bg-osrs-input text-osrs-text font-body rounded border-2 border-osrs-border focus:outline-none focus:border-osrs-accent"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                </div>

                <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                    <label htmlFor="jump-to-page" className="text-sm text-osrs-text font-body">
                        Go to:
                    </label>
                    <input
                        type="number"
                        id="jump-to-page"
                        name="page"
                        min={1}
                        max={totalPages}
                        placeholder={currentPage.toString()}
                        className="w-16 px-2 py-1 bg-osrs-input text-osrs-text font-body rounded border-2 border-osrs-border focus:outline-none focus:border-osrs-accent"
                    />
                </form>
            </div>
        </div>
    );
}
