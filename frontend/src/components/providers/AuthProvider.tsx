"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/auth";
import { profilesApi, photoUrl } from "@/lib/profiles";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrateFromStorage, setUser, setProfile, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    // After hydration, if we have a token, fetch the user
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setUser(null);
      setProfile(null);
      return;
    }

    (async () => {
      try {
        const user = await authApi.me();
        setUser(user);

        try {
          const profile = await profilesApi.getMyProfile();
          if (profile) {
            const primary = profile.photos.find((p) => p.is_primary) || profile.photos[0];

            setProfile({
              id: profile.id,
              display_name: profile.display_name,
              is_featured: profile.is_featured,
              photo: primary ? photoUrl(primary.image) : null,
            });
          }
        } catch {
          // profile may not exist yet (user hasn't onboarded)
          setProfile(null);
        }
      } catch {
        logout();
      }
    })();
  }, [setUser, setProfile, logout, isAuthenticated]);

  return <>{children}</>
}