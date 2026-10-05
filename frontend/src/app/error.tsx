"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8">
        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </main>
  );
}