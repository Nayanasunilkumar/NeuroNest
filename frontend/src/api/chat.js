import axios from "./axios";

export const getConversations = async () => {
    const response = await axios.get("/api/chat/");
    return response.data;
};

export const startConversation = async (targetUserId) => {
    const response = await axios.post("/api/chat/", { target_user_id: targetUserId });
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await axios.get(`/api/chat/${conversationId}/messages`);
    return response.data;
};

export const markAsRead = async (conversationId) => {
    const response = await axios.patch(`/api/chat/${conversationId}/read`);
    return response.data;
};

export const getChatContext = async (otherUserId) => {
    const response = await axios.get(`/api/chat/chat-context/${otherUserId}`);
    return response.data;
};

export const sendMessage = async (conversationId, content, type = 'text') => {
    const response = await axios.post(`/api/chat/${conversationId}/messages`, { content, type });
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await axios.delete(`/api/chat/messages/${messageId}`);
    return response.data;
};
