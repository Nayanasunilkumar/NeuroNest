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

export const getPatientContext = async (patientId) => {
    const response = await axios.get(`/api/chat/patient-context/${patientId}`);
    return response.data;
};
