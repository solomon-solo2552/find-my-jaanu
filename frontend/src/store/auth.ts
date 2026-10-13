import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface ProfileLite {
  id: string;
  display_name: string;
  is_featured: boolean;
  photo: string | null;
}

interface AuthState {
  user: User | null;
  profileId: string | null;
  profile: ProfileLite | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: ProfileLite | null) => void;    // ← was missing
  setProfileId: (id: string | null) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profileId: null,
  profile: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, access, refresh) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
    }
    set({
      user,
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  setProfile: (profile) => set({ profile }),    // ← was missing

  setProfileId: (id) => set({ profileId: id }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({
      user: null,
      profileId: null,
      profile: null,    // ← was missing
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: !!access,
      isLoading: false,
    });
  },
}));