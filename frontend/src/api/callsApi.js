import api from "./axios";

export const startCall = async (payload) => {
  const response = await api.post("/api/calls/start", payload);
  return response.data;
};

export const acceptCall = async (callId) => {
  const response = await api.post(`/api/calls/accept/${callId}`);
  return response.data;
};

export const declineCall = async (callId, reason = "declined") => {
  const response = await api.post(`/api/calls/decline/${callId}`, { reason });
  return response.data;
};

export const endCall = async (callId) => {
  const response = await api.post(`/api/calls/end/${callId}`);
  return response.data;
};

