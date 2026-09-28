import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, access: string, refresh: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
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

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({
      user: null,
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