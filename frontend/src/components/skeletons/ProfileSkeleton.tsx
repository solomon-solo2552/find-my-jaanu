import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}