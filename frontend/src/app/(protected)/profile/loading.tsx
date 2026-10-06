import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <ProfileSkeleton />
      </div>
    </main>
  );
}