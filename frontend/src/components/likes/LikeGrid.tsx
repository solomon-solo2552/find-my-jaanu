"use client";

import Link from "next/link";
import { Heart, Crown } from "lucide-react";
import { LikeEntry } from "@/lib/matches";
import { photoUrl } from "@/lib/profiles";

interface Props {
  likes: LikeEntry[];
  onLikeBack?: (like: LikeEntry) => void;
  showLikeBack?: boolean;
}

export function LikeGrid({ likes, onLikeBack, showLikeBack }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {likes.map((like) => {
        const p = like.other_profile;
        const primary = p.photos.find((ph) => ph.is_primary) || p.photos[0];

        return (
          <div
            key={like.id}
            className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] hover:shadow-lg hover:-translate-y-0.5 transition-all duration 200"
          >
            {/* Photo (links to profile) */}
            <Link href={`/profile/${p.id}`} className="block w-full h-full">
              {primary ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl(primary.image)}
                  alt={p.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {p.display_name[0].toUpperCase()}
                </div>
              )}

              {/* Gradient + name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
                <p className="font-semibold truncate flex items-center gap-1">
                  {p.display_name}, {p.age}
                  {p.is_featured && (
                    <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  )}
                </p>
                {p.city && (
                  <p className="text-xs text-white/80 truncate">{p.city}</p>
                )}
              </div>

              {/* New badge (green ring for fresh) */}
              {!like.is_super_like && (
                <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-pink-500 border-2 border-white" />
              )}
              {like.is_super_like && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ⭐ SUPER
                </span>
              )}
            </Link>

            {/* Like Back button (only in "Likes You" tab) */}
            {showLikeBack && onLikeBack && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLikeBack(like);
                }}
                className="absolute bottom-14 left-3 right-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold py-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg flex items-center justify-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Like Back
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}