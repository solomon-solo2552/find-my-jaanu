import api from "./api";

export type ReportReason =
  | "spam"
  | "harassment"
  | "fake"
  | "inappropriate"
  | "other";

export interface BlockedUser {
  id: string;
  blocked: string;
  blocked_display_name: string;
  blocked_photo: string | null;
  created_at: string;
}

export const safetyApi = {
  report: async (
    profileId: string,
    reason: ReportReason,
    details: string = ""
  ): Promise<void> => {
    await api.post(`/safety/report/${profileId}/`, { reason, details });
  },

  block: async (profileId: string): Promise<void> => {
    await api.post(`/safety/block/${profileId}/`);
  },

  unblock: async (profileId: string): Promise<void> => {
    await api.delete(`/safety/block/${profileId}/`);
  },

  listBlocked: async (): Promise<{ results: BlockedUser[] }> => {
    const res = await api.get("/safety/blocked/");
    return res.data;
  },
};