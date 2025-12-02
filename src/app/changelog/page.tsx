"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GITHUB_REPO = "scottsdevelopment/geflip.com"; // Customizable repo

interface Release {
    id: number;
    name: string;
    body: string;
    published_at: string;
    html_url: string;
}

export default function ChangelogPage() {
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReleases = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`);
                if (!response.ok) {
                    throw new Error("Failed to fetch releases");
                }
                const data = await response.json();
                setReleases(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchReleases();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-osrs-panel border-2 border-osrs-border rounded-lg shadow-lg text-osrs-text">
            <div className="flex justify-between items-center mb-8 border-b border-osrs-border pb-4">
                <h1 className="text-3xl font-header font-bold text-osrs-text-dark">
                    Changelog
                </h1>
                <a
                    href={`https://github.com/${GITHUB_REPO}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-osrs-accent text-white rounded hover:bg-osrs-accent/90 transition-colors font-bold text-sm"
                >
                    Contribute / Suggestions
                </a>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-osrs-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading updates...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded text-center">
                    <p>Error loading changelog: {error}</p>
                    <p className="text-sm mt-2">Please check the repository settings or try again later.</p>
                </div>
            )}

            <div className="space-y-8">
                {releases.map((release) => (
                    <div key={release.id} className="bg-osrs-input rounded-lg border border-osrs-border p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-osrs-accent">
                                    <a href={release.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {release.name || "Untitled Release"}
                                    </a>
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {new Date(release.published_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-osrs-text">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {release.body}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {!loading && releases.length === 0 && !error && (
                    <div className="text-center text-gray-500 py-8">
                        No releases found.
                    </div>
                )}
            </div>
        </div>
    );
}
