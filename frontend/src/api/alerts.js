import axios from "./axios";

export const getAlerts = async (unacknowledged = false) => {
  const query = unacknowledged ? "?unacknowledged=true" : "";
  const response = await axios.get(`/api/alerts${query}`);
  return response.data;
};

export const acknowledgeAlert = async (id) => {
  const response = await axios.patch(`/alerts/${id}/acknowledge`);
  return response.data;
};
