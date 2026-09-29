"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Button } from "@/components/ui/Button";

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatPlaceholder />
    </RequireAuth>
  );
}

function ChatPlaceholder() {
  const params = useParams();
  const matchId = params.matchId as string;

  return (
    <main className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/matches"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Matches
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <MessageCircle className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Chat coming soon
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Real-time messaging will be live tomorrow.
          </p>
          <p className="text-xs text-gray-400">
            Match ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{matchId}</code>
          </p>
          <div className="mt-6">
            <Link href="/matches">
              <Button variant="secondary">Back to Matches</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}