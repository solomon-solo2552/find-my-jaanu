import { Skeleton } from "@/components/ui/Skeleton";
import { ChatSkeleton } from "@/components/skeletons/ChatSkeleton";

export default function Loading() {
  return (
    <main className="h-[calc(100vh-60px)] sm:h-screen flex flex-col bg-pink-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </header>
      <ChatSkeleton />
    </main>
  );
}