"use client";

import React, { useState, useEffect } from "react";
import { ProcessedItem } from "@/lib/types";
import ItemSearch from "@/components/ItemSearch";
import { useItemsStore } from "@/stores/useItemsStore";
import { getCurrencyClass } from "@/lib/currency";

// ...

const formatCurrency = (num: number | undefined) => {
    if (num === undefined || num === null) return "-";
    const coinClass = getCurrencyClass(num);
    return <span className={coinClass}>{num.toLocaleString()}</span>;
};

// ...

                    <h3 className="text-osrs-accent mb-4">Calculation Results</h3>
                    <div id="results-display" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Starting Capital:</strong> <span>{results ? formatCurrency(results.startingCapital) : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Item Price:</strong> <span>{results ? formatCurrency(results.itemPrice) : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Alch Value:</strong> <span>{results ? formatCurrency(results.alchValue) : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Quantity:</strong> <span>{results ? results.quantity.toLocaleString() : "-"}</span></p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Cost Paid:</strong> <span>{results ? formatCurrency(results.costPaid) : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Leftover:</strong> <span>{results ? formatCurrency(results.leftoverCapital) : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded">
                            <strong className="text-osrs-accent">Profit:</strong>{" "}
                            <span className={results ? (results.profit >= 0 ? "text-osrs-profit" : "text-osrs-loss") : ""}>
                                {results ? formatCurrency(results.profit) : "-"}
                            </span>{" "}
                            GP
                        </p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Ending Capital:</strong> <span>{results ? formatCurrency(results.endingCapital) : "-"}</span> GP</p>
                    </div>
                </div >

    <div className="p-4 bg-osrs-panel rounded">
        <h3 className="text-osrs-accent mb-4">Trade Log</h3>
        <div id="trade-log" className="max-h-[400px] overflow-y-auto mb-4 p-4 bg-osrs-input rounded">
            {log.map((entry) => (
                <div key={entry.id} className="mb-4 p-4 bg-osrs-secondary-hover rounded border-l-[3px] border-l-osrs-accent">
                    <p><strong className="text-osrs-accent">Trade #{entry.id}</strong></p>
                    <p className="my-1">Starting Capital: {formatCurrency(entry.startingCapital)} GP</p>
                    <p className="my-1">Item Price: {formatCurrency(entry.itemPrice)} GP</p>
                    <p className="my-1">Alch Value: {formatCurrency(entry.alchValue)} GP</p>
                    <p className="my-1">Quantity: {entry.quantity.toLocaleString()}</p>
                    <p className="my-1">Cost Paid: {formatCurrency(entry.costPaid)} GP</p>
                    <p className="my-1">Leftover: {formatCurrency(entry.leftoverCapital)} GP</p>
                    <p className="my-1">
                        Profit:{" "}
                        <span className={entry.profit >= 0 ? "text-osrs-profit" : "text-osrs-loss"}>
                            {formatCurrency(entry.profit)} GP
                        </span>
                    </p>
                    <p className="my-1">Ending Capital: {formatCurrency(entry.endingCapital)} GP</p>
                    <hr className="border-t border-osrs-border mt-2" />
                </div>
            ))}
        </div>
        <button
            type="button"
            id="clear-log-btn"
            onClick={() => setLog([])}
            className="bg-osrs-loss text-osrs-text-light px-5 py-2 border border-osrs-border-dark rounded font-header font-bold cursor-pointer hover:bg-osrs-loss shadow-sm"
        >
            Clear Log
        </button>
    </div>
            </div >
        </div >
    );
}
