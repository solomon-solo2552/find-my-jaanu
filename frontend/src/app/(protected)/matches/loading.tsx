import { MatchesSkeleton } from "@/components/skeletons/MatchesSkeleton";


export default function Loading() {
    return (
        <main className="min-h-screen bg-pink-50 py-6 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-pink-600 mb-6">Matches</h1>
                <MatchesSkeleton />
            </div>
        </main>
    );
}