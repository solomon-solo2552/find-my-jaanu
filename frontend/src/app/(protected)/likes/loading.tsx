import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}