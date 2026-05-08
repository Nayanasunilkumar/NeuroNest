import axios from "./axios";

/**
 * Fetches alerts from the system.
 * @param {boolean} unacknowledged - If true, only fetches unacknowledged alerts.
 */
export const fetchAlerts = async (unacknowledged = false) => {
  const response = await axios.get("/api/alerts", {
    params: unacknowledged ? { unacknowledged: true } : {}
  });
  return response.data;
};

/**
 * Alias for fetchAlerts to maintain backward compatibility.
 */
export const getAlerts = fetchAlerts;

/**
 * Acknowledges a specific alert.
 * @param {string|number} id - The ID of the alert to acknowledge.
 */
export const acknowledgeAlert = async (id) => {
  const response = await axios.patch(`/api/alerts/${id}/acknowledge`);
  return response.data;
};
