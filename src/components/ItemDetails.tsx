"use client";

import Link from "next/link";
import { getItemImageUrl } from "@/lib/api";
import { ItemMapping, PriceData } from "@/lib/types";
import ItemCharts from "./ItemCharts";
import { Heart, Copy, ExternalLink, Database } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useItemsStore } from "@/stores/useItemsStore";
import { useState, useEffect } from "react";
import { BUY_ICON, SELL_ICON } from "@/lib/constants/icons";
import { getCurrencyClass } from "@/lib/currency";

interface ItemDetailsProps {
    item: ItemMapping;
    price: PriceData;
    volume: number;
}

export default function ItemDetails({ item, price, volume }: ItemDetailsProps) {
    const favorites = useFavoritesStore(state => state.favorites);
    const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
    const items = useItemsStore(state => state.items);
    const [copied, setCopied] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Prevent hydration mismatch by only showing favorite state after client-side hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Find the item in the store to get the latest data
    const storeItem = items.find(i => i.id === item.id);

    // Use store data if available, otherwise fall back to props
    const currentPrice = storeItem ? {
        high: storeItem.high,
        highTime: storeItem.highTime,
        low: storeItem.low,
        lowTime: storeItem.lowTime
    } : price;

    const currentVolume = storeItem ? storeItem.volume : volume;

    const formatNumber = (num: number | undefined) => (num ? num.toLocaleString() : "-");

    const formatCurrency = (num: number | undefined) => {
        if (num === undefined || num === null) return "-";
        const coinClass = getCurrencyClass(num);
        return <span className={coinClass}>{num.toLocaleString()}</span>;
    };

    const timeAgo = (timestamp: number | undefined) => {
        if (!timestamp) return "-";
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const margin = currentPrice.high && currentPrice.low ? currentPrice.high * 0.98 - currentPrice.low : 0;
    const roi = currentPrice.low ? (margin / currentPrice.low) * 100 : 0;
    const potentialProfit = margin * (item.limit || 0);
    const alchProfit = item.highalch && currentPrice.low ? item.highalch - currentPrice.low : 0;

    const handleCopy = () => {
        navigator.clipboard.writeText(item.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Only check favorite state after hydration to prevent SSR mismatch
    const favorite = isHydrated && favorites.has(item.id);

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="m-0 text-osrs-text-dark text-3xl font-header font-bold flex items-center gap-3">
                        <img
                            src={getItemImageUrl(item.name)}
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                        {item.name}
                        <span className="text-osrs-text-muted text-sm font-normal">(Item ID: {item.id})</span>
                    </h1>
                </div>

                <div className="flex gap-2">
                    <a
                        href={`https://oldschool.runescape.wiki/w/Special:Lookup?type=item&id=${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light hover:bg-osrs-secondary-hover transition-colors"
                    >
                        Wiki
                    </a>
                    <a
                        href={`https://secure.runescape.com/m=itemdb_oldschool/viewitem?obj=${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light hover:bg-osrs-secondary-hover transition-colors"
                    >
                        GEDB
                    </a>
                    <button
                        onClick={handleCopy}
                        title="Copy item name"
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary text-osrs-text-dark font-bold rounded border border-osrs-border-light hover:bg-osrs-secondary-hover transition-colors"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => toggleFavorite(item.id)}
                        title="Add item to favourites"
                        className="btn btn-secondary px-3 py-2 bg-osrs-secondary font-bold rounded border border-osrs-border-light hover:bg-osrs-secondary-hover transition-colors"
                    >
                        <Heart size={16} className={favorite ? "fill-osrs-primary text-osrs-primary" : "text-osrs-text-dark"} />
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
                            <h5 className="m-0 text-osrs-text-dark font-bold text-lg flex items-center gap-2">
                                <img src={BUY_ICON} alt="Buy" className="w-5 h-5" />
                                Buy price: <span className="text-osrs-text-dark">{formatCurrency(currentPrice.high)}</span>
                            </h5>
                            <p className="text-sm text-osrs-text-muted mt-1">Last trade: <span className="text-osrs-text-muted">{timeAgo(currentPrice.highTime)}</span></p>
                        </div>

                        {/* Sell Price */}
                        <div>
                            <h5 className="m-0 text-osrs-text-dark font-bold text-lg flex items-center gap-2">
                                <img src={SELL_ICON} alt="Sell" className="w-5 h-5" />
                                Sell price: <span className="text-osrs-text-dark">{formatCurrency(currentPrice.low)}</span>
                            </h5>
                            <p className="text-sm text-osrs-text-muted mt-1">Last trade: <span className="text-osrs-text-muted">{timeAgo(currentPrice.lowTime)}</span></p>
                        </div>
                    </div>

                    {/* Middle Column: Key Stats */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h5 className="m-0 text-osrs-text-dark font-bold text-lg">
                                Daily volume: <span className="text-osrs-success">{formatNumber(currentVolume)}</span>
                            </h5>
                            <p className="text-sm text-osrs-text-muted mt-1">Based on the official OSRS GEDB</p>
                        </div>
                        <div>
                            <h5 className="m-0 text-osrs-text-dark font-bold text-lg">
                                Margin: <span className={`${margin > 0 ? "text-osrs-profit" : "text-osrs-loss"} ${getCurrencyClass(margin)}`}>
                                    {Math.round(margin).toLocaleString()}
                                </span>
                            </h5>
                        </div>
                        <div>
                            <h6 className="m-0 text-osrs-text-dark font-bold text-lg">
                                Potential profit: <span className={`${potentialProfit > 0 ? "text-osrs-profit" : "text-osrs-loss"} ${getCurrencyClass(potentialProfit)}`}>
                                    {Math.round(potentialProfit).toLocaleString()}
                                </span>
                            </h6>
                        </div>
                        <div>
                            <h5 className="m-0 text-osrs-text-dark font-bold text-lg">
                                ROI: <span className="text-osrs-text-dark">{roi.toFixed(2)}%</span>
                            </h5>
                        </div>
                    </div>

                    {/* Right Column: Details Table */}
                    <div>
                        <table className="w-full text-sm text-left">
                            <tbody>
                                <tr className="border-b border-osrs-border-light">
                                    <td className="p-2 font-bold text-osrs-text-dark">Buy Limit</td>
                                    <td className="p-2 font-bold text-osrs-text-dark text-right">{formatNumber(item.limit)}</td>
                                </tr>
                                <tr className="border-b border-osrs-border-light">
                                    <td className="p-2 font-bold text-osrs-text-dark">High Alch</td>
                                    <td className="p-2 font-bold text-osrs-text-dark text-right">
                                        {formatCurrency(item.highalch)}
                                        <span className={`ml-1 text-xs ${alchProfit > 0 ? "text-osrs-loss" : "text-osrs-loss"}`}>
                                            ({formatCurrency(alchProfit)})
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-osrs-border-light">
                                    <td className="p-2 font-bold text-osrs-text-dark">Low Alch</td>
                                    <td className="p-2 font-bold text-osrs-text-dark text-right">{formatCurrency(item.lowalch)}</td>
                                </tr>
                                <tr className="border-b border-osrs-border-light">
                                    <td className="p-2 font-bold text-osrs-text-dark">Members</td>
                                    <td className="p-2 text-right">
                                        <div className="flex justify-end">
                                            {item.members ? (
                                                <img src="https://oldschool.runescape.wiki/images/Member_icon.png" alt="Members" title="Members object" />
                                            ) : (
                                                <img src="https://oldschool.runescape.wiki/images/Free-to-play_icon.png" alt="F2P" title="Free-to-play object" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2 font-bold text-osrs-text-dark align-top">Examine</td>
                                    <td className="p-2 italic text-osrs-text-dark text-right">{item.examine}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ItemCharts itemId={item.id} latestPrice={currentPrice} />
        </div>
    );
}
