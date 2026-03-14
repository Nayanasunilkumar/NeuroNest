import { API_BASE_URL } from "../config/env";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("neuronest_token")}`,
});

const baseUrl = API_BASE_URL;

export async function getMonitoredPatients() {
  const res = await fetch(`${baseUrl}/api/vitals/patients`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch monitored patients");
  return res.json();
}

export async function getLatestVitals(patientId) {
  const url = patientId
    ? `${baseUrl}/api/vitals/latest?patient_id=${patientId}`
    : `${baseUrl}/api/vitals/latest`;
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch vitals");
  return res.json();
}

export async function getVitalsHistory(patientId) {
  const url = patientId
    ? `${baseUrl}/api/vitals/history?patient_id=${patientId}`
    : `${baseUrl}/api/vitals/history`;
  const res = await fetch(url, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch vitals history");
  return res.json();
}
