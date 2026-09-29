"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, MapPin, Edit, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { profilesApi, Profile, photoUrl } from "@/lib/profiles";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}

function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profilesApi
      .getMyProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">You haven&apos;t created a profile yet.</p>
        <Link href="/onboarding">
          <Button>Create Profile</Button>
        </Link>
      </div>
    );
  }

  const primaryPhoto = profile.photos.find((p) => p.is_primary) || profile.photos[0];

  return (
    <main className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Main photo */}
          <div className="relative aspect-[4/5] bg-gray-100">
            {primaryPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl(primaryPhoto.image)}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No photo yet
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.display_name}, {profile.age}
                </h1>
                {(profile.city || profile.country) && (
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <Link href="/profile/edit">
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>

            {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}

            {profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <span
                    key={i.id}
                    className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium"
                  >
                    {i.emoji} {i.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* All photos */}
          {profile.photos.length > 1 && (
            <div className="border-t border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-2">All photos</p>
              <div className="grid grid-cols-4 gap-2">
                {profile.photos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl(p.image)} alt="" className="w-full h-full object-cover" />
                    {p.is_primary && (
                      <Star className="w-3 h-3 fill-pink-600 text-pink-600 absolute top-1 right-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}