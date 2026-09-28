import api from "./api";
import { User } from "@/store/auth";

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    password_confirm: string;
  }): Promise<AuthResponse> => {
    const res = await api.post("/auth/register/", data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ access: string; refresh: string }> => {
    const res = await api.post("/auth/login/", data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get("/auth/me/");
    return res.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout/");
    } catch {
      // ignore — token may already be invalid
    }
  },
};