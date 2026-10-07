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

  // ---------- Settings ----------
  changeEmail: async (newEmail: string, password: string): Promise<void> => {
    await api.post("/auth/change-email/", { new_email: newEmail, password });
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<void> => {
    await api.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },

  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout-all/");
  },

  deleteAccount: async (password: string, confirmation: string): Promise<void> => {
    await api.delete("/auth/delete-account/", {
      data: { password, confirmation },
    });
  },
};