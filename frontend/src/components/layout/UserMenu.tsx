"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User as UserIcon,
    Settings,
    Ban,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/auth";
import { notify } from "@/lib/toast";
import clsx from "clsx";

export function UserMenu() {
    const router = useRouter();
    const { user, profile, logout } = useAuthStore();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    const handleLogout = async () => {
        await authApi.logout();
        logout();
        notify.success("Logged out.");
        router.push("/login");
    };

    if (!user) return null;

    const initial = user.email?.[0]?.toUpperCase() || "U";
    const hasPhoto = !!profile?.photo;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full hover:bg-gray-100 pl-0.5 pr-2 py-0.5 transition"
                aria-label="Account menu"
            >
                {hasPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={profile!.photo!}
                        alt={profile!.display_name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-pink-200"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {initial}
                    </div>
                )}
                <ChevronDown
                    className={clsx(
                        "w-4 h-4 text-gray-500 transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
                        {hasPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile!.photo!}
                                alt={profile!.display_name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
                                {initial}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {profile?.display_name || "No profile yet"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>

                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        View profile
                    </Link>

                    <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                        <Settings className="w-4 h-4 text-gray-500" />
                        Settings
                    </Link>

                    <Link
                        href="/settings/blocked"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                        <Ban className="w-4 h-4 text-gray-500" />
                        Blocked users
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                        onClick={() => {
                            setOpen(false);
                            handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}