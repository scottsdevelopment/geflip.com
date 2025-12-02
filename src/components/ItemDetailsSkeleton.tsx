import React from "react";
import SkeletonLoader from "./SkeletonLoader";
import { Heart, Copy } from "lucide-react";

export default function ItemDetailsSkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <SkeletonLoader width={32} height={32} />
                        <SkeletonLoader width={200} height={36} />
                        <SkeletonLoader width={100} height={20} />
                    </div>
                </div>

                {/* Show actual static buttons instead of skeleton loaders */}
                <div className="flex gap-2">
                    <button
                        disabled
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light opacity-50 cursor-not-allowed"
                    >
                        Wiki
                    </button>
                    <button
                        disabled
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light opacity-50 cursor-not-allowed"
                    >
                        GEDB
                    </button>
                    <button
                        disabled
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light opacity-50 cursor-not-allowed"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        disabled
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary font-bold rounded border border-osrs-border-light opacity-50 cursor-not-allowed"
                    >
                        <Heart size={16} className="text-osrs-text-dark" />
                    </button>
                </div>
            </div>

            {/* Main Data Box */}
            <div className="bg-osrs-secondary-hover p-6 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.3)] text-left mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Prices */}
                    <div className="flex flex-col gap-6">
                        {/* Buy Price */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <SkeletonLoader width={20} height={20} />
                                <SkeletonLoader width={150} height={24} />
                            </div>
                            <SkeletonLoader width={120} height={16} />
                        </div>

                        {/* Sell Price */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <SkeletonLoader width={20} height={20} />
                                <SkeletonLoader width={150} height={24} />
                            </div>
                            <SkeletonLoader width={120} height={16} />
                        </div>
                    </div>

                    {/* Middle Column: Key Stats */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <SkeletonLoader width={180} height={24} className="mb-1" />
                            <SkeletonLoader width={200} height={16} />
                        </div>
                        <div>
                            <SkeletonLoader width={150} height={24} />
                        </div>
                        <div>
                            <SkeletonLoader width={160} height={24} />
                        </div>
                        <div>
                            <SkeletonLoader width={100} height={24} />
                        </div>
                    </div>

                    {/* Right Column: Details Table */}
                    <div>
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-osrs-border-light py-2">
                                    <SkeletonLoader width={80} height={20} />
                                    <SkeletonLoader width={60} height={20} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Skeleton */}
            <div className="w-full h-[400px] bg-osrs-panel rounded-lg p-4">
                <SkeletonLoader width="100%" height="100%" />
            </div>
        </div>
    );
}
