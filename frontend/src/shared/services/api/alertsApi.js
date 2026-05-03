import api from "./axios";

export const fetchAlerts = async (unacknowledged = false) => {
  const params = unacknowledged ? { unacknowledged: true } : {};
  const response = await api.get("/api/alerts", { params });
  return response.data;
};

export const acknowledgeAlert = async (alertId) => {
  const response = await api.patch(`/api/alerts/${alertId}/acknowledge`);
  return response.data;
};
