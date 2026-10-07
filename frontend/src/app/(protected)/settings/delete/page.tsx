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

const schema = z.object({
    password: z.string().min(1, "Password required"),
    confirmation: z.literal("DELETE", {
        errorMap: () => ({ message: 'Type "DELETE" exactly' }),
    }),
});

type Form = z.infer<typeof schema>;

export default function DeleteAccountPage() {
    return (
        <RequireAuth>
            <DeleteAccount />
        </RequireAuth>
    );
}

function DeleteAccount() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState<Form | null>(null);

    const form = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { password: "", confirmation: "" },
    });

    const onSubmit = (data: Form) => {
        setPendingData(data);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (!pendingData) return;
        setSubmitting(true);
        setServerError(null);
        try {
            await authApi.deleteAccount(pendingData.password, pendingData.confirmation);
            logout();
            notify.success("Account deleted. Goodbye! 💔");
            router.push("/");
        } catch (err: any) {
            const msg = errorMessage(err, "Failed to delete account.");
            notify.error(msg);
            setServerError(msg);
            setSubmitting(false);
            setShowConfirm(false);
        }
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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-red-600">Delete Account</h1>
                            <p className="text-xs text-gray-500">This action is permanent</p>
                        </div>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                        <p className="text-sm text-red-800 font-medium mb-2">
                            This will permanently delete:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                            <li>Your profile and all photos</li>
                            <li>All matches and conversations</li>
                            <li>Your likes, passes, and block list</li>
                            <li>All associated account data</li>
                        </ul>
                        <p className="text-sm text-red-800 font-semibold mt-3">
                            This cannot be undone.
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Confirm your password"
                            type="password"
                            placeholder="Enter your password"
                            error={form.formState.errors.password?.message}
                            {...form.register("password")}
                        />

                        <Input
                            label='Type "DELETE" to confirm'
                            placeholder="DELETE"
                            error={form.formState.errors.confirmation?.message}
                            {...form.register("confirmation")}
                        />

                        {serverError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {serverError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={submitting}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            Delete My Account
                        </Button>
                    </form>
                </div>
            </div>

            <ConfirmDialog
                open={showConfirm}
                title="Are you absolutely sure?"
                description="Your account and all data will be permanently deleted. This action cannot be reversed."
                confirmLabel="Yes, Delete Everything"
                cancelLabel="Cancel"
                destructive
                loading={submitting}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </main>
    );
}