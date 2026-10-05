import { Skeleton } from "@/components/ui/Skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {/* Incoming message */}
      <div className="flex flex-col items-start gap-1 max-w-[70%]">
        <Skeleton className="h-10 w-48 rounded-2xl" />
        <Skeleton className="h-2 w-12" />
      </div>
      {/* Outgoing message */}
      <div className="flex flex-col items-end self-end gap-1 max-w-[70%]">
        <Skeleton className="h-10 w-40 rounded-2xl" />
        <Skeleton className="h-2 w-12" />
      </div>
      {/* Incoming long message */}
      <div className="flex flex-col items-start gap-1 max-w-[70%]">
        <Skeleton className="h-16 w-64 rounded-2xl" />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  );
}