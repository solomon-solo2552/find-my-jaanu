"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-4">
          <Heart className="w-16 h-16 text-pink-600 fill-pink-600" />
        </div>
        <h1 className="text-5xl font-bold text-pink-600 mb-4">Find My JAANU 💘</h1>
        <p className="text-lg text-gray-700 mb-8">
          Meet someone who loves chai, code, and everything in between.
        </p>

        {isAuthenticated ? (
          <Link href="/discover">
            <Button size="lg">Start Discovering</Button>
          </Link>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">Log In</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}