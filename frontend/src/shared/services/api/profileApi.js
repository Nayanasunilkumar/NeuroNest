import axios from "./axios";

export const getMyProfile = async () => {
    const response = await axios.get("/api/profile/me");
    return response.data;
};

export const updateMyProfile = async (data) => {
    const response = await axios.put("/api/profile/me", data);
    return response.data;
};

export const getMyNotifications = async (unreadOnly = false) => {
    const response = await axios.get(`/api/profile/notifications${unreadOnly ? '?unread_only=true' : ''}`);
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await axios.patch(`/api/profile/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await axios.patch(`/api/profile/notifications/read-all`);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await axios.delete(`/api/profile/notifications/${id}`);
    return response.data;
};

export const getClinicalSummary = async () => {
    const response = await axios.get("/api/profile/clinical-summary");
    return response.data;
};

export const getConsolidatedDashboard = async () => {
    const response = await axios.get("/api/patient/dashboard/consolidated");
    return response.data;
};
