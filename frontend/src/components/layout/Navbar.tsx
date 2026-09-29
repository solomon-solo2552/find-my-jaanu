"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-pink-600 font-bold text-xl">
          <Heart className="w-6 h-6 fill-pink-600" />
          Find My JAANU
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/discover" className="text-sm text-gray-700 hover:text-pink-600 font-medium">
                Discover
              </Link>
              <Link href="/matches" className="text-sm text-gray-700 hover:text:pink-600 font-medium">
                Matches
              </Link>
              <Link href="/profile" className="text-sm text-gray-700 hover:text-pink-600 font-medium">
                Profile
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
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