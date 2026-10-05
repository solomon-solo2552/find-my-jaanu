"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  MapPin,
  Heart,
  X,
  MessageCircle,
  Flag,
  Ban,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ReportModal } from "@/components/safety/ReportModal";
import { profilesApi, Profile, photoUrl } from "@/lib/profiles";
import { matchesApi } from "@/lib/matches";
import { safetyApi, ReportReason } from "@/lib/safety";
import { notify, errorMessage } from "@/lib/toast";

export default function PublicProfilePage() {
  return (
    <RequireAuth>
      <PublicProfile />
    </RequireAuth>
  );
}

function PublicProfile() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await profilesApi.getProfile(profileId);
        setProfile(data);
      } catch (err: any) {
        if (err.response?.status === 404) setError("Profile not found.");
        else setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);

  const handleLike = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const res = await matchesApi.like(profile.id);
      if (res.matched) {
        notify.success(`It's a match with ${profile.display_name}! 🎉`);
        router.push("/matches");
      } else {
        notify.success(`Liked ${profile.display_name}!`);
        router.push("/discover");
      }
    } catch (err) {
      notify.error(errorMessage(err, "Failed to like."));
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      await matchesApi.pass(profile.id);
      notify.info(`Passed ${profile.display_name}.`);
      router.push("/discover");
    } catch (err) {
      notify.error(errorMessage(err, "Failed to pass."));
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    setBlocking(true);
    try {
      await safetyApi.block(profile.id);
      notify.success(`Blocked ${profile.display_name}.`);
      router.push("/discover");
    } catch (err) {
      notify.error(errorMessage(err, "Failed to block."));
      setBlocking(false);
      setConfirmBlock(false);
    }
  };

  const handleReport = async (reason: ReportReason, details: string) => {
    if (!profile) return;
    try {
      await safetyApi.report(profile.id, reason, details);
      notify.success("Report submitted. Thanks for keeping JAANU safe.");
      setConfirmBlock(true);
    } catch (err) {
      notify.error(errorMessage(err, "Failed to submit report."));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-pink-50 px-4">
        <p className="text-gray-600">{error || "Profile not found."}</p>
        <Link href="/discover">
          <Button>Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const primary = profile.photos[photoIndex] || profile.photos[0];
  const totalPhotos = profile.photos.length;
  const rel = profile.relation;

  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Photo carousel */}
          <div className="relative aspect-[4/5] bg-gray-100">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl(primary.image)}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No photos
              </div>
            )}

            {totalPhotos > 1 && (
              <>
                <button
                  onClick={() =>
                    setPhotoIndex((i) => (i - 1 + totalPhotos) % totalPhotos)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white shadow"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => (i + 1) % totalPhotos)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white shadow"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>

                {/* Dots */}
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
                  {profile.photos.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === photoIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="mb-3">
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

            {profile.bio && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{profile.bio}</p>
            )}

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

          {/* Actions */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            {rel?.matched && rel.match_id ? (
              <div className="flex gap-2">
                <Link href={`/chat/${rel.match_id}`} className="flex-1">
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </Link>
              </div>
            ) : rel?.blocked_by_me ? (
              <div className="text-center text-sm text-gray-600 py-2">
                You&apos;ve blocked this person.
              </div>
            ) : rel?.blocked_me ? (
              <div className="text-center text-sm text-gray-600 py-2">
                This person has blocked you.
              </div>
            ) : rel?.liked_by_me ? (
              <div className="text-center text-sm text-pink-600 font-medium py-2 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                You liked {profile.display_name}. Waiting for them to like back.
              </div>
            ) : rel?.passed_by_me ? (
              <div className="flex gap-2">
                <div className="flex-1 text-center text-sm text-gray-500 py-2">
                  You passed on this profile.
                </div>
                <Button
                  onClick={() => router.push("/discover")}
                  variant="secondary"
                >
                  Keep Swiping
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePass}
                  disabled={actionLoading}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-red-500" />
                </button>

                <button
                  onClick={handleLike}
                  disabled={actionLoading}
                  className="flex-1 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  Like
                </button>

                <button
                  onClick={() => setReportOpen(true)}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition"
                  title="Report"
                >
                  <Flag className="w-5 h-5 text-orange-500" />
                </button>

                <button
                  onClick={() => setConfirmBlock(true)}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition"
                  title="Block"
                >
                  <Ban className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        displayName={profile.display_name}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />

      <ConfirmDialog
        open={confirmBlock}
        title="Block this user?"
        description={`${profile.display_name} won't be able to see you or message you. Any match between you will end.`}
        confirmLabel="Block"
        destructive
        loading={blocking}
        onConfirm={handleBlock}
        onCancel={() => setConfirmBlock(false)}
      />
    </main>
  );
}