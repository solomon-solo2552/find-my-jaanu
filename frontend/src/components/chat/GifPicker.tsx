"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { chatApi, GifResult } from "@/lib/chat";

interface Props {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export function GifPicker({ onSelect, onClose }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GifResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await chatApi.searchGifs(q);
            setResults(res.results);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to load GIFs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial: trending
        load("");
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            load(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="border-t border-gray-100 bg-white h-[350px] flex flex-col">
            {/* Search bar */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search GIFs..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        autoFocus
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                    ✕
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-sm text-red-500 px-4 text-center">
                        {error}
                    </div>
                ) : results.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        No GIFs found
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {results.map((gif) => (
                            <button
                                key={gif.id}
                                onClick={() => onSelect(gif.url)}
                                className="relative rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition group"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={gif.preview}
                                    alt=""
                                    className="w-full aspect-square object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}