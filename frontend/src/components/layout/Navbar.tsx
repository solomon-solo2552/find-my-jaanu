"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { matchesApi } from "@/lib/matches";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "./UserMenu";
import clsx from "clsx";

const PRIMARY_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/daily", label: "Daily" },
  { href: "/likes", label: "Likes" },
  { href: "/matches", label: "Chats" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [newMatchCount, setNewMatchCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setNewMatchCount(0);
      setLikesCount(0);
      return;
    }
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [matchesRes, likesRes] = await Promise.all([
          matchesApi.list(),
          matchesApi.likesReceived(),
        ]);
        if (cancelled) return;
        setNewMatchCount(
          matchesRes.results.filter((m) => !m.last_message).length
        );
        setLikesCount(likesRes.results.length);
      } catch {
        // silent
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const badges: Record<string, number> = {
    "/matches": newMatchCount,
    "/likes": likesCount,
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent hidden sm:inline">
            Find My JAANU
          </span>
        </Link>

        {/* Desktop primary nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {PRIMARY_LINKS.map((link) => {
              const count = badges[link.href] || 0;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "relative px-3.5 py-2 rounded-lg text-sm font-medium transition",
                    active
                      ? "text-pink-600 bg-pink-50"
                      : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-pink-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-sm">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-2 space-y-1">
            {PRIMARY_LINKS.map((link) => {
              const count = badges[link.href] || 0;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition",
                    active
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                  {count > 0 && (
                    <span className="bg-pink-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}