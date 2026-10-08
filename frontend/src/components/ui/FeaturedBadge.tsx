"use client"

import { Crown } from "lucide-react";
import clsx from "clsx";

interface Props {
    note?: string;
    size?: "sm" | "md" | "lg";
    variant?: "icon" | "pill";
}

export function FeaturedBadge({ note, size = "sm", variant = "pill" }: Props) {
    const sizes = {
        sm: { icon: "w-3 h-3", text: "text-[10px]", pad: "px-2 py-0.5 gap-1" },
        md: { icon: "w-4 h-4", text: "text-xs", pad: "px-2.5 py-1 gap-1.5" },
        lg: { icon: "w-5 h-5", text: "text-sm", pad: "px-3 py-1.5 gap-2" },
    }[size];

    if (variant === "icon") {
        return (
            <div className="w-7 h-7 rounded-full bg-gradient-t-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-md border-2 border-white">
                <Crown className={clsx(sizes.icon, "text-white fill-white")} />
            </div>
        );
    }

    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold shadow-sm",
                sizes.pad
            )}
        >
            <Crown className={clsx(sizes.icon, "fill-white")} />
            <span className={sizes.text}>{note || "Featured"}</span>
        </span>
    );
}