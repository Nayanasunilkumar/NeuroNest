import axios from "./axios";

export const getLatestVitals = async (patientId = null) => {
  const suffix = patientId ? `?patient_id=${patientId}` : "";
  const response = await axios.get(`/api/vitals/latest${suffix}`);
  return response.data;
};

export const getVitalsHistory = async (patientId = null, limit = 60) => {
  const params = new URLSearchParams();
  if (patientId) params.append("patient_id", patientId);
  if (limit) params.append("limit", String(limit));
  const query = params.toString();
  const response = await axios.get(`/api/vitals/history${query ? `?${query}` : ""}`);
  return response.data;
};

export const getMonitoredPatients = async () => {
  const response = await axios.get("/api/vitals/monitored-patients");
  return response.data;
};

export const getVitalsDevices = async () => {
  const response = await axios.get("/api/vitals/devices");
  return response.data;
};
