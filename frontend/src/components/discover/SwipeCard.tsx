"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Profile, photoUrl } from "@/lib/profiles";
import Link from "next/link";

interface Props {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export function SwipeCard({ profile, onSwipe, isTop }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [40, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -40], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 120) onSwipe("right");
    else if (info.offset.x < -120) onSwipe("left");
  };

  const primaryPhoto = profile.photos.find((p) => p.is_primary) || profile.photos[0];

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 cursor-grab select-none"
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(primaryPhoto.image)}
            alt={profile.display_name}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No photo
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* LIKE stamp */}
        {isTop && (
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-3xl px-4 py-1 rounded-lg rotate-[-15deg]"
          >
            LIKE
          </motion.div>
        )}

        {/* PASS stamp */}
        {isTop && (
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-3xl px-4 py-1 rounded-lg rotate-[15deg]"
          >
            PASS
          </motion.div>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {profile.display_name}, {profile.age}
          </h2>
          {(profile.city || profile.country) && (
            <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-white/90 mt-3 line-clamp-2">{profile.bio}</p>
          )}
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.interests.slice(0, 4).map((i) => (
                <span
                  key={i.id}
                  className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full"
                >
                  {i.emoji} {i.name}
                </span>
              ))}
            </div>
          )}

          {isTop && (
            <Link
              href={`/profile/${profile.id}`}
              className="mt-3 inline-flex items-center text-xs bg-white/20 backdrop-blur px-3 py-1.5 rounded-full hover:bg-white/30 transition pointer-events-auto"
            >
              View full profile →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}