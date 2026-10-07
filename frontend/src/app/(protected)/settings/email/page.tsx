"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";
import { notify, errorMessage } from "@/lib/toast";

const schema = z.object({
    new_email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password required"),
});

type Form = z.infer<typeof schema>;

export default function ChangeEmailPage() {
    return (
        <RequireAuth>
            <ChangeEmail />
        </RequireAuth>
    );
}

function ChangeEmail() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { new_email: user?.email || "", password: "" },
    });

    const onSubmit = async (data: Form) => {
        setServerError(null);
        setSubmitting(true);
        try {
            await authApi.changeEmail(data.new_email, data.password);
            // Refresh user from /me so store reflects new email
            const fresh = await authApi.me();
            setUser(fresh);
            notify.success("Email updated!");
            router.push("/settings");
        } catch (err: any) {
            const msg = errorMessage(err, "Failed to update email.");
            notify.error(msg);
            setServerError(msg);
        } finally {
            setSubmitting(false);
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
                    <h1 className="text-xl font-bold text-pink-600 mb-1">Change Email</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Your current email is <strong>{user?.email}</strong>
                    </p>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="New email"
                            type="email"
                            error={form.formState.errors.new_email?.message}
                            {...form.register("new_email")}
                        />
                        <Input
                            label="Current password"
                            type="password"
                            placeholder="Confirm your identity"
                            error={form.formState.errors.password?.message}
                            {...form.register("password")}
                        />

                        {serverError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" loading={submitting} className="w-full">
                            Update Email
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}