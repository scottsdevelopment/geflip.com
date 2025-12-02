import React from "react";
import SkeletonLoader from "./SkeletonLoader";

export const SkeletonTableHeader = () => {
    return (
        <tr>
            {/* Favorite */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={20} height={27} />
                </div>
            </th>
            {/* Item (image + name) */}
            <th colSpan={2} className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={150} height={27} />
                </div>
            </th>
            {/* Buy Limit */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={50} height={27} />
                </div>
            </th>
            {/* Members */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={20} height={27} />
                </div>
            </th>
            {/* Sell Price */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={90} height={27} />
                </div>
            </th>
            {/* Most Recent Sell */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={60} height={27} />
                </div>
            </th>
            {/* Buy Price */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={90} height={27} />
                </div>
            </th>
            {/* Most Recent Buy */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={60} height={27} />
                </div>
            </th>
            {/* ROI % */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={50} height={27} />
                </div>
            </th>
            {/* Margin */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={90} height={27} />
                </div>
            </th>
            {/* Daily Volume */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={70} height={27} />
                </div>
            </th>
            {/* Potential Profit */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={90} height={27} />
                </div>
            </th>
            {/* Margin * Volume */}
            <th className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-osrs-text-dark font-header font-bold border-b-2 border-osrs-border shadow-sm">
                <div className="flex justify-center">
                    <SkeletonLoader width={90} height={27} />
                </div>
            </th>
        </tr>
    );
};

export const SkeletonTableBody = () => {
    return (
        <>
            {[...Array(50)].map((_, index) => (
                <tr key={`skeleton-${index}`} className="even:bg-osrs-table-even border-b border-osrs-border-light">
                    {/* Favorite */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={20} height={20} />
                        </div>
                    </td>
                    {/* Item Image */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-start">
                            <SkeletonLoader width={32} height={24} />
                        </div>
                    </td>
                    {/* Item Name */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={150} height={20} />
                        </div>
                    </td>
                    {/* Buy Limit */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={50} height={20} />
                        </div>
                    </td>
                    {/* Members */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={20} height={20} />
                        </div>
                    </td>
                    {/* Sell Price */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={90} height={20} />
                        </div>
                    </td>
                    {/* Most Recent Sell */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={60} height={20} />
                        </div>
                    </td>
                    {/* Buy Price */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={90} height={20} />
                        </div>
                    </td>
                    {/* Most Recent Buy */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={60} height={20} />
                        </div>
                    </td>
                    {/* ROI % */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={50} height={20} />
                        </div>
                    </td>
                    {/* Margin */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={90} height={20} />
                        </div>
                    </td>
                    {/* Daily Volume */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={70} height={20} />
                        </div>
                    </td>
                    {/* Potential Profit */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={90} height={20} />
                        </div>
                    </td>
                    {/* Margin * Volume */}
                    <td className="p-3 border-b border-osrs-border-light">
                        <div className="flex justify-center">
                            <SkeletonLoader width={90} height={20} />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
};
