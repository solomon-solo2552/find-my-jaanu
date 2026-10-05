import api from "./api";
import { Profile } from "./profiles";

export interface Match {
  id: string;
  matched_at: string;
  is_active: boolean;
  other_profile: Profile;
  last_message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
}

export interface LikeResponse {
  matched: boolean;
  match: Match | null;
  detail?: string;
}

export interface LikeEntry {
  id: string;
  created_at: string;
  is_super_like: boolean;
  direction: "sent" | "received";
  already_matches: boolean;
  other_profile: Profile;
}

export const matchesApi = {
  discover: async (params?: Record<string, string>): Promise<{ results: Profile[] }> => {
    const res = await api.get("/profiles/discover/", { params });
    return res.data;
  },

  like: async (profileId: string, isSuperLike = false): Promise<LikeResponse> => {
    const res = await api.post(`/matches/like/${profileId}/`, {
      is_super_like: isSuperLike,
    });
    return res.data;
  },

  pass: async (profileId: string): Promise<void> => {
    await api.post(`/matches/pass/${profileId}/`);
  },

  list: async (): Promise<{ results: Match[] }> => {
    const res = await api.get("/matches/");
    return res.data;
  },

  unmatch: async (matchId: string): Promise<void> => {
    await api.delete(`/matches/${matchId}/unmatch/`);
  },

  likesReceived: async (): Promise<{ results: LikeEntry[] }> => {
    const res = await api.get("/matches/likes-received/");
    return res.data;
  },

  likesSent: async (): Promise<{ results: LikeEntry[] }> => {
    const res = await api.get("/matches/likes-sent/");
    return res.data;
  },
};