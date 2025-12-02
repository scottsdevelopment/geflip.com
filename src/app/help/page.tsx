"use client";

import React from "react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-lg text-osrs-text">
            <h1 className="text-3xl font-header font-bold text-center mb-8 text-osrs-text-dark border-b border-osrs-border pb-4">
                Help & Documentation
            </h1>

            {/* Introduction */}
            <section className="mb-8">
                <p className="mb-4">
                    Welcome to the GE Flip help documentation. Here you can learn how to use the advanced filtering and column features to find the best items to flip in Old School RuneScape.
                </p>
            </section>

            {/* Filters & Columns */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Filters & Columns</h2>
                <div className="bg-osrs-input p-4 rounded border border-osrs-border mb-4">
                    <p className="font-bold text-osrs-text-dark mb-2">✨ Everything is Editable!</p>
                    <p>
                        One of the most powerful features of GE Flip is that <strong>all filters and columns are fully editable</strong>.
                        You can tweak existing presets, modify community filters, or build your own from scratch to suit your exact strategy.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-osrs-text-dark mb-2">Filters</h3>
                        <p className="mb-2">
                            Filters allow you to narrow down the list of items based on specific criteria.
                            You can create complex logic to find exactly what you're looking for.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-osrs-text-dark mb-2">Columns</h3>
                        <p className="mb-2">
                            Custom columns allow you to calculate and display new data for each item.
                            Use them to show potential profit, ROI, or any other metric you care about.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters vs Presets */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Presets vs. Custom Filters</h2>
                <p className="mb-4">
                    <strong>Presets</strong> are simple, pre-configured toggles that we've set up for common use cases.
                    They are a great way to get started.
                </p>
                <div className="bg-osrs-input border-l-4 border-osrs-accent p-4 mb-4 text-osrs-text">
                    <p className="font-bold text-osrs-text-dark">Community Filters & Common Columns</p>
                    <p>
                        We have also included a selection of <strong>Community Filters</strong> and <strong>Common Columns</strong>.
                        These are more advanced than basic presets and showcase what's possible with the custom engine.
                        Feel free to enable them and then <strong>edit them</strong> to see how they work!
                    </p>
                </div>
                <p>
                    <strong>Custom Filters</strong> give you full control. You can write your own logic using our expression engine.
                </p>
            </section>

            {/* Creating Filters */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Creating Filters</h2>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-osrs-text-dark mb-2">Simple Filters</h3>
                    <p className="mb-2">
                        Simple filters provide a user-friendly interface for creating basic filters without writing code.
                        You can select properties, operators, and values from dropdowns.
                    </p>
                    <p className="text-sm text-gray-600">
                        As you build your filter, you'll see <strong>live results</strong> showing how many items match your criteria.
                        The table will also update to show which items are currently selected by your active filters.
                    </p>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-osrs-text-dark mb-2">Advanced Filter Usage</h3>
                    <p className="mb-4">
                        Advanced filters give you complete control with custom expressions. You can combine multiple conditions,
                        reference other items, and create complex logic.
                    </p>

                    <div className="mb-4">
                        <h4 className="font-bold text-osrs-text-dark mb-2">Action Label</h4>
                        <p className="mb-2 text-sm">
                            When creating a filter expression, you can optionally set an <strong>Action</strong>.
                            This is a short text label (e.g., "Flip", "Alch", "Hold") that will appear in the "Action" column for items that match that specific expression.
                            This is useful when you have a single filter with multiple "OR" expressions and want to know <em>which</em> part of the filter matched.
                        </p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold text-osrs-text-dark mb-2">Item Override (Highlight Item)</h4>
                        <p className="mb-2 text-sm">
                            You can also specify a <strong>Highlight Item</strong>. This tells the table to show the icon and details of <em>another</em> item
                            instead of the one that matched the filter.
                        </p>
                        <p className="text-sm text-gray-600 italic">
                            Example: If you are filtering for "Black masks (10) that are profitable to decharge", you might match on the "Black mask (10)" item (which you buy),
                            but you want the table to show the "Black mask" (which you sell) as the result.
                        </p>
                    </div>
                    {/* Examples */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-osrs-text-dark mb-2">Advanced Filter Examples</h3>

                        <div className="bg-osrs-input p-4 rounded border border-osrs-border mb-4">
                            <h4 className="text-lg font-bold text-osrs-text-dark mb-2">Scenario: Crafting - Stringing Amulets</h4>
                            <p className="mb-2">
                                Let's check if it's profitable to buy unstrung gold amulets and balls of wool, string them, and sell the strung amulets.
                            </p>
                            <p className="mb-2 font-bold text-sm text-gray-600">Expression:</p>
                            <code className="block bg-black/10 p-2 rounded font-mono text-sm mb-2">
                                (getItem("Gold amulet", "low") - (getItem("Gold amulet (u)", "high") + getItem("Ball of wool", "high"))) {">"} 0
                            </code>
                            <p className="text-sm">
                                This calculates: <code>Sell Price of Strung</code> - (<code>Buy Price of Unstrung</code> + <code>Buy Price of Wool</code>).
                                If the result is greater than 0, it's profitable (ignoring tax/time for this simple example).
                            </p>
                        </div>
                    </div>
                </div>
            </section>




            {/* Creating Columns */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Creating Custom Columns</h2>
                <p className="mb-4">
                    Custom columns allow you to calculate and display any metric you want. Here's how to create one:
                </p>

                <div className="bg-osrs-input p-4 rounded border border-osrs-border mb-4">
                    <h3 className="text-lg font-bold text-osrs-text-dark mb-3">Column Configuration</h3>

                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-bold mb-1">Expression</p>
                            <p>The formula that calculates the column value. Use JavaScript-like syntax with access to <code>item</code> properties.</p>
                            <code className="block bg-black/10 p-2 rounded font-mono text-xs mt-1">
                                Example: item.high - item.low
                            </code>
                        </div>

                        <div>
                            <p className="font-bold mb-1">Type</p>
                            <p>The data type of the result:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li><strong>Number</strong>: Numeric values (prices, percentages, etc.)</li>
                                <li><strong>String</strong>: Text values</li>
                                <li><strong>Boolean</strong>: True/false values (shown as checkmarks)</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold mb-1">Format (for Number type)</p>
                            <ul className="list-disc list-inside ml-2">
                                <li><strong>Currency</strong>: Displays as GP (e.g., "1.2M")</li>
                                <li><strong>Percentage</strong>: Displays with % symbol</li>
                                <li><strong>Decimal</strong>: Plain number with commas</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-bold mb-1">Group</p>
                            <p>Organizes columns in the column selector. Choose from: Core, Profit, Volume, Averages, Alchemy, Technical, or Custom.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Calculations */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Custom Calculations Guide</h2>
                <p className="mb-4">
                    Expressions use a JavaScript-like syntax. You can use standard math operators (<code>+, -, *, /</code>)
                    and comparison operators (<code>{">"}, {"<"}, ==, !=, and, or</code>).
                </p>

                <h3 className="text-xl font-bold text-osrs-text-dark mb-2">Available Variables</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-osrs-button text-osrs-text-dark">
                                <th className="p-2 border border-osrs-border">Variable</th>
                                <th className="p-2 border border-osrs-border">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-mono">item</td>
                                <td className="p-2 border border-osrs-border">The current item. Access properties like <code>item.price</code>.</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-mono">columns</td>
                                <td className="p-2 border border-osrs-border">Access your custom columns. e.g. <code>columns.myProfitCol</code>.</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-mono">getItem(id | "name", "property")</td>
                                <td className="p-2 border border-osrs-border">
                                    Lookup another item by ID or exact name.
                                    <br />
                                    <strong>Important:</strong> You must provide the property name as the second argument to get a value.
                                    <br />
                                    Example: <code>getItem("Nature rune", "low")</code>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Builtin Properties */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Item Properties Reference</h2>
                <p className="mb-4">These properties are available on the <code>item</code> object (e.g., <code>item.highalch</code>).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {/* List of properties */}
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">id</span>: Unique Item ID</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">name</span>: Item Name</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">members</span>: Boolean (true if members only)</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">limit</span>: GE Buy Limit</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">highalch</span>: High Alchemy Value</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">low</span>: Latest Instabuy Price</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">high</span>: Latest Instasell Price</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">volume</span>: 24h Volume</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">avg5m</span>: Average Price (5 mins)</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">avg1h</span>: Average Price (1 hour)</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">avg6h</span>: Average Price (6 hours)</div>
                    <div className="p-2 border border-osrs-border bg-osrs-input rounded"><span className="font-mono font-bold">avg24h</span>: Average Price (24 hours)</div>
                </div>
            </section>

            {/* Column Property References */}
            <section className="mb-8">
                <h2 className="text-2xl font-bold text-osrs-accent mb-4">Column Property Reference</h2>
                <p className="mb-4">
                    Below is a list of the common columns available in the application, along with their calculation formulas.
                    You can use these as a reference when building your own columns.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-osrs-button text-osrs-text-dark">
                                <th className="p-2 border border-osrs-border">Name</th>
                                <th className="p-2 border border-osrs-border">Column ID</th>
                                <th className="p-2 border border-osrs-border">Description</th>
                                <th className="p-2 border border-osrs-border">Formula</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-bold">ROI %</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">columns.roi</td>
                                <td className="p-2 border border-osrs-border">Return on Investment percentage after tax</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">(((item.high * 0.98) - item.low) / item.low)</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-bold">Margin</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">columns.profit</td>
                                <td className="p-2 border border-osrs-border">Potential profit per item after 2% GE tax</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">round((item.high * 0.98) - item.low)</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-bold">Potential Profit</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">columns.potentialProfit</td>
                                <td className="p-2 border border-osrs-border">Max potential profit per 4 hours (Limit * Margin)</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">item.limit * round((item.high * 0.98) - item.low)</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-bold">Margin * Volume</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">columns.marginVolume</td>
                                <td className="p-2 border border-osrs-border">Potential daily profit (Volume * Margin)</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">item.volume * round((item.high * 0.98) - item.low)</td>
                            </tr>
                            <tr className="bg-osrs-input">
                                <td className="p-2 border border-osrs-border font-bold">Alch Margin</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">columns.alchMargin</td>
                                <td className="p-2 border border-osrs-border">Profit from high alching after buying at current price</td>
                                <td className="p-2 border border-osrs-border font-mono text-xs">item.highalch {">"} 0 ? round(item.highalch - item.low) : 0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Feedback */}
            <section className="text-center pt-8 border-t border-osrs-border">
                <p className="mb-4">Have a suggestion or found a bug?</p>
                <a
                    href="https://github.com/scottsdevelopment/geflip.com/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-osrs-accent text-white rounded font-bold hover:bg-osrs-accent/90 transition-colors"
                >
                    Submit an Issue or Suggestion
                </a>
            </section>
        </div>
    );
}
