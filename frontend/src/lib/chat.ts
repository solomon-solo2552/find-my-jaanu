import api from "./api";

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    message_type: "text" | "image" | "system";
    is_read: boolean;
    created_at: string;
    image: string | null;
}


export interface MatchInfo {
    match_id: string;
    other_profile: {
        id: string;
        display_name: string;
        photo: string | null;
        is_featured: boolean;
        featured_note: string;
    };
}

export interface GifResult {
    id: string;
    url: string;
    preview: string;
    width: number;
    height: number;
}


export const chatApi = {
    getMatchInfo: async (matchId: string): Promise<MatchInfo> => {
        const res = await api.get(`/chat/${matchId}/info/`);
        return res.data;
    },

    getMessages: async (matchId: string): Promise<{ results: Message[] }> => {
        const res = await api.get(`/chat/${matchId}/messages/`);
        return res.data;
    },

    sendMessage: async (matchId: string, content: string): Promise<Message> => {
        const res = await api.post(`/chat/${matchId}/send/`, { content });
        return res.data;
    },

    sendImage: async (matchId: string, file: File, caption = ""): Promise<Message> => {
        const formData = new FormData();
        formData.append("image", file);
        if (caption) formData.append("content", caption);

        const res = await api.post(`/chat/${matchId}/send/`, formData, {
            headers: { "Content-Type": "multipart/form-data " },
        });
        return res.data;
    },

    sendGif: async (matchId: string, gifUrl: string): Promise<Message> => {
        const res = await api.post(`/chat/${matchId}/send/`, { gif_url: gifUrl });
        return res.data;
    },

    searchGifs: async (query: string): Promise<{ results: GifResult[] }> => {
        const res = await api.get("/chat/gifs/search/", { params: { q: query } });
        return res.data;
    },
};