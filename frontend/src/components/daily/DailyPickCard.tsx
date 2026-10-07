"use client";

import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Profile, photoUrl } from "@/lib/profiles";

interface Props {
    profile: Profile;
    rank: number;
}

export function DailyPickCard({ profile, rank }: Props) {
    const primary = profile.photos.find((p) => p.is_primary) || profile.photos[0];

    return (
        <Link
            href={`/profile/${profile.id}`}
            className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-100 to-pink-100 aspect-[3/4] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
            {/* Photo */}
            {primary ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={photoUrl(primary.image)}
                    alt={profile.display_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-pink-600 font-bold text-3xl">
                    {profile.display_name[0].toUpperCase()}
                </div>
            )}

            {/* Rank badge */}
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
                #{rank}
            </div>

            {/* Sparkle icon */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-yellow-600" />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg leading-tight">
                    {profile.display_name}, {profile.age}
                </h3>
                {profile.city && (
                    <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                    </p>
                )}
                {profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {profile.interests.slice(0, 2).map((i) => (
                            <span
                                key={i.id}
                                className="text-[10px] bg-white/25 backdrop-blur px-2 py-0.5 rounded-full"
                            >
                                {i.emoji} {i.name}
                            </span>
                        ))}
                        {profile.interests.length > 2 && (
                            <span className="text-[10px] bg-white/25 backdrop-blur px-2 py-0.5 rounded-full">
                                +{profile.interests.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}