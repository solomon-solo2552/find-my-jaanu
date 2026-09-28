"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrateFromStorage, setUser, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    // After hydration, if we have a token, fetch the user
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setUser(null);
      return;
    }

    authApi
      .me()
      .then((user) => setUser(user))
      .catch(() => {
        logout();
      });
  }, [setUser, logout, isAuthenticated]);

  return <>{children}</>;
}