"use client"

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
    initialSeconds: number;
}

export function ResetTimer({ initialSeconds }: Props) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className="inline-flex items-center gap-1.5 text-xs bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border-yellow-300 text-yellow-900 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>New picks in</span>
            <span className="font-mono tabular-nums font-bold">
                {pad(hours)}:{pad(mins)}:{pad(secs)}
            </span>
        </div>
    );
}