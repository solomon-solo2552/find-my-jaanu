import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
        <div className="flex items-center justify-center gap-6 mt-6">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="w-20 h-20 rounded-full" />
        </div>
      </div>
    </main>
  );
}