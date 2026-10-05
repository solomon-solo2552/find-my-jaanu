"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth";
import { notify, errorMessage } from "@/lib/toast"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const { access, refresh } = await authApi.login(data);
      // Temporarily store so the interceptor can attach the token
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      const user = await authApi.me();
      setAuth(user, access, refresh);
      notify.success("Welcome back! 💘")
      router.push("/");
    } catch (err: any) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        const msg = errorMessage(err, "Invalid email or password.");
        notify.error(msg);
        setServerError(msg);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-pink-600 text-center mb-2">
          Find My JAANU 💘
        </h1>
        <p className="text-center text-gray-600 mb-6">Welcome back</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Log In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-pink-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}