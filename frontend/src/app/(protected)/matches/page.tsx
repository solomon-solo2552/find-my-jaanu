"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Heart, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { MatchCard } from "@/components/matches/MatchCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { matchesApi, Match } from "@/lib/matches";
import { formatRelativeTime } from "@/lib/time";
import { notify, errorMessage } from "@/lib/toast";
import { MatchesSkeleton } from "@/components/skeletons/MatchesSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MatchesPage() {
  return (
    <RequireAuth>
      <Matches />
    </RequireAuth>
  );
}

function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unmatchTarget, setUnmatchTarget] = useState<Match | null>(null);
  const [unmatching, setUnmatching] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchesApi.list();
      setMatches(res.results);
    } catch {
      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = async () => {
    if (!unmatchTarget) return;
    setUnmatching(true);
    try {
      await matchesApi.unmatch(unmatchTarget.id);
      setMatches((prev) => prev.filter((m) => m.id !== unmatchTarget.id));
      setUnmatchTarget(null);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to unmatch."));
    } finally {
      setUnmatching(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-pink-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-pink-600">Matches</h1>
          </div>
          <MatchesSkeleton />
        </div>
      </main>
    );
  }

  const newMatches = matches.filter((m) => !m.last_message);
  const conversations = matches.filter((m) => !!m.last_message);

  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-pink-600">Matches</h1>
          <Link href="/discover">
            <Button size="sm" variant="secondary">
              <Compass className="w-4 h-4 mr-1" />
              Discover
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {matches.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No matches yet"
            description="Start discovering people and swipe right to match."
            actionLabel="Find Your Jaanu"
            actionHref="/discover"
          />
        ) : (
          <>
            {/* New matches row */}
            {newMatches.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  New Matches ({newMatches.length})
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {newMatches.map((match) => {
                    const other = match.other_profile;
                    const photo =
                      other.photos.find((p) => p.is_primary) || other.photos[0];
                    return (
                      <Link
                        key={match.id}
                        href={`/chat/${match.id}`}
                        className="flex-shrink-0 w-20 flex flex-col items-center"
                      >
                        <div className="relative">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo.image}
                              alt={other.display_name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-pink-500 p-0.5"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-pink-100 border-4 border-pink-500 flex items-center justify-center text-pink-600 font-bold">
                              {other.display_name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-700 mt-2 truncate w-full text-center">
                          {other.display_name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversations list */}
            {conversations.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Messages ({conversations.length})
                </h2>
                <div className="space-y-2">
                  {conversations.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onUnmatch={setUnmatchTarget}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!unmatchTarget}
        title="Unmatch?"
        description={`You'll no longer be able to chat with ${unmatchTarget?.other_profile.display_name}. This can't be undone.`}
        confirmLabel="Unmatch"
        destructive
        loading={unmatching}
        onConfirm={handleUnmatch}
        onCancel={() => setUnmatchTarget(null)}
      />
    </main>
  );
}