"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2, RefreshCw, Sparkles, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DailyPickCard } from "@/components/daily/DailyPickCard";
import { ResetTimer } from "@/components/daily/ResetTimer";
import { matchesApi, DailyPicksResponse } from "@/lib/matches";
import { notify, errorMessage } from "@/lib/toast";

export default function DailyPage() {
    return (
        <RequireAuth>
            <Daily />
        </RequireAuth>
    );
}

function Daily() {
    const [data, setData] = useState<DailyPicksResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await matchesApi.dailyPicks();
            setData(res);
        } catch (err) {
            const msg = errorMessage(err, "Failed to load daily picks.");
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-50">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <EmptyState
                        icon={Sparkles}
                        title="Couldn't load your picks"
                        description={error || "Something went wrong."}
                        actionLabel="Try Again"
                        onAction={load}
                    />
                </div>
            </main>
        );
    }

    const hasPicks = data.results.length > 0;

    return (
        <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-pink-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Hero header */}
                <div className="relative rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 p-6 mb-6 shadow-xl overflow-hidden">
                    {/* Decorative circle */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

                    <div className="relative">
                        <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-white" />
                            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                                Premium picks
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Today&apos;s JAANU Picks
                        </h1>
                        <p className="text-sm text-white/90 mb-3 max-w-md">
                            {hasPicks
                                ? `${data.results.length} handpicked profiles selected just for you based on your interests and location.`
                                : "We're still finding the perfect people for you. Check back soon!"}
                        </p>
                        <ResetTimer initialSeconds={data.seconds_until_reset} />
                    </div>
                </div>

                {/* Refresh button */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        {hasPicks ? "Curated for you" : "No picks today"}
                    </h2>
                    <button
                        onClick={load}
                        className="p-2 rounded-full hover:bg-white/60 text-gray-600"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Grid */}
                {hasPicks ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {data.results.map((profile, idx) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.3 }}
                            >
                                <DailyPickCard profile={profile} rank={idx + 1} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Compass}
                        title="No picks available"
                        description="We couldn't find profiles matching your preferences today. Try expanding your filters or check back tomorrow."
                        actionLabel="Discover More"
                        actionHref="/discover"
                    />
                )}

                {/* Footer CTA */}
                {hasPicks && (
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            Want more variety?
                        </p>
                        <Link href="/discover">
                            <Button variant="secondary">
                                <Compass className="w-4 h-4 mr-2" />
                                Browse Everyone
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}