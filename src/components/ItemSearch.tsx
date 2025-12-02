"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";

interface ItemSearchProps {
    items: ProcessedItem[];
    placeholder?: string;
    onSelect: (item: ProcessedItem) => void;
    className?: string;
}

export default function ItemSearch({ items, placeholder = "Search for an item...", onSelect, className = "" }: ItemSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Filter items based on search query
    const filteredItems = searchQuery.trim()
        ? items
            .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 10) // Limit to 10 results
        : [];

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemSelect = (item: ProcessedItem) => {
        setShowAutocomplete(false);
        setSearchQuery("");
        onSelect(item);
    };

    return (
        <div className="relative" ref={searchRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(e.target.value.trim().length > 0);
                }}
                onFocus={() => searchQuery.trim().length > 0 && setShowAutocomplete(true)}
                className={`block w-full px-3 py-2 border border-osrs-border rounded bg-osrs-input text-osrs-text text-sm placeholder-osrs-text/60 focus:outline-none focus:border-osrs-accent focus:ring-1 focus:ring-osrs-accent transition-colors ${className}`}
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-osrs-panel border border-osrs-border rounded shadow-lg max-h-96 overflow-y-auto z-50">
                    {filteredItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleItemSelect(item);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-osrs-accent/30 transition-colors text-left border-b border-osrs-border/30 last:border-b-0"
                        >
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                <Image
                                    src={getItemImageUrl(item.name)}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                            <span className="text-osrs-text text-sm">{item.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
