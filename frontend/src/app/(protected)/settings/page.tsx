"use client";

import Link from "next/link";
import {
    ChevronRight,
    Mail,
    Lock,
    Shield,
    Eye,
    UserX,
    LogOut,
    Ban,
} from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth";
import { notify, errorMessage } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
    return (
        <RequireAuth>
            <Settings />
        </RequireAuth>
    );
}

function Settings() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogoutAll = async () => {
        setLoggingOut(true);
        try {
            await authApi.logoutAll();
            notify.success("Logged out from all devices.");
            logout();
            router.push("/login");
        } catch (err) {
            notify.error(errorMessage(err, "Failed to log out everywhere."));
            setLoggingOut(false);
            setConfirmLogoutAll(false);
        }
    };

    const sections = [
        {
            title: "Account",
            items: [
                {
                    icon: Mail,
                    label: "Change Email",
                    description: user?.email,
                    href: "/settings/email",
                },
                {
                    icon: Lock,
                    label: "Change Password",
                    description: "Keep your account secure",
                    href: "/settings/password",
                },
            ],
        },
        {
            title: "Privacy",
            items: [
                {
                    icon: Eye,
                    label: "Profile Visibility",
                    description: "Hide your profile from discovery",
                    href: "/settings/visibility",
                },
                {
                    icon: Ban,
                    label: "Blocked Users",
                    description: "Manage your blocked list",
                    href: "/settings/blocked",
                },
            ],
        },
        {
            title: "Security",
            items: [
                {
                    icon: Shield,
                    label: "Active Sessions",
                    description: "Log out from all devices",
                    onClick: () => setConfirmLogoutAll(true),
                },
            ],
        },
    ];

    return (
        <main className="min-h-screen bg-pink-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-pink-600 mb-6">Settings</h1>

                <div className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
                                {section.title}
                            </h2>
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const content = (
                                        <>
                                            <Icon className="w-5 h-5 text-pink-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                {item.description && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </>
                                    );

                                    return item.href ? (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition"
                                        >
                                            {content}
                                        </Link>
                                    ) : (
                                        <button
                                            key={item.label}
                                            onClick={item.onClick}
                                            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition text-left"
                                        >
                                            {content}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Danger Zone */}
                    <div>
                        <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wide px-1 mb-2">
                            Danger Zone
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <Link
                                href="/settings/delete"
                                className="flex items-center gap-4 px-4 py-3.5 hover:bg-red-50 transition"
                            >
                                <UserX className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-600">Delete Account</p>
                                    <p className="text-sm text-gray-500">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmLogoutAll}
                title="Log out from all devices?"
                description="You'll be signed out everywhere, including on any other phones or browsers."
                confirmLabel="Log Out Everywhere"
                destructive
                loading={loggingOut}
                onConfirm={handleLogoutAll}
                onCancel={() => setConfirmLogoutAll(false)}
            />
        </main>
    );
}