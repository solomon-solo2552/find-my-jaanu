import api from "./api";

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    message_type: "text" | "image" | "system";
    is_read: boolean;
    created_at: string;
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
};