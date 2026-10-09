"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { photoUrl } from "@/lib/profiles";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface PreviewProfile {
    id: string;
    display_name: string;
    is_featured: boolean;
    photo: string | null;
}

export function SocialProofSection() {
    const [profiles, setProfiles] = useState<PreviewProfile[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/profiles/public-preview/`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                setProfiles(data.results || []);
            })
            .catch((err) => {
                console.warn("Social proof fetch failed:", err.message);
                setError(err.message);
            });
    }, []);

    return (
        <section className="bg-white border-y border-gray-100 py-14">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Trusted by 10,000+ Jaanus across India
                </p>

                <div className="flex items-center justify-center flex-wrap gap-3">
                    {profiles.length === 0
                        ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-pink-400"
                            />
                        ))
                        : profiles.map((p) => (
                            <div key={p.id} className="relative">
                                {p.photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photoUrl(p.photo)}
                                        alt={p.display_name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md hover:scale-110 transition"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold">
                                        {p.display_name[0].toUpperCase()}
                                    </div>
                                )}
                                {p.is_featured && (
                                    <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
                                )}
                            </div>
                        ))}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <Stat number="10K+" label="Active users" />
                    <Stat number="2.5M" label="Messages sent" />
                    <Stat number="5,000+" label="Matches made" />
                </div>
            </div>
        </section>
    );
}

function Stat({ number, label }: { number: string; label: string }) {
    return (
        <div>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                {number}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
        </div>
    );
}