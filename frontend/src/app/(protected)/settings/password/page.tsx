"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";
import { notify, errorMessage } from "@/lib/toast";

const schema = z
    .object({
        current_password: z.string().min(1, "Current password required"),
        new_password: z.string().min(8, "At least 8 characters"),
        new_password_confirm: z.string(),
    })
    .refine((d) => d.new_password === d.new_password_confirm, {
        message: "Passwords don't match",
        path: ["new_password_confirm"],
    });

type Form = z.infer<typeof schema>;

export default function ChangePasswordPage() {
    return (
        <RequireAuth>
            <ChangePassword />
        </RequireAuth>
    );
}

function ChangePassword() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm<Form>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: Form) => {
        setServerError(null);
        setSubmitting(true);
        try {
            await authApi.changePassword(
                data.current_password,
                data.new_password,
                data.new_password_confirm
            );
            setShowConfirm(true);
        } catch (err: any) {
            const msg = errorMessage(err, "Failed to change password.");
            notify.error(msg);
            setServerError(msg);
            setSubmitting(false);
        }
    };

    const handleReLogin = () => {
        logout();
        router.push("/login");
    };

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
                    <h1 className="text-xl font-bold text-pink-600 mb-1">Change Password</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        You&apos;ll be signed out from all devices after changing your password.
                    </p>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Current password"
                            type="password"
                            error={form.formState.errors.current_password?.message}
                            {...form.register("current_password")}
                        />
                        <Input
                            label="New password"
                            type="password"
                            placeholder="At least 8 characters"
                            error={form.formState.errors.new_password?.message}
                            {...form.register("new_password")}
                        />
                        <Input
                            label="Confirm new password"
                            type="password"
                            error={form.formState.errors.new_password_confirm?.message}
                            {...form.register("new_password_confirm")}
                        />

                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-800">
                                Changing your password will sign you out of all devices.
                            </p>
                        </div>

                        {serverError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" loading={submitting} className="w-full">
                            Update Password
                        </Button>
                    </form>
                </div>
            </div>

            <ConfirmDialog
                open={showConfirm}
                title="Password updated!"
                description="For your security, we've signed you out of all devices. Please log in again with your new password."
                confirmLabel="Log In Again"
                cancelLabel="Later"
                onConfirm={handleReLogin}
                onCancel={() => {
                    setShowConfirm(false);
                    router.push("/settings");
                }}
            />
        </main>
    );
}