"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Heart, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { SwipeCard } from "@/components/discover/SwipeCard";
import { MatchModal } from "@/components/discover/MatchModal";
import { Profile } from "@/lib/profiles";
import { matchesApi, Match } from "@/lib/matches";
import { notify } from "@/lib/toast";

export default function DiscoverPage() {
  return (
    <RequireAuth>
      <Discover />
    </RequireAuth>
  );
}

function Discover() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchesApi.discover();
      setProfiles(res.results);
    } catch {
      setError("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const current = profiles[0];

  const handleSwipe = async (direction: "left" | "right") => {
    if (!current || exiting) return;
    setExiting(direction);

    // Small delay for animation
    setTimeout(async () => {
      try {
        if (direction === "right") {
          const res = await matchesApi.like(current.id);
          if (res.matched && res.match) {
            setMatch(res.match);
            notify.success(`It's a match with ${res.match.other_profile.display_name}! 🎉`);
          }
        } else {
          await matchesApi.pass(current.id);
        }
      } catch (err) {
        // Silent — profile may already have been interacted with
      } finally {
        setProfiles((prev) => prev.slice(1));
        setExiting(null);
      }
    }, 220);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-sm flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-pink-600">Discover</h1>
          <button
            onClick={loadProfiles}
            className="p-2 rounded-full hover:bg-white/60"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Card stack */}
        <div className="relative flex-1 min-h-[420px] sm:min-h-[500px]">
          <AnimatePresence>
            {profiles.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow">
                <Heart className="w-12 h-12 text-pink-300 mb-3" />
                <p className="text-gray-900 font-semibold mb-1">You&apos;re all caught up!</p>
                <p className="text-sm text-gray-500 mb-4 max-w-xs">
                  No more profiles to show right now. Check back later or refresh.
                </p>
                <Button variant="secondary" onClick={loadProfiles}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              profiles
                .slice(0, 3)
                .reverse()
                .map((profile, index, arr) => {
                  const stackPosition = arr.length - 1 - index; // 0 = top
                  const isTop = stackPosition === 0;
                  return (
                    <motion.div
                      key={profile.id}
                      className="absolute inset-0"
                      style={{ zIndex: 10 - stackPosition }}
                      animate={{
                        scale: 1 - stackPosition * 0.05,
                        y: stackPosition * 12,
                        opacity: exiting && isTop ? 0 : 1,
                        x:
                          exiting && isTop
                            ? exiting === "right"
                              ? 500
                              : -500
                            : 0,
                        rotate:
                          exiting && isTop
                            ? exiting === "right"
                              ? 30
                              : -30
                            : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <SwipeCard
                        profile={profile}
                        onSwipe={handleSwipe}
                        isTop={isTop}
                      />
                    </motion.div>
                  );
                })
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {profiles.length > 0 && !exiting && (
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white shadow-lg shadow-gray-200 hover:shadow-xl hover:shadow-red-100 flex items-center justify-center hover:scale-110 transition"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 shadow-xl shadow-pink-200 hover:shadow-2xl hover:shadow-pink-300 flex items-center justify-center hover:scale-110 transition"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </button>
          </div>
        )}

        {error && <p className="text-center text-red-600 mt-4 text-sm">{error}</p>}
      </div>

      <MatchModal match={match} onClose={() => setMatch(null)} />
    </main>
  );
}