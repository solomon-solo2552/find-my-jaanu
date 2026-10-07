"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Settings, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/auth";
import { matchesApi } from "@/lib/matches";
import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [newMatchCount, setNewMatchCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLikesCount(0);
      setNewMatchCount(0);
      return;
    }

    let cancelled = false;

    const fetchCount = async () => {
      try {
        const [matchesRes, likesRes] = await Promise.all([
          matchesApi.list(),
          matchesApi.likesReceived(),
        ]);
        if (!cancelled) return;
        setNewMatchCount(matchesRes.results.filter((m) => !m.last_message).length);
        setLikesCount(likesRes.results.length);
      } catch {
        // ignore
      }
    };

    fetchCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-pink-600 font-bold text-xl">
          <Heart className="w-6 h-6 fill-pink-600" />
          <span className="hidden sm:inline">Find My JAANU</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/daily"
                className="relative text-sm text-gray-700 hover:text-yellow-600 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="hidden sm:inline">Daily</span>
              </Link>
              <Link
                href="/discover"
                className="text-sm text-gray-700 hover:text-pink-600 font-medium"
              >
                <span className="hidden sm:inline">Discover</span>
                <Compass className="w-5 h-5 sm:hidden" />
              </Link>
              <Link
                href="/likes"
                className="relative text-sm text-gray-700 hover:text-pink-600 font-medium"
              >
                Likes
                {likesCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {likesCount > 9 ? "9+" : likesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/matches"
                className="relative text-sm text-gray-700 hover:text-pink-600 font-medium"
              >
                Matches
                {newMatchCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-pink-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {newMatchCount > 9 ? "9+" : newMatchCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className="text-sm text-gray-700 hover:text-pink-600 font-medium"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link
                href="/settings/blocked"
                className="text-sm text-gray-700 hover:text-pink-600 font-medium hidden sm:inline"
              >
                Blocked
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}