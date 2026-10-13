"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Heart, Compass } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { MatchCard } from "@/components/matches/MatchCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { matchesApi, Match } from "@/lib/matches";
import { notify, errorMessage } from "@/lib/toast";

type Tab = "chats" | "new";

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
  const [tab, setTab] = useState<Tab>("chats");

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchesApi.list();
      setMatches(res.results);
    } catch (err) {
      setError(errorMessage(err, "Failed to load matches."));
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
      notify.success("Unmatched. On to the next one 👋");
      setUnmatchTarget(null);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to unmatch."));
    } finally {
      setUnmatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  const newMatches = matches.filter((m) => !m.last_message);
  const conversations = matches.filter((m) => !!m.last_message);
  const currentList = tab === "new" ? newMatches : conversations;

  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-pink-600">
            {tab === "chats" ? "Chats" : "New Matches"}
          </h1>
          <Link href="/discover">
            <Button size="sm" variant="secondary">
              <Compass className="w-4 h-4 mr-1" />
              Discover
            </Button>
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="bg-white rounded-2xl p-1 flex mb-6 shadow-sm">
          <button
            onClick={() => setTab("chats")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2",
              tab === "chats"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Chats
            {conversations.length > 0 && (
              <span
                className={clsx(
                  "text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center",
                  tab === "chats"
                    ? "bg-white text-pink-600"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {conversations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("new")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2",
              tab === "new"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            New Matches
            {newMatches.length > 0 && (
              <span
                className={clsx(
                  "text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center",
                  tab === "new"
                    ? "bg-white text-pink-600"
                    : "bg-pink-600 text-white"
                )}
              >
                {newMatches.length}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No matches... yet 👀
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Start discovering and swipe right to match. It only takes one.
            </p>
            <Link href="/discover">
              <Button>
                <Compass className="w-4 h-4 mr-2" />
                Find Your Jaanu
              </Button>
            </Link>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {tab === "chats" ? "No conversations yet" : "No new matches"}
            </h2>
            <p className="text-sm text-gray-600">
              {tab === "chats"
                ? "Start a chat with one of your new matches."
                : "Keep swiping to get new matches."}
            </p>
          </div>
        ) : tab === "new" ? (
          // Grid of new matches
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {newMatches.map((match) => {
              const other = match.other_profile;
              const photo =
                other.photos.find((p) => p.is_primary) || other.photos[0];
              return (
                <Link
                  key={match.id}
                  href={`/chat/${match.id}`}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/60 transition"
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.image}
                      alt={other.display_name}
                      className="w-full aspect-square rounded-2xl object-cover border-4 border-pink-500 p-0.5"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-2xl bg-pink-100 border-4 border-pink-500 flex items-center justify-center text-pink-600 font-bold text-2xl">
                      {other.display_name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-700 truncate w-full text-center font-medium">
                    {other.display_name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          // List of conversations
          <div className="space-y-2">
            {conversations.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onUnmatch={setUnmatchTarget}
              />
            ))}
          </div>
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