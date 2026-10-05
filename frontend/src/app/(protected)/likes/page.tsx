"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Heart, Sparkles, Compass, Crown } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LikeGrid } from "@/components/likes/LikeGrid";
import { matchesApi, LikeEntry } from "@/lib/matches";
import { notify, errorMessage } from "@/lib/toast";
import clsx from "clsx";

type Tab = "received" | "sent";

export default function LikesPage() {
  return (
    <RequireAuth>
      <Likes />
    </RequireAuth>
  );
}

function Likes() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<LikeEntry[]>([]);
  const [sent, setSent] = useState<LikeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recv, snt] = await Promise.all([
        matchesApi.likesReceived(),
        matchesApi.likesSent(),
      ]);
      setReceived(recv.results);
      setSent(snt.results);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to load likes."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLikeBack = async (like: LikeEntry) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await matchesApi.like(like.other_profile.id);
      if (res.matched) {
        notify.success(`It's a match with ${like.other_profile.display_name}! 🎉`);
        router.push(`/chat/${res.match?.id}`);
      } else {
        notify.success("Liked!");
        // Remove from received list
        setReceived((prev) => prev.filter((l) => l.id !== like.id));
      }
    } catch (err) {
      notify.error(errorMessage(err, "Failed to like back."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  const currentList = tab === "received" ? received : sent;

  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-pink-600">Likes</h1>
          <button
            onClick={load}
            className="p-2 rounded-full hover:bg-white/60 text-gray-600"
            title="Refresh"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex mb-6 shadow-sm">
          <button
            onClick={() => setTab("received")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2",
              tab === "received"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Heart
              className={clsx(
                "w-4 h-4",
                tab === "received" ? "fill-white" : "fill-none"
              )}
            />
            Likes You
            {received.length > 0 && (
              <span
                className={clsx(
                  "text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center",
                  tab === "received"
                    ? "bg-white text-pink-600"
                    : "bg-pink-600 text-white"
                )}
              >
                {received.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("sent")}
            className={clsx(
              "flex-1 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2",
              tab === "sent"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            You Liked
            {sent.length > 0 && (
              <span
                className={clsx(
                  "text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center",
                  tab === "sent"
                    ? "bg-white text-pink-600"
                    : "bg-pink-600 text-white"
                )}
              >
                {sent.length}
              </span>
            )}
          </button>
        </div>

        {/* Premium teaser */}
        {tab === "received" && received.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-yellow-100 to-pink-100 border border-yellow-200 flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">
                {received.length} {received.length === 1 ? "person likes" : "people like"} you
              </p>
              <p className="text-gray-600 text-xs">
                Like them back to match instantly!
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {currentList.length === 0 ? (
          tab === "received" ? (
            <EmptyState
              icon={Heart}
              title="No likes yet"
              description="When someone likes your profile, you'll see them here. Keep swiping to get noticed!"
              actionLabel="Discover People"
              actionHref="/discover"
            />
          ) : (
            <EmptyState
              icon={Compass}
              title="You haven't liked anyone yet"
              description="Start discovering and swipe right on people you like. They'll show up here."
              actionLabel="Discover People"
              actionHref="/discover"
            />
          )
        ) : (
          <LikeGrid
            likes={currentList}
            showLikeBack={tab === "received"}
            onLikeBack={handleLikeBack}
          />
        )}
      </div>
    </main>
  );
}