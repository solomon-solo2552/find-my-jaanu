"use client";

import Link from "next/link";
import { MessageCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Match } from "@/lib/matches";
import { formatRelativeTime } from "@/lib/time";

interface Props {
  match: Match;
  onUnmatch: (match: Match) => void;
}

export function MatchCard({ match, onUnmatch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const other = match.other_profile;
  const primaryPhoto = other.photos.find((p) => p.is_primary) || other.photos[0];
  const hasMessages = !!match.last_message;

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
      <Link href={`/chat/${match.id}`} className="flex items-center gap-4 p-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {primaryPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryPhoto.image}
              alt={other.display_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg">
              {other.display_name[0].toUpperCase()}
            </div>
          )}
          {!hasMessages && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {other.display_name}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatRelativeTime(match.last_message?.created_at || match.matched_at)}
            </span>
          </div>

          {hasMessages ? (
            <p className="text-sm text-gray-600 truncate mt-1">
              {match.last_message!.content}
            </p>
          ) : (
            <p className="text-sm text-pink-600 font-medium mt-1">
              Say hi 👋 — you just matched!
            </p>
          )}
        </div>
      </Link>

      {/* Menu button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen((v) => !v);
        }}
        className="absolute top-1/2 -translate-y-1/2 right-12 p-2 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 mt-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={() => {
                setMenuOpen(false);
                onUnmatch(match);
              }}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
            >
              Unmatch
            </button>
          </div>
        </>
      )}
    </div>
  );
}