"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, Heart, ChevronDown, RefreshCw, FlaskConical } from "lucide-react";
import { useItemsStore } from "@/stores/useItemsStore";
import { useFiltersStore } from "@/stores/useFiltersStore";
import ItemSearch from "@/components/ItemSearch";
import { generateSlug } from "@/lib/slug";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const items = useItemsStore(state => state.items);
    const autoRefresh = useItemsStore(state => state.autoRefresh);
    const timeLeft = useItemsStore(state => state.timeLeft);
    const refreshData = useItemsStore(state => state.refreshData);
    const toggleAutoRefresh = useItemsStore(state => state.toggleAutoRefresh);
    const loading = useItemsStore(state => state.loading);

    const savedFilters = useFiltersStore(state => state.savedFilters);
    const handleToggleFilter = useFiltersStore(state => state.handleToggleFilter);

    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const isFavoritesEnabled = savedFilters.find(f => f.id === "favorites_only")?.enabled || false;

    return (
        <>
            <nav className="sticky top-0 z-50 bg-osrs-primary text-osrs-text-light h-14 flex items-center justify-between px-4 shadow-md border-b border-osrs-border">
                {/* Left Section: Logo */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors">
                        <div className="w-8 h-8 bg-osrs-accent rounded-full flex items-center justify-center border border-osrs-border">
                            <Image src="/icon.png" alt="GE Flip Icon" width={18} height={18} className="object-contain" />
                        </div>
                        <span className="font-header font-bold text-lg tracking-wide text-osrs-text-light hidden sm:inline">GE Flip</span>
                    </Link>
                </div>

                {/* Center Section: Search Bar (Desktop) */}
                <div className="flex-1 max-w-[50%] mx-4 hidden md:block">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                            <Search size={16} className="text-osrs-primary" />
                        </div>
                        <ItemSearch
                            items={items}
                            placeholder="Search for an item..."
                            onSelect={(item) => router.push(`/item/${generateSlug(item.name)}`)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Center-Right Section: Navigation Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        className="md:hidden p-2 rounded hover:bg-osrs-accent text-osrs-nav-inactive hover:text-osrs-text-light transition-colors"
                    >
                        <Search size={18} />
                    </button>

                    {/* All Items Button */}
                    <Link
                        href="/"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${pathname === "/" ? "text-osrs-text-light bg-osrs-accent shadow-inner" : "text-osrs-nav-inactive hover:text-osrs-text-light"}`}
                    >
                        <Menu size={18} />
                        <span className="text-sm font-medium hidden sm:inline">All Items</span>
                    </Link>

                    {/* Favourites Button */}
                    {/* Favourites Button */}
                    <button
                        onClick={() => handleToggleFilter("favorites_only")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${isFavoritesEnabled ? "text-osrs-text-light bg-osrs-accent shadow-inner" : "text-osrs-nav-inactive hover:text-osrs-text-light"}`}
                    >
                        <Heart size={18} className={isFavoritesEnabled ? "fill-current" : ""} />
                        <span className="text-sm font-medium hidden sm:inline">Favourites</span>
                    </button>

                    {/* More Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent text-osrs-nav-inactive hover:text-osrs-text-light transition-colors"
                        >
                            <span className="text-sm font-medium hidden sm:inline">More</span>
                            <ChevronDown size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {showMoreDropdown && (
                            <>
                                {/* Backdrop to close dropdown when clicking outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMoreDropdown(false)}
                                />
                                <div className="absolute top-full right-0 mt-2 w-48 bg-osrs-dropdown-bg border border-osrs-border rounded shadow-lg z-50">
                                    {/* <Link
                                    href="/alchemy"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-osrs-text-light border-b border-osrs-border"
                                    onClick={() => setShowMoreDropdown(false)}
                                >
                                    <FlaskConical size={16} className="text-osrs-icon-accent" />
                                    <span className="text-sm font-medium">Alchemy</span>
                                </Link> */}
                                    <Link
                                        href="/changelog"
                                        className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-osrs-text-light border-b border-osrs-border"
                                        onClick={() => setShowMoreDropdown(false)}
                                    >
                                        <span className="text-sm font-medium">Changelog</span>
                                    </Link>
                                    <a
                                        href="https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-osrs-text-light border-b border-osrs-border"
                                        onClick={() => setShowMoreDropdown(false)}
                                    >
                                        <span className="text-sm font-medium">API</span>
                                    </a>
                                    <Link
                                        href="/help"
                                        className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-osrs-text-light"
                                        onClick={() => setShowMoreDropdown(false)}
                                    >
                                        <span className="text-sm font-medium">Help</span>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Section: Refresh Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3">
                        <input
                            type="checkbox"
                            id="auto-refresh"
                            className="accent-osrs-accent"
                            checked={autoRefresh}
                            onChange={toggleAutoRefresh}
                        />
                        <label htmlFor="auto-refresh" className="text-xs text-osrs-nav-inactive cursor-pointer select-none whitespace-nowrap hidden lg:inline">
                            Auto-refresh (<span className="tabular-nums inline-block w-[2ch] text-right">{timeLeft}</span>s)
                        </label>
                    </div>

                    <button
                        className="p-2 rounded hover:bg-osrs-accent text-osrs-nav-inactive hover:text-osrs-text-light transition-colors"
                        title="Refresh"
                        onClick={refreshData}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </nav>

            {/* Mobile Search Bar */}
            {isMobileSearchOpen && (
                <div className="md:hidden bg-osrs-primary p-4 border-b border-osrs-border sticky top-14 z-40 shadow-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                            <Search size={16} className="text-osrs-primary" />
                        </div>
                        <ItemSearch
                            items={items}
                            placeholder="Search for an item..."
                            onSelect={(item) => {
                                router.push(`/item/${generateSlug(item.name)}`);
                                setIsMobileSearchOpen(false);
                            }}
                            className="pl-10 w-full"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
