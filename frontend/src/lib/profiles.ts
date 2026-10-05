import api from "./api";

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(
    /\/api\/?$/,
    ""
  );


export const photoUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (/^http?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : "/" + path}`;
};

export interface Interest {
  id: number;
  name: string;
  emoji: string;
}

export interface Photo {
  id: string;
  image: string;
  is_primary: boolean;
  order: number;
  uploaded_at: string;
}

export interface ProfileRelation {
  is_self: boolean;
  liked_by_me: boolean;
  passed_by_me: boolean;
  matched: boolean;
  match_id: string | null;
  blocked_by_me: boolean;
  blocked_me: boolean;
}

export interface Profile {
  id: string;
  user_email: string;
  display_name: string;
  bio: string;
  date_of_birth: string;
  age: number;
  gender: "M" | "F" | "NB" | "P";
  interested_in: "M" | "F" | "NB" | "P";
  city: string;
  country: string;
  latitude: string | null;
  longitude: string | null;
  is_visible: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
  interests: Interest[];
  photos: Photo[];
  relation?: ProfileRelation;
}

export interface ProfileWritePayload {
  display_name?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: "M" | "F" | "NB" | "P";
  interested_in?: "M" | "F" | "NB" | "P";
  city?: string;
  country?: string;
  latitude?: string | null;
  longitude?: string | null;
  is_visible?: boolean;
  interest_ids?: number[];
}

export const profilesApi = {
  // Own profile
  getMyProfile: async (): Promise<Profile | null> => {
    try {
      const res = await api.get("/profiles/me/");
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  createMyProfile: async (payload: ProfileWritePayload): Promise<Profile> => {
    const res = await api.post("/profiles/me/", payload);
    return res.data;
  },

  updateMyProfile: async (payload: ProfileWritePayload): Promise<Profile> => {
    const res = await api.patch("/profiles/me/", payload);
    return res.data;
  },

  // Others
  getProfile: async (id: string): Promise<Profile> => {
    const res = await api.get(`/profiles/${id}/`);
    return res.data;
  },

  browse: async (params?: Record<string, string | number>): Promise<{ results: Profile[] }> => {
    const res = await api.get("/profiles/", { params });
    return res.data;
  },

  // Interests
  listInterests: async (): Promise<Interest[]> => {
    const res = await api.get("/interests/");
    return res.data;
  },

  // Photos
  listMyPhotos: async (): Promise<Photo[]> => {
    const res = await api.get("/profiles/me/photos/");
    return res.data;
  },

  uploadPhoto: async (file: File, order: number = 0): Promise<Photo> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("order", String(order));
    const res = await api.post("/profiles/me/photos/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deletePhoto: async (id: string): Promise<void> => {
    await api.delete(`/profiles/me/photos/${id}/`);
  },
};