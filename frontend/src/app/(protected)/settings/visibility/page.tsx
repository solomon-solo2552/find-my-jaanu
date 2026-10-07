"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { profilesApi } from "@/lib/profiles";
import { notify, errorMessage } from "@/lib/toast";

export default function VisibilityPage() {
    return (
        <RequireAuth>
            <Visibility />
        </RequireAuth>
    );
}

function Visibility() {
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const profile = await profilesApi.getMyProfile();
                if (profile) setVisible(profile.is_visible);
            } catch (err) {
                notify.error(errorMessage(err, "Failed to load profile."));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleToggle = async () => {
        setUpdating(true);
        try {
            const updated = await profilesApi.updateMyProfile({
                is_visible: !visible,
            });
            setVisible(updated.is_visible);
            notify.success(
                updated.is_visible
                    ? "Your profile is now visible."
                    : "Your profile is hidden from discovery."
            );
        } catch (err) {
            notify.error(errorMessage(err, "Failed to update."));
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-pink-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                <Link
                    href="/settings"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Settings
                </Link>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h1 className="text-xl font-bold text-pink-600 mb-1">Profile Visibility</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Control whether others can see your profile in Discover.
                    </p>

                    <button
                        onClick={handleToggle}
                        disabled={updating}
                        className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${visible
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                            } disabled:opacity-50`}
                    >
                        {visible ? (
                            <Eye className="w-8 h-8 text-green-600 flex-shrink-0" />
                        ) : (
                            <EyeOff className="w-8 h-8 text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">
                                {visible ? "Visible" : "Hidden"}
                            </p>
                            <p className="text-sm text-gray-600">
                                {visible
                                    ? "People can find and match with you."
                                    : "Your profile is hidden. You won't appear in Discover."}
                            </p>
                        </div>
                        <div
                            className={`w-12 h-7 rounded-full transition relative flex-shrink-0 ${visible ? "bg-green-500" : "bg-gray-300"
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${visible ? "left-[22px]" : "left-0.5"
                                    }`}
                            />
                        </div>
                    </button>
                </div>
            </div>
        </main>
    );
}